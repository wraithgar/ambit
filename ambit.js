'use strict';
// Ambit.js
// (c) 2014 Michael Garvin
// Ambit may be freely distributed under the MIT license.
//
var Moment = require('moment');
var Moonbeams = require('moonbeams');

/*
 * Remove deprication warning since we're literally in the one
 * use case they describe as valid for doing this here:
 * https://github.com/moment/moment/issues/1407
 */
Moment.createFromInputFallback = function (config) {

  config._d = new Date(config._i);
};

var SEASONS = {
  spring: 0,
  summer: 1,
  fall: 2,
  autumn: 2,
  winter: 3
};

var MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

var YEAR_MATCH = /^(20|')?[0-9]{2}$/;

var getSeason = function getSeason (now, season, year, guessYear) {

  var start;
  var end;
  var endSeason;
  var endYear;
  var cal;
  var hms;
  endSeason = season + 1;
  endYear = year;
  if (endSeason === 4) {
    endSeason = 0;
    endYear = Number(endYear) + 1;
  }
  cal = Moonbeams.jdToCalendar(Moonbeams.season(endSeason, endYear));
  hms = Moonbeams.dayToHms(cal.day);
  end = Moment(new Date(cal.year, cal.month - 1, cal.day, hms.hour, hms.minute, hms.second));
  if (guessYear && end <= now) {
    cal = Moonbeams.jdToCalendar(Moonbeams.season(endSeason, endYear + 1));
    hms = Moonbeams.dayToHms(cal.day);
    end = Moment(new Date(cal.year, cal.month - 1, cal.day, hms.hour, hms.minute, hms.second));
    year = year + 1;
  }
  cal = Moonbeams.jdToCalendar(Moonbeams.season(season, year));
  hms = Moonbeams.dayToHms(cal.day);
  start = Moment(new Date(cal.year, cal.month - 1, cal.day, hms.hour, hms.minute, hms.second));
  end.subtract(1, 'seconds');
  return {
    start: start,
    end: end
  };
};

//Very specific parser for tokens only ending in a year and nothing else
var parseYear = function parseYear (tokens) {

  var year;
  var end;
  var result;
  var start;
  tokens.forEach(function findSeason (token) {

    if (MONTHS.indexOf(token.slice(0, 3)) > -1) {
      result = true;
    }
  });
  if (result) {
    return; //Let date parser try it next
  }
  //Make sure it doesn't have a season or month in it
  year = tokens.slice(-1)[0];
  if (!year || !year.match(YEAR_MATCH)) {
    return;
  }
  if (year < 100) {
    year = Number(year) + 2000;
  }
  start = Moment(new Date(Number(year), 0, 1));
  end = Moment(start).add(1, 'years').subtract(1, 'seconds');
  result = {
    start: start,
    end: end
  };
  return result;
};

//Actual month/day parser
var monthDay = function monthDay (month, day, now) {

  var year = new Date().getFullYear();
  month = MONTHS.indexOf(month.slice(0, 3));
  var start = Moment(new Date(year, month, day));
  var end = Moment(start).add(1, 'days').subtract(1, 'seconds');
  if (end <= now) {
    start.add(1, 'years');
    end.add(1, 'years');
  }
  return { start: start, end: end };
};

//Very specific parser for tokens ending in either a month or a month/year or month/day
var parseMonth = function parseMonth (tokens, now) {

  var parsed;
  var start;
  var end;
  var month;
  var year;
  var guessYear;
  year = tokens.slice(-1)[0];
  if (year.match(YEAR_MATCH)) {
    month = tokens.slice(-2)[0];
    if (year[0] === '\'') {
      year = year.slice(1);
    }
    else if (String(Number(year)) === year && year < 32) {
      return monthDay(month, year, now);
    }
    if (year < 100) {
      year = Number(year) + 2000;
    }
  }
  else {
    month = year;
    year = new Date().getFullYear();
    guessYear = true;
  }
  month = MONTHS.indexOf(month.slice(0, 3));
  if (month === -1) {
    return;
  }
  start = Moment(new Date(Number(year), month));
  end = Moment(start).add(1, 'months').subtract(1, 'seconds');
  if (guessYear && end <= now) {
    start.add(1, 'years');
    end.add(1, 'years');
  }
  parsed = {
    start: start,
    end: end
  };
  return parsed;
};

var parseSeason = function parseSeason (tokens, now) {

  var guessYear;
  var parsed;
  var season;
  var year;
  //Needs to end in a season or a season/year
  year = tokens.slice(-1)[0];
  if (year.match(YEAR_MATCH)) {
    season = tokens.slice(-2)[0];
    if (year < 100) {
      year = year + 2000;
    }
  }
  else {
    season = year;
    year = new Date().getFullYear();
    guessYear = true;
  }
  season = SEASONS[season];
  if (season === undefined) {
    return;
  }
  parsed = getSeason(now, season, year, guessYear);
  return parsed;
};

var parseDate = function parseDate (tokens) {

  var parsed = {};
  parsed.start = Moment(tokens.join(' '));
  if (parsed.start.toJSON() === 'null') {
    return;
  }
  parsed.end = Moment(parsed.start).add(1, 'days').subtract(1, 'seconds');
  return parsed;
};

var tryAll = function tryAll (tokens, now) {

  return parseSeason(tokens, now) ||
    parseMonth(tokens, now) ||
    parseYear(tokens, now) ||
    parseDate(tokens); //parseDate always last
};

Moment.ambit = function ambit (str, format) {

  var currentAttempt;
  var endRange;
  var lastAttempt;
  var result;
  var startRange;
  var now = new Date();
  var tokens = str.trim().toLowerCase().split(/[,\s]+/);
  var direction = 'right';
  var current = [];

  //Come at it left to right, once we've parsed something wait till we get an error then back up one (assumes the error was from separator language)
  while (direction === 'right' && tokens.length > 0) {
    current.push(tokens.shift());
    currentAttempt = tryAll(current, now);
    if (currentAttempt) {
      lastAttempt = currentAttempt;
      startRange = currentAttempt;
    }
    else {
      if (lastAttempt) { //We don't parse now but we used to, assume we're into the separator
        //We're either still processing or are done
        tokens.unshift(current.pop()); //Undo the last shift
        direction = 'left';
        startRange = lastAttempt;
      }
    }
  }
  //We go till our first match and that's that
  while (direction !== 'done' && tokens.length > 0) {
    endRange = tryAll(tokens, now);
    if (endRange) {
      direction = 'done';
    }
    else {
      tokens.pop();
    }
  }
  if (startRange) {
    result = {
      start: startRange.start,
      end: startRange.end
    };
    if (endRange) {
      result.end = endRange.end;
    }
    if (format) {
      result.start = result.start.format(format);
      result.end = result.end.format(format);
    }
    //This should currently only happen w/ two un-yeared months
    if (result.start > result.end) {
      result.end = result.end.add(1, 'years');
    }
    return result;
  }
};

module.exports = Moment;

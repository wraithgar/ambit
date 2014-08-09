var moment = require('moment');
var moonbeams = require('moonbeams');

/*
 * Remove deprication warning since we're literally in the one
 * use case they describe as valid for doing this here:
 * https://github.com/moment/moment/issues/1407
 */
moment.createFromInputFallback = function (config) {
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

function getSeason(now, season, year, guessYear) {
    var start, end, endSeason, endYear, cal, hms;
    endSeason = season + 1;
    endYear = year;
    if (endSeason == 4) {
        endSeason = 0;
        endYear = Number(endYear) + 1;
    }
    cal = moonbeams.jdToCalendar(moonbeams.season(endSeason, endYear));
    hms = moonbeams.dayToHms(cal.day);
    end = moment(new Date(cal.year, cal.month - 1, cal.day, hms.hour, hms.minute, hms.second));
    if (guessYear && end <= now) {
        cal = moonbeams.jdToCalendar(moonbeams.season(endSeason, endYear + 1));
        hms = moonbeams.dayToHms(cal.day);
        end = moment(new Date(cal.year, cal.month - 1, cal.day, hms.hour, hms.minute, hms.second));
        year = year + 1;
    }
    cal = moonbeams.jdToCalendar(moonbeams.season(season, year));
    hms = moonbeams.dayToHms(cal.day);
    start = moment(new Date(cal.year, cal.month - 1, cal.day, hms.hour, hms.minute, hms.second));
    end.subtract('seconds', 1);
    return {
        start: start,
        end: end
    };
}

//Very specific parser for tokens only ending in a year and nothing else
function parseYear(tokens) {
    var result, start, end, year;
    tokens.forEach(function findSeason(token) {
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
    start = moment(new Date(Number(year), 0, 1));
    end = moment(start).add('years', 1).subtract('seconds', 1);
    result = {
        start: start,
        end: end
    };
    return result;
}

//Actual month/day parser
function monthDay(month, day, now) {
    var start, end;
    var year = new Date().getFullYear();
    month = MONTHS.indexOf(month.slice(0, 3));
    start = moment(new Date(year, month, day));
    end = moment(start).add('days', 1).subtract('seconds', 1);
    if (end <= now) {
        start.add('years', 1);
        end.add('years', 1);
    }
    return {start: start, end: end};
}

//Very specific parser for tokens ending in either a month or a month/year or month/day
function parseMonth(tokens, now) {
    var parsed, start, end, month, year, guessYear;
    year = tokens.slice(-1)[0];
    if (year.match(YEAR_MATCH)) {
        month = tokens.slice(-2)[0];
        if (year[0] === '\'') {
            year = year.slice(1);
        } else if (String(Number(year)) === year && year < 32) {
            return monthDay(month, year, now);
        }
        if (year < 100) {
            year = Number(year) + 2000;
        }
    } else {
        month = year;
        year = new Date().getFullYear();
        guessYear = true;
    }
    month = MONTHS.indexOf(month.slice(0, 3));
    if (month === -1) {
        return;
    }
    start = moment(new Date(Number(year), month));
    end = moment(start).add('months', 1).subtract('seconds', 1);
    if (guessYear && end <= now) {
        start.add('years', 1);
        end.add('years', 1);
    }
    parsed = {
        start: start,
        end: end
    };
    return parsed;
}

function parseSeason(tokens, now) {
    var parsed, season, year, guessYear;
    //Needs to end in a season or a season/year
    year = tokens.slice(-1)[0];
    if (year.match(YEAR_MATCH)) {
        season = tokens.slice(-2)[0];
        if (year < 100) {
            year = year + 2000;
        }
    } else {
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
}

function parseDate(tokens) {
    var parsed = {};
    parsed.start = moment(tokens.join(' '));
    if (parsed.start.toJSON() === 'Invalid date') {
        return;
    }
    parsed.end = moment(parsed.start).add('days', 1).subtract('seconds', 1);
    return parsed;
}

function tryAll(tokens, now) {
    return parseSeason(tokens, now) ||
        parseMonth(tokens, now) ||
        parseYear(tokens, now) ||
        parseDate(tokens); //parseDate always last
}

moment.ambit = function ambit(str, format) {
    var result, startRange, endRange;
    var now = new Date();
    var tokens = str.trim().toLowerCase().split(/[,\s]+/);
    var direction = 'right';
    var current = [];
    var lastAttempt, currentAttempt;

    //Come at it left to right, once we've parsed something wait till we get an error then back up one (assumes the error was from separator language)
    while (direction === 'right' && tokens.length > 0) {
        current.push(tokens.shift());
        currentAttempt = tryAll(current, now);
        if (currentAttempt) {
            lastAttempt = currentAttempt;
            startRange = currentAttempt;
        } else {
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
        endRange = tryAll(tokens);
        if (endRange) {
            direction = 'done';
        } else {
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
            result.end = result.end.add('years', 1);
        }
        return result;
    }
};

module.exports = moment;

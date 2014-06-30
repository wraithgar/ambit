var moment = require('moment');
var seasonDate = require('./season');

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

var YEAR_MATCH = /^(20)?[0-9]{2}$/;

function getSeason(now, season, year) {
    var start, end, guessYear, endSeason, endYear;
    endSeason = season + 1;
    endYear = year;
    if (endSeason == 4) {
        endSeason = 0;
        endYear = Number(endYear) + 1;
    }
    if (!year) {
        year = new Date().getFullYear();
        guessYear = true;
    }
    end = moment(seasonDate(endSeason, endYear));
    //Eventually need to pass now properly
    //if (guessYear && end <= now) {
        //end = moment(seasonDate(endSeason, endYear + 1));
        //year = year + 1;

    //}
    start = moment(seasonDate(season, year));
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
        if (Object.keys(SEASONS).indexOf(token) > -1) {
            result = true;
        }
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

//Very specific parser for tokens ending in either a month or a month/year
function parseMonth(tokens, now) {
    var parsed, start, end, month, year;
    //Needs to end in a month or a month/year
    year = tokens.slice(-1)[0];
    if (year.match(YEAR_MATCH)) {
        month = tokens.slice(-2)[0];
        if (year < 100) {
            year = year + 2000;
        }
    } else {
        month = year;
        year = new Date().getFullYear();
    }
    month = MONTHS.indexOf(month.slice(0, 3));
    if (month === -1) {
        return;
    }
    start = moment(new Date(Number(year), month));
    end = moment(start).add('months', 1).subtract('seconds', 1);
    if (end <= now) {
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
    var parsed, season, year;
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
    }
    season = SEASONS[season];
    if (season === undefined) {
        return;
    }
    parsed = getSeason(now, season, year);
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

//TODO "Oct to Sep" for example needs to know sep is the year after
moment.ambit = function ambit(str, format) {
    var result, startRange, endRange;
    //var now = new Date();
    var tokens = str.trim().toLowerCase().split(/[,\s]+/);
    var direction = 'right';
    var current = [];
    var lastAttempt, currentAttempt;

    //Come at it left to right, once we've parsed something wait till we get an error then back up one (assumes the error was from separator language)
    while (direction === 'right' && tokens.length > 0) {
        current.push(tokens.shift());
        currentAttempt = tryAll(current);
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
            endRange.shift();
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
        return result;
    }
};

module.exports = moment;

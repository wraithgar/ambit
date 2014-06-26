var moment = require('moment');

/*
 * Remove deprication warning since we're literally in the one
 * use case they describe as valid for doing this here:
 * https://github.com/moment/moment/issues/1407
 */
moment.createFromInputFallback = function (config) {
    config._d = new Date(config._i);
};

var SEASONS = {
    spring: [2, 20, 0, 5, 19, 0],
    summer: [5, 20, 0, 8, 23, 0],
    fall: [8, 23, 0, 11, 21, 0],
    autumn: [8, 23, 0, 11, 21, 0],
    winter: [11, 21, 0, 2, 19, 1]
};

var MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

var YEAR_MATCH = /^(20)?[0-9]{2}$/;

function getSeason(now, season, year) {
    var startDate, endDate;
    var boundaries = SEASONS[season];
    if (!year) {
        year = new Date().getFullYear();
        endDate = new Date(Number(year) + boundaries[5], boundaries[3], boundaries[4]);
        if (endDate <= now) {
            year = year + 1;
        }
    }
    startDate = new Date(Number(year) + boundaries[2], boundaries[0], boundaries[1]);
    endDate = new Date(Number(year) + boundaries[5], boundaries[3], boundaries[4]);
    return {
        startDate: moment(startDate).format('MM-DD-YYYY'),
        endDate: moment(endDate).format('MM-DD-YYYY')
    };
}

function parseYear(tokens) {
    var startDate, endDate, year;
    tokens.forEach(function findYear(token) {
        if (token.match(YEAR_MATCH)) {
            year = token;
        }
    });
    if (!year) {
        return;
    }
    if (year < 100) {
        year = Number(year) + 2000;
    }
    startDate = new Date(Number(year), 0, 1);
    endDate = new Date(Number(year), 11, 31);
    return {
        startDate: moment(startDate).format('MM-DD-YYYY'),
        endDate: moment(endDate).format('MM-DD-YYYY')
    };
}

function parseMonth(tokens, now) {
    var parsed, startDate, endDate, monthIndex, month, year;
    tokens.forEach(function findMonth(token, index) {
        var found = MONTHS.indexOf(token.slice(0, 3));
        if (found > -1) {
            month = found;
            monthIndex = index;
        }
    });
    if (!month) {
        return;
    }
    if (tokens.length === monthIndex + 1) {
        //If the month was the last thing we try to guess the year
        year = new Date().getFullYear();
        endDate = new Date(Number(year), month);
        if (endDate <= now) {
            year = year + 1;
        }
    } else {
        //Otherwise we try to find it in our tokens
        tokens.forEach(function findYear(token) {
            if (token.match(YEAR_MATCH)) {
                year = token;
                if (year < 100) {
                    year = Number(year) + 2000;
                }
            }
        });
    }
    if (!year) {
        return;
    }
    startDate = new Date(Number(year), month);
    endDate = moment(startDate).add('months', 1).subtract('days', 1);
    parsed = {
        startDate: moment(startDate).format('MM-DD-YYYY'),
        endDate: moment(endDate).format('MM-DD-YYYY')
    };
    return parsed;
}

function parseSeasons(tokens, now) {
    var parsed, season, seasonIndex, year;
    tokens.forEach(function findSeason(token, index) {
        var found = Object.keys(SEASONS).indexOf(token);
        if (found > -1) {
            season = token;
            seasonIndex = index;
        }
    });
    if (!season) {
        return;
    }
    if (tokens.length !== seasonIndex + 1) {
        //If the season wasn't the last thing we try to find it
        tokens.forEach(function findYear(token) {
            if (token.match(YEAR_MATCH)) {
                year = token;
                if (year < 100) {
                    year = Number(year) + 2000;
                }
            }
        });
        if (!year) {
            return;
        }
    }
    parsed = getSeason(now, season, year);
    return getSeason(now, season, year);
}

function parseDate(tokens) {
    var dateString = tokens.join(' ');
    dateString = moment(dateString).format('MM-DD-YYYY');
    if (dateString === 'Invalid date') {
        return;
    }
    return {
        startDate: dateString,
        endDate: dateString
    };
}

function tryAll(tokens, now) {
    return parseSeasons(tokens, now) ||
        parseMonth(tokens, now) ||
        parseYear(tokens, now) ||
        parseDate(tokens); //parseDate always last
}

//TODO "Oct to Sep" for example needs to know sep is the year after
//TODO format parameter
moment.ambit = function ambit(str) {
    var result, startRange, endRange;
    //var now = new Date();
    var tokens = str.trim().toLowerCase().split(/[,\s]+/);
    var direction = 'right';
    var current = [];
    var lastAttempt, currentAttempt;

    //Come at it left to right
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
    current = [];
    endRange = tryAll(tokens);
    if (startRange) {
        result = {
            startDate: startRange.startDate,
            endDate: startRange.endDate
        };
        if (endRange) {
            result.endDate = endRange.endDate;
        }
        return result;
    }
};

module.exports = moment;

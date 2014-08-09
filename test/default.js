var Lab = require('lab');
var ambit = require('../');

//We format the results so the tests are easier to read
Lab.experiment('default tests', function () {
    Lab.test('Single year', function (done) {
        var result = ambit.ambit('2005');
        Lab.expect(result, 'parsed year').to.include.keys('start', 'end');
        Lab.expect(result.start.format('YYYY-MM-DD HH:mm:ss'), 'start date').to.equal('2005-01-01 00:00:00');
        Lab.expect(result.end.format('YYYY-MM-DD HH:mm:ss'), 'end date').to.equal('2005-12-31 23:59:59');
        done();
    });
    Lab.test('Year range', function (done) {
        var result = ambit.ambit('2005 to 2007');
        Lab.expect(result, 'parsed year').to.include.keys('start', 'end');
        Lab.expect(result.start.format('YYYY-MM-DD HH:mm:ss'), 'start date').to.equal('2005-01-01 00:00:00');
        Lab.expect(result.end.format('YYYY-MM-DD HH:mm:ss'), 'end date').to.equal('2007-12-31 23:59:59');
        done();
    });
    Lab.test('Two digit year', function (done) {
        var result = ambit.ambit('05');
        Lab.expect(result, 'parsed year').to.include.keys('start', 'end');
        Lab.expect(result.start.format('YYYY-MM-DD HH:mm:ss'), 'start date').to.equal('2005-01-01 00:00:00');
        Lab.expect(result.end.format('YYYY-MM-DD HH:mm:ss'), 'end date').to.equal('2005-12-31 23:59:59');
        done();
    });
    Lab.test('Single month with year', function (done) {
        var result = ambit.ambit('March 2005');
        Lab.expect(result, 'parsed year').to.include.keys('start', 'end');
        Lab.expect(result.start.format('YYYY-MM-DD HH:mm:ss'), 'start date').to.equal('2005-03-01 00:00:00');
        Lab.expect(result.end.format('YYYY-MM-DD HH:mm:ss'), 'end date').to.equal('2005-03-31 23:59:59');
        done();
    });
    Lab.test('Month with year range', function (done) {
        var result = ambit.ambit('March 2005 to August 2005');
        Lab.expect(result, 'parsed year').to.include.keys('start', 'end');
        Lab.expect(result.start.format('YYYY-MM-DD HH:mm:ss'), 'start date').to.equal('2005-03-01 00:00:00');
        Lab.expect(result.end.format('YYYY-MM-DD HH:mm:ss'), 'end date').to.equal('2005-08-31 23:59:59');
        done();
    });
    Lab.test('Season with year', function (done) {
        var result = ambit.ambit('Spring 2005');
        Lab.expect(result, 'parsed year').to.include.keys('start', 'end');
        Lab.expect(result.start.format('YYYY-MM-DD'), 'start date').to.equal('2005-03-20');
        Lab.expect(result.end.format('YYYY-MM-DD'), 'end date').to.equal('2005-06-21');
        done();
    });
    Lab.test('Season crossing year boundary', function (done) {
        var result = ambit.ambit('Winter 2005');
        Lab.expect(result, 'parsed year').to.include.keys('start', 'end');
        Lab.expect(result.start.format('YYYY-MM-DD'), 'start date').to.equal('2005-12-21');
        Lab.expect(result.end.format('YYYY-MM-DD'), 'end date').to.equal('2006-03-20');
        done();
    });
    Lab.test('Months', function (done) {
        var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        months.forEach(function (month) {
            var result = ambit.ambit(month);
            Lab.expect(result, 'parsed month ' + month).to.include.keys('start', 'end');
            Lab.expect(result.start, 'start of ' + month).to.be.below(result.end, 'end of ' + month);
            Lab.expect(result.end, 'end of ' + month).to.be.above(new Date(), 'now');
        });
        done();
    });
    Lab.test('Months that are backwards', function (done) {
        var result = ambit.ambit('oct to sep');
        Lab.expect(result, 'parsed months').to.include.keys('start', 'end');
        Lab.expect(result.start, 'oct').to.be.below(result.end,'sep');
        done();
    });
    Lab.test('Seasons', function (done) {
        var seasons = ['spring', 'summer', 'fall', 'autumn', 'winter'];
        seasons.forEach(function (season) {
            var result = ambit.ambit(season);
            Lab.expect(result, 'parsed season ' + season).to.include.keys('start', 'end');
            Lab.expect(result.start, 'start of ' + season).to.be.below(result.end, 'end of ' + season);
            Lab.expect(result.end, 'end date of ' + season).to.be.above(new Date(), 'now');
        });
        done();
    });
    Lab.test('Season w/o year crossing year boundary', function (done) {
        var result = ambit.ambit('Winter');
        Lab.expect(result, 'parsed season').to.include.keys('start', 'end');
        Lab.expect(result.end, 'end').to.be.above(result.start, 'start');
        done();
    });
    Lab.test('Formatting', function (done) {
        var result = ambit.ambit('march 12, 2005', 'YYYY-MM-DD');
        Lab.expect(result, 'parsed year').to.include.keys('start', 'end');
        Lab.expect(result.start).to.equal('2005-03-12');
        done();
    });
    Lab.test('Month day', function (done) {
        var result = ambit.ambit('may 12');
        Lab.expect(result, 'parsed month day').to.include.keys('start', 'end');
        Lab.expect(result.start.date(), 'parsed day start').to.equal(12);
        Lab.expect(result.start.month(), 'parsed month start').to.equal(4);
        Lab.expect(result.end.date(), 'parsed day end').to.equal(12);
        Lab.expect(result.end.month(), 'parsed month end').to.equal(4);
        done();
    });
    Lab.test('Month two digit year too big to be a day', function (done) {
        var result = ambit.ambit('april 39');
        Lab.expect(result, 'parsed month year').to.include.keys('start', 'end');
        Lab.expect(result.start.year(), 'parsed year start').to.equal(2039);
        Lab.expect(result.start.month(), 'parsed month start').to.equal(3);
        Lab.expect(result.start.date(), 'parsed day start').to.equal(1);
        Lab.expect(result.end.year(), 'parsed year end').to.equal(2039);
        Lab.expect(result.end.month(), 'parsed month end').to.equal(3);
        Lab.expect(result.end.date(), 'parsed day end').to.equal(30);
        done();
    });
    Lab.test('Month day to year', function (done) {
        var now = new Date();
        var year = now.getFullYear() + 1;
        var result = ambit.ambit('may 12 to ' + year);
        Lab.expect(result.start.date(), 'parsed day start').to.equal(12);
        Lab.expect(result.start.month(), 'parsed month start').to.equal(4);
        Lab.expect(result.end.date(), 'parsed day end').to.equal(31);
        Lab.expect(result.end.month(), 'parsed month end').to.equal(11);
        Lab.expect(result.end.year(), 'parsed year end').to.equal(year);
        done();
    });
    Lab.test('Month \'year', function (done) {
        var result = ambit.ambit('may \'12');
        Lab.expect(result, 'parsed month day').to.include.keys('start', 'end');
        Lab.expect(result.start.date(), 'parsed day start').to.equal(1);
        Lab.expect(result.start.month(), 'parsed month start').to.equal(4);
        Lab.expect(result.start.year(), 'parsed year start').to.equal(2012);
        Lab.expect(result.end.date(), 'parsed day end').to.equal(31);
        Lab.expect(result.end.month(), 'parsed month end').to.equal(4);
        Lab.expect(result.end.year(), 'parsed year end').to.equal(2012);
        done();
    });
    Lab.test('Full day', function (done) {
        var result = ambit.ambit('March 12, 2001');
        Lab.expect(result, 'parsed full day').to.include.keys('start', 'end');
        Lab.expect(result.start.date(), 'parsed day start').to.equal(12);
        Lab.expect(result.start.month(), 'parsed month start').to.equal(2);
        Lab.expect(result.start.year(), 'parsed year start').to.equal(2001);
        done();
    });
    Lab.test('Full day to year', function (done) {
        var result = ambit.ambit('September 14, 2002 to 2003');
        Lab.expect(result, 'parsed full day').to.include.keys('start', 'end');
        Lab.expect(result.start.date(), 'parsed day start').to.equal(14);
        Lab.expect(result.start.month(), 'parsed month start').to.equal(8);
        Lab.expect(result.start.year(), 'parsed year start').to.equal(2002);
        Lab.expect(result.end.date(), 'parsed day end').to.equal(31);
        Lab.expect(result.end.month(), 'parsed month end').to.equal(11);
        Lab.expect(result.end.year(), 'parsed year end').to.equal(2003);
        done();
    });
    Lab.test('Nonsense', function (done) {
        var result = ambit.ambit('first of tocember'); //Octember parses, sorry Dr Suess
        Lab.expect(result).to.equal(undefined);
        done();
    });
    Lab.test('Double ending', function (done) {
        var result = ambit.ambit('2005 something something');
        Lab.expect(result, 'double ending').to.include.keys('start', 'end');
        Lab.expect(result.start.year(), 'parsed start year').to.equal(2005);
        done();
    });
    Lab.test('Double separator', function (done) {
        var result = ambit.ambit('2005 to, like 2007');
        Lab.expect(result, 'double separator').to.include.keys('start', 'end');
        Lab.expect(result.start.date(), 'parsed day start').to.equal(1);
        Lab.expect(result.start.month(), 'parsed month start').to.equal(0);
        Lab.expect(result.start.year(), 'parsed year start').to.equal(2005);
        Lab.expect(result.end.date(), 'parsed end start').to.equal(31);
        Lab.expect(result.end.month(), 'parsed end start').to.equal(11);
        Lab.expect(result.end.year(), 'parsed end start').to.equal(2007);
        done();
    });
    Lab.test('Empty string', function (done) {
        var result = ambit.ambit('');
        Lab.expect(result).to.equal(undefined);
        done();
    });
});

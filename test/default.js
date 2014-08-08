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
});

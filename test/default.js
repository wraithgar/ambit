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
    Lab.test('Formatting', function (done) {
        var result = ambit.ambit('march 12, 2005', 'YYYY-MM-DD');
        Lab.expect(result, 'parsed year').to.include.keys('start', 'end');
        Lab.expect(result.start).to.equal('2005-03-12');
        done();
    });
});

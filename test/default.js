var Lab = require('lab');
var ambit = require('../');

Lab.experiment('default tests', function () {
    Lab.test('Single year', function (done) {
        var result = ambit.ambit('2005');
        Lab.expect(result, 'parsed year').to.include.keys('start', 'end');
        Lab.expect(result.start.toDate().getTime(), 'start date').to.equal(new Date('2005', 0, 1).getTime());
        Lab.expect(result.end.toDate().getTime(), 'end date').to.equal(ambit(result.start).add('years', 1).subtract('seconds', 1).toDate().getTime());
        done();
    });
    Lab.test('Year range', function (done) {
        var result = ambit.ambit('2005 to 2007');
        Lab.expect(result, 'parsed year').to.include.keys('start', 'end');
        Lab.expect(result.start.toDate().getTime(), 'start date').to.equal(new Date('2005', 0, 1).getTime());
        Lab.expect(result.end.toDate().getTime(), 'end date').to.equal(ambit(result.start).add('years', 3).subtract('seconds', 1).toDate().getTime());
        done();
    });
    Lab.test('Two digit year', function (done) {
        var result = ambit.ambit('05');
        Lab.expect(result, 'parsed year').to.include.keys('start', 'end');
        Lab.expect(result.start.toDate().getTime(), 'start date').to.equal(new Date('2005', 0, 1).getTime());
        Lab.expect(result.end.toDate().getTime(), 'end date').to.equal(ambit(result.start).add('years', 1).subtract('seconds', 1).toDate().getTime());
        done();
    });
    Lab.test('Single month with year', function (done) {
        var result = ambit.ambit('March 2005');
        Lab.expect(result, 'parsed year').to.include.keys('start', 'end');
        Lab.expect(result.start.toDate().getTime(), 'start date').to.equal(new Date('2005', 2, 1).getTime());
        Lab.expect(result.end.toDate().getTime(), 'end date').to.equal(ambit(result.start).add('month', 1).subtract('seconds', 1).toDate().getTime());
        done();
    });
    Lab.test('Month with year range', function (done) {
        var result = ambit.ambit('March 2005 to August 2005');
        Lab.expect(result, 'parsed year').to.include.keys('start', 'end');
        Lab.expect(result.start.toDate().getTime(), 'start date').to.equal(new Date('2005', 2, 1).getTime());
        Lab.expect(result.end.toDate().getTime(), 'end date').to.equal(ambit(result.start).add('month', 6).subtract('seconds', 1).toDate().getTime());
        done();
    });
    Lab.test('Formatting', function (done) {
        var result = ambit.ambit('march 12, 2005', 'YYYY-MM-DD');
        Lab.expect(result, 'parsed year').to.include.keys('start', 'end');
        Lab.expect(result.start).to.equal('2005-03-12');
        done();
    });
});

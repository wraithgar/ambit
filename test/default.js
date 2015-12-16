'use strict';

var Code = require('code');
var Lab = require('lab');
var Ambit = require('../');

var lab = exports.lab = Lab.script();

//We format the results so the tests are easier to read
lab.experiment('default tests', function () {

  lab.test('Single year', function (done) {

    var result = Ambit.ambit('2005');
    Code.expect(result, 'parsed year').to.include('start', 'end');
    Code.expect(result.start.format('YYYY-MM-DD HH:mm:ss'), 'start date').to.equal('2005-01-01 00:00:00');
    Code.expect(result.end.format('YYYY-MM-DD HH:mm:ss'), 'end date').to.equal('2005-12-31 23:59:59');
    done();
  });
  lab.test('Year range', function (done) {

    var result = Ambit.ambit('2005 to 2007');
    Code.expect(result, 'parsed year').to.include('start', 'end');
    Code.expect(result.start.format('YYYY-MM-DD HH:mm:ss'), 'start date').to.equal('2005-01-01 00:00:00');
    Code.expect(result.end.format('YYYY-MM-DD HH:mm:ss'), 'end date').to.equal('2007-12-31 23:59:59');
    done();
  });
  lab.test('Two digit year', function (done) {

    var result = Ambit.ambit('05');
    Code.expect(result, 'parsed year').to.include('start', 'end');
    Code.expect(result.start.format('YYYY-MM-DD HH:mm:ss'), 'start date').to.equal('2005-01-01 00:00:00');
    Code.expect(result.end.format('YYYY-MM-DD HH:mm:ss'), 'end date').to.equal('2005-12-31 23:59:59');
    done();
  });
  lab.test('Single month with year', function (done) {

    var result = Ambit.ambit('March 2005');
    Code.expect(result, 'parsed year').to.include('start', 'end');
    Code.expect(result.start.format('YYYY-MM-DD HH:mm:ss'), 'start date').to.equal('2005-03-01 00:00:00');
    Code.expect(result.end.format('YYYY-MM-DD HH:mm:ss'), 'end date').to.equal('2005-03-31 23:59:59');
    done();
  });
  lab.test('Month with year range', function (done) {

    var result = Ambit.ambit('March 2005 to August 2005');
    Code.expect(result, 'parsed year').to.include('start', 'end');
    Code.expect(result.start.format('YYYY-MM-DD HH:mm:ss'), 'start date').to.equal('2005-03-01 00:00:00');
    Code.expect(result.end.format('YYYY-MM-DD HH:mm:ss'), 'end date').to.equal('2005-08-31 23:59:59');
    done();
  });
  lab.test('Season with year', function (done) {

    var result = Ambit.ambit('Spring 2005');
    Code.expect(result, 'parsed year').to.include('start', 'end');
    Code.expect(result.start.format('YYYY-MM-DD'), 'start date').to.equal('2005-03-20');
    Code.expect(result.end.format('YYYY-MM-DD'), 'end date').to.equal('2005-06-21');
    done();
  });
  lab.test('Season crossing year boundary', function (done) {

    var result = Ambit.ambit('Winter 2005');
    Code.expect(result, 'parsed year').to.include('start', 'end');
    Code.expect(result.start.format('YYYY-MM-DD'), 'start date').to.equal('2005-12-21');
    Code.expect(result.end.format('YYYY-MM-DD'), 'end date').to.equal('2006-03-20');
    done();
  });
  lab.test('Months', function (done) {

    var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    months.forEach(function (month) {

      var result = Ambit.ambit(month);
      Code.expect(result, 'parsed month ' + month).to.include('start', 'end');
      Code.expect(result.start, 'start of ' + month).to.be.below(result.end, 'end of ' + month);
      Code.expect(result.end, 'end of ' + month).to.be.above(new Date(), 'now');
    });
    done();
  });
  lab.test('Months that are backwards', function (done) {

    var result = Ambit.ambit('oct to sep');
    Code.expect(result, 'parsed months').to.include('start', 'end');
    Code.expect(result.start, 'oct').to.be.below(result.end, 'sep');
    done();
  });
  lab.test('Seasons', function (done) {

    var seasons = ['spring', 'summer', 'fall', 'autumn', 'winter'];
    seasons.forEach(function (season) {

      var result = Ambit.ambit(season);
      Code.expect(result, 'parsed season ' + season).to.include('start', 'end');
      Code.expect(result.start, 'start of ' + season).to.be.below(result.end, 'end of ' + season);
      Code.expect(result.end, 'end date of ' + season).to.be.above(new Date(), 'now');
    });
    done();
  });
  lab.test('Season w/o year crossing year boundary', function (done) {

    var result = Ambit.ambit('Winter');
    Code.expect(result, 'parsed season').to.include('start', 'end');
    Code.expect(result.end, 'end').to.be.above(result.start, 'start');
    done();
  });
  lab.test('Formatting', function (done) {

    var result = Ambit.ambit('march 12, 2005', 'YYYY-MM-DD');
    Code.expect(result, 'parsed year').to.include('start', 'end');
    Code.expect(result.start).to.equal('2005-03-12');
    done();
  });
  lab.test('Month day', function (done) {

    var result = Ambit.ambit('may 12');
    Code.expect(result, 'parsed month day').to.include('start', 'end');
    Code.expect(result.start.date(), 'parsed day start').to.equal(12);
    Code.expect(result.start.month(), 'parsed month start').to.equal(4);
    Code.expect(result.end.date(), 'parsed day end').to.equal(12);
    Code.expect(result.end.month(), 'parsed month end').to.equal(4);
    done();
  });
  lab.test('Month two digit year too big to be a day', function (done) {

    var result = Ambit.ambit('april 39');
    Code.expect(result, 'parsed month year').to.include('start', 'end');
    Code.expect(result.start.year(), 'parsed year start').to.equal(2039);
    Code.expect(result.start.month(), 'parsed month start').to.equal(3);
    Code.expect(result.start.date(), 'parsed day start').to.equal(1);
    Code.expect(result.end.year(), 'parsed year end').to.equal(2039);
    Code.expect(result.end.month(), 'parsed month end').to.equal(3);
    Code.expect(result.end.date(), 'parsed day end').to.equal(30);
    done();
  });
  lab.test('Month day to year', function (done) {

    var now = new Date();
    var year = now.getFullYear() + 1;
    var result = Ambit.ambit('may 12 to ' + year);
    Code.expect(result.start.date(), 'parsed day start').to.equal(12);
    Code.expect(result.start.month(), 'parsed month start').to.equal(4);
    Code.expect(result.end.date(), 'parsed day end').to.equal(31);
    Code.expect(result.end.month(), 'parsed month end').to.equal(11);
    Code.expect(result.end.year(), 'parsed year end').to.equal(year);
    done();
  });
  lab.test('Month \'year', function (done) {

    var result = Ambit.ambit('may \'12');
    Code.expect(result, 'parsed month day').to.include('start', 'end');
    Code.expect(result.start.date(), 'parsed day start').to.equal(1);
    Code.expect(result.start.month(), 'parsed month start').to.equal(4);
    Code.expect(result.start.year(), 'parsed year start').to.equal(2012);
    Code.expect(result.end.date(), 'parsed day end').to.equal(31);
    Code.expect(result.end.month(), 'parsed month end').to.equal(4);
    Code.expect(result.end.year(), 'parsed year end').to.equal(2012);
    done();
  });
  lab.test('Full day', function (done) {

    var result = Ambit.ambit('March 12, 2001');
    Code.expect(result, 'parsed full day').to.include('start', 'end');
    Code.expect(result.start.date(), 'parsed day start').to.equal(12);
    Code.expect(result.start.month(), 'parsed month start').to.equal(2);
    Code.expect(result.start.year(), 'parsed year start').to.equal(2001);
    done();
  });
  lab.test('Full day to year', function (done) {

    var result = Ambit.ambit('September 14, 2002 to 2003');
    Code.expect(result, 'parsed full day').to.include('start', 'end');
    Code.expect(result.start.date(), 'parsed day start').to.equal(14);
    Code.expect(result.start.month(), 'parsed month start').to.equal(8);
    Code.expect(result.start.year(), 'parsed year start').to.equal(2002);
    Code.expect(result.end.date(), 'parsed day end').to.equal(31);
    Code.expect(result.end.month(), 'parsed month end').to.equal(11);
    Code.expect(result.end.year(), 'parsed year end').to.equal(2003);
    done();
  });
  lab.test('Nonsense', function (done) {

    var result = Ambit.ambit('first of tocember'); //Octember parses, sorry Dr Suess
    Code.expect(result).to.equal(undefined);
    done();
  });
  lab.test('Double ending', function (done) {

    var result = Ambit.ambit('2005 something something');
    Code.expect(result, 'double ending').to.include('start', 'end');
    Code.expect(result.start.year(), 'parsed start year').to.equal(2005);
    done();
  });
  lab.test('Double separator', function (done) {

    var result = Ambit.ambit('2005 to, like 2007');
    Code.expect(result, 'double separator').to.include('start', 'end');
    Code.expect(result.start.date(), 'parsed day start').to.equal(1);
    Code.expect(result.start.month(), 'parsed month start').to.equal(0);
    Code.expect(result.start.year(), 'parsed year start').to.equal(2005);
    Code.expect(result.end.date(), 'parsed end start').to.equal(31);
    Code.expect(result.end.month(), 'parsed end start').to.equal(11);
    Code.expect(result.end.year(), 'parsed end start').to.equal(2007);
    done();
  });
  lab.test('Empty string', function (done) {

    var result = Ambit.ambit('');
    Code.expect(result).to.equal(undefined);
    done();
  });
});

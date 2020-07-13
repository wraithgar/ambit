#ambit

Date *range* parser

### about

So it turns out I couldn't find anything out there that parsed a date string and returned a date range.  Typically if you ask for "March" you get "March 1" instead of "March 1 through March 31"

This is an attempt at doing the latter.

Requires [moment](http://momentjs.com/).

Season calculations done via [moonbeams](https://github.com/wraithgar/moonbeams)

Right now it only does day-level granularity.

### use

```javascript
var ambit = require('ambit'); //ambit is moment + ambit now;
var range = ambit.ambit('Spring 2005');
```
range will now either be undefined (unparseable input) or an object w/ a ``start`` and ``end`` attribute, which will be moment objects representing the start and end range of the input.


### formatting

```javascript
var ambit = require('ambit');
var range = ambit.ambit('Sept 2020', 'YYYY-MM-DD');
```
the ``start`` and ``end`` attributes will now be strings formatted ``YYYY-MM-DD``

That's about it for now, it's pretty basic, probably has lots of edge-case bugs, and needs more tests.

### notes
If a year is not given, ambit will make every effort to assume the end date should be in the future.  It also assumes you are giving dates in chronological order, so something like `march 2015 to may 2011` will give unexpected results.  The reason for this is so that something like `oct to feb` will still work as expected (end will be feb of the year after the start date)

Because `May 12` can be either `May 2012` or `May 12, current year` ambit assumes that two numbers following a month are a day unless preceeded by a `\``.  Seasons do not have this problem so `Spring 12` is always interpreted as `Spring 2012`.  Also, something like `05` on its own will still be interpreted as `2005`

License: MIT

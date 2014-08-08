#ambit

So it turns out I couldn't find anything out there that parsed a date string and returned a date range.  Typically if you ask for "March" you get "March 1" instead of "March 1 through March 31"

This is an attempt at doing the latter.

Requires [moment](http://momentjs.com/).

Season calculations done via [moonbeams](https://github.com/wraithgar/moonbeams)

Right now it only does day-level granularity.

If a year is not given, ambit will make every effort to assume the dates should be in the future

#use

```javascript
var ambit = require('ambit'); //ambit is moment + ambit now;
var range = ambit.ambit('Spring 2005');
```
range will now either be undefined (unparseable input) or an object w/ a ``start`` and ``end`` attribute, which will be moment objects representing the start and end range of the input.


##formatting

```javascript
var ambit = require('ambit');
var range = ambit.ambit('Sept 2020', 'YYYY-MM-DD');
```
the ``start`` and ``end`` attributes will now be strings formatted ``YYYY-MM-DD``

That's about it for now, it's pretty basic, probably has lots of edge-case bugs, and needs more tests.

License: MIT

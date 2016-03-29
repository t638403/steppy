var tap = require('tap');

var application = {};
var pattern = require('../services/pattern')(application);

var id6 = pattern.createAtIndex(0);
var id5 = pattern.createAtIndex(0);
var id4 = pattern.createAtIndex(0);
var id3 = pattern.createAtIndex(0);
var id2 = pattern.createAtIndex(0);
var id1 = pattern.createAtIndex(0);
tap.same(pattern.list(), [id1, id2, id3, id4, id5, id6], 'Created 4 patterns');

pattern.removeAtIndex(2);
tap.same(pattern.list(), [id1, id2, id4, id5, id6], 'Removed 3rd pattern');

pattern.moveFromTo(1, 0);
tap.same(pattern.list(), [id2, id1, id4, id5, id6], 'Moved 2nd pattern to 1st');

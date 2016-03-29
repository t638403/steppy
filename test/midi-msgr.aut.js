var tap = require('tap');

var application = {};
var midiMsgr = require('../services/midi-msgr')(application);

var key = midiMsgr.noteNrToStr(24);
tap.same(key, 'C1', 'Note nr 24 must be C1');

var key = midiMsgr.noteNrToStr(68);
tap.same(key, 'G#4', 'Note nr 68 must be G#4');

var nr = midiMsgr.noteStrToNr('C1');
tap.same(nr, 24, 'Note str C1 must be 24');

var nr = midiMsgr.noteStrToNr('G#4');
tap.same(nr, 68, 'Note str G#4 must be 68');
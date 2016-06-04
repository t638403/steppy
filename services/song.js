Box.Application.addService('song', function (application) {

	"use strict";

	var _ = application.getGlobal('_');
	var path = application.getGlobal('path');
	var fs = application.getGlobal('fs');
	var midi = application.getGlobal('midi');

	var metronome = application.getService('metronome').create(120);
	var arrayLoop = application.getService('array-loop');
	var midiMsgr = application.getService('midi-msgr');

	var song = JSON.parse(fs.readFileSync(path.join(__dirname, 'song.json'), {encoding: 'utf8'}));

	var loop;
	var midiOut;
	metronome.on('quarter', function (nr) {
		var msgs = loop.next() || [];
		msgs.forEach(function (msg) {
			midiOut.sendMessage(msg);
		});
	});

	var selectedInstrumentIndex = 0;
	var currPattern = 0;
	var currKey = 'C4';
	var currParam = 0;


	return {
		new: function () {
			song = JSON.parse(fs.readFileSync(path.join(__dirname, 'song.json'), {encoding: 'utf8'}));
		},
		name: function (name) {
			if (name) {
				song.name = name;
			}
			return song.name;
		},
		bpm: function (bpm) {
			if (bpm) {
				song.bpm = Math.abs(bpm);
				metronome.setBpm(song.bpm);
			}
			return song.bpm;
		},
		save: function (cb) {
			fs.writeFile(path.join(__dirname, '../songs/' + song.name + '.json'), JSON.stringify(song), {encoding: 'utf8'}, cb);
		},
		play: function () {
			if (midiOut) {
				midiOut.closePort();
			}
			metronome.stop();

			var midiMessages = [];
			var maxPats = 0;
			song.instruments.forEach(function (instr) {

				var instrumentType = _.find(song['instrument-types'], {name: instr.type});
				maxPats = Math.max(maxPats, instr.patterns.length);

				instr.patterns.forEach(playPattern(instr.ch, instrumentType, midiMessages, maxPats));
			});

			// You don't want to end the last pattern after the last note, in stead fill up with nothing untill pattern
			// end is reached. e.g. total song must be devidable by 16 (pattern length)
			var trailingEmptyness = ((maxPats * 16) - midiMessages.length);
			for (var i = 0; i < trailingEmptyness; i++) {
				midiMessages.push(undefined);
			}

			loop = arrayLoop.create(midiMessages);
			midiOut = new midi.output();
			midiOut.openPort(2);
			metronome.start();
		},
		stop: function () {
			if (midiOut) {
				midiOut.closePort();
			}
			metronome.stop();
		},
		open: function (name, cb) {
			fs.readFile(path.join(__dirname, '../songs/' + name + '.json'), {encoding: 'utf8'}, function (err, data) {
				if (err) {
					cb(err);
				} else {
					try {
						song = JSON.parse(data);
						selectedInstrumentIndex = 0;
						currPattern = 0;
						currKey = 'C4';
						currParam = 0;
						cb();
					} catch (err) {
						cb(err);
					}
				}
			});
		},
		instrument: {
			list: function () {
				return song.instruments;
			},
			getSelectedInstrument: function () {
				return song.instruments[selectedInstrumentIndex];
			},
			getSelectedInstrumentIndex: function () {
				return selectedInstrumentIndex;
			},
			setSelectedInstrumentIndex: function (index) {
				selectedInstrumentIndex = index;
				currParam = 0;
			},
			type: {
				getByName: function (name) {
					return _.find(song['instrument-types'], {name: name})
				},
				curr: function () {
					return _.find(song['instrument-types'], {name: song.instruments[selectedInstrumentIndex].type})
				}
			},
			key: {
				setCurr: function (k) {
					currKey = k;
				},
				getCurr: function () {
					return currKey;
				}
			},
			param: {
				getCurr: function () {
					return currParam;
				},
				setCurr: function (p) {
					currParam = p;
				}
			}
		},
		pattern: {
			play: function() {

				if (midiOut) {
					midiOut.closePort();
				}
				metronome.stop();

				var instrument = song.instruments[selectedInstrumentIndex];
				var instrumentType = _.find(song['instrument-types'], {name: instrument.type});
				var midiMessages = [];
				var maxPats = 1;
				playPattern(instrument.ch, instrumentType, midiMessages, maxPats)(instrument.patterns[currPattern]);

				// You don't want to end the last pattern after the last note, in stead fill up with nothing untill pattern
				// end is reached. e.g. total song must be devidable by 16 (pattern length)
				var trailingEmptyness = ((maxPats * 16) - midiMessages.length);
				for (var i = 0; i < trailingEmptyness; i++) {
					midiMessages.push(undefined);
				}

				loop = arrayLoop.create(midiMessages);
				midiOut = new midi.output();
				midiOut.openPort(2);
				metronome.start();
			},
			stop: function () {
				if (midiOut) {
					midiOut.closePort();
				}
				metronome.stop();
			},
			list: function () {
				return song.instruments[selectedInstrumentIndex].patterns;
			},
			newOrder: function (newOrder) {
				var patterns = _.cloneDeep(song.instruments[selectedInstrumentIndex].patterns);
				var currPatternIsSet = false;
				newOrder.forEach(function (oldIndex, index) {
					if (!currPatternIsSet && oldIndex == currPattern) {
						currPattern = index;
						currPatternIsSet = true;
					}
					song.instruments[selectedInstrumentIndex].patterns[index] = patterns[oldIndex];
				});
			},
			duplicate: function (index) {
				var len = song.instruments[selectedInstrumentIndex].patterns.length;
				var duplicate = _.cloneDeep(song.instruments[selectedInstrumentIndex].patterns[index]);
				song.instruments[selectedInstrumentIndex].patterns.splice(index, 0, duplicate);
				song.instruments[selectedInstrumentIndex].patterns[index + 1].name = 'Pattern ' + len;
				currPattern = index + 1;
			},
			remove: function (index) {
				song.instruments[selectedInstrumentIndex].patterns.splice(index, 1);
				currPattern = index - 1;
				if (currPattern < 0) currPattern = 0;
				if (song.instruments[selectedInstrumentIndex].patterns.length == 0) {
					song.instruments[selectedInstrumentIndex].patterns = [
						{
							"name": "Pattern 0",
							"notes": [],
							"params": []
						}
					];
				}
			},
			setCurrIndex: function (index) {
				currPattern = index;
			},
			getCurr: function () {
				return song.instruments[selectedInstrumentIndex].patterns[currPattern];
			},
			getCurrIndex: function () {
				return currPattern;
			},
			length: function () {
				return song.instruments[selectedInstrumentIndex].patterns[currPattern].length || 16;
			},
			getParams: function () {
				return song.instruments[selectedInstrumentIndex].patterns[currPattern].params[currParam] || [];
			},
			createParam: function (p, i) {
				if (!song.instruments[selectedInstrumentIndex].patterns[currPattern].params[currParam]) {
					song.instruments[selectedInstrumentIndex].patterns[currPattern].params[currParam] = [];
				}
				song.instruments[selectedInstrumentIndex].patterns[currPattern].params[currParam][i] = p;
			},
			removeParam: function (i) {
				if (!song.instruments[selectedInstrumentIndex].patterns[currPattern].params[currParam]) {
					song.instruments[selectedInstrumentIndex].patterns[currPattern].params[currParam] = [];
				}
				song.instruments[selectedInstrumentIndex].patterns[currPattern].params[currParam][i] = undefined;
			},
			getNotes: function () {
				return song.instruments[selectedInstrumentIndex].patterns[currPattern].notes;
			},
			setNotes: function (newNotes) {
				song.instruments[selectedInstrumentIndex].patterns[currPattern].notes = newNotes;
			},
			deleteNotes: function () {
				song.instruments[selectedInstrumentIndex].patterns[currPattern].notes = song.instruments[selectedInstrumentIndex].patterns[currPattern].notes.reduce(function (notes, note, id) {
					if (!note.selected) {
						notes.push(note);
					}
					return notes;
				}, []);
			},
			setNoteLengths: function (l) {
				song.instruments[selectedInstrumentIndex].patterns[currPattern].notes.forEach(function (n, id) {
					if (n.selected) {
						song.instruments[selectedInstrumentIndex].patterns[currPattern].notes[id].l = l;
					}
				});
			},
			// Add a note to the notes array
			createNote: function (x, y) {
				song.instruments[selectedInstrumentIndex].patterns[currPattern].notes.push({
					x: x,
					y: y,
					v: 1.0,
					l: 1.0,
					selected: true
				});
			},
			deselectAll: function () {
				song.instruments[selectedInstrumentIndex].patterns[currPattern].notes.forEach(function (n, id) {
					song.instruments[selectedInstrumentIndex].patterns[currPattern].notes[id].selected = false;
				});
			},
			selectNote: function (id) {
				song.instruments[selectedInstrumentIndex].patterns[currPattern].notes[id].selected = true;
			},
			isSelectedNote: function (id) {
				return song.instruments[selectedInstrumentIndex].patterns[currPattern].notes[id].selected;
			},
			deselectNote: function deselectNote(id) {
				song.instruments[selectedInstrumentIndex].patterns[currPattern].notes[id].selected = false;
			},
			toggleNoteSelection: function (id) {
				song.instruments[selectedInstrumentIndex].patterns[currPattern].notes[id].selected = !song.instruments[selectedInstrumentIndex].patterns[currPattern].notes[id].selected;
			},
			logNotes: function () {
				song.instruments[selectedInstrumentIndex].patterns[currPattern].notes.forEach(function logNote(n, id) {
					console.log('{x:' + n.x + ',y:' + n.y + ',v:' + n.v + ',l:' + n.l + '}');
				});
			}
		}

	};

	function y2noteNr(y) {
		return 108 - y
	}

	/**
	 * Play a pattern
	 *
	 * @param midiChannel {number} The midi channel
	 * @param instrumentType {object} An instrument type as defined in song.json
	 * @param midiMessages {array} The array with midi messages for each tick/step
	 * @param maxPats {number} The number of patterns from the instruments with the most patterns
	 * @returns {Function} callback for for each loop
	 */
	function playPattern(midiChannel, instrumentType, midiMessages, maxPats) {

		var mappedKeys;
		var hasMappedKeys = _.has(instrumentType, 'keys');
		if (hasMappedKeys) {
			mappedKeys = Object.keys(instrumentType.keys).reverse();
		}

		return function (pat, patIndex) {
			var patIndex = _.isUndefined(patIndex)?0:patIndex;

			pat.notes.forEach(function (note) {
				var noteX = ((patIndex * 16) + note.x);
				midiMessages[noteX] = midiMessages[noteX] || [];
				var noteNameNr;
				if (hasMappedKeys) {
					noteNameNr = mappedKeys[note.y];
				} else {
					noteNameNr = y2noteNr(note.y)
				}
				midiMessages[noteX].unshift(midiMsgr.noteOn(midiChannel, noteNameNr, Math.round(note.v * 127)));

				var offIndex = (noteX + note.l);

				// Make up for note releases after pattern end
				if (offIndex >= maxPats * 16) {
					offIndex -= (maxPats * 16);

				}
				midiMessages[offIndex] = midiMessages[offIndex] || [];
				midiMessages[offIndex].unshift(midiMsgr.noteOff(midiChannel, noteNameNr, Math.round(note.v * 127)));
			});

			pat.params.forEach(function (paramValues, index) {
				if(paramValues==null) {return;}
				var paramType = instrumentType.params[index];
				var isNrpn = paramType.type == 'nrpn';
				var isCC = paramType.type == 'cc';
				paramValues.forEach(function (paramValue) {
					if(paramValue == null) {return;}
					var paramX = ((patIndex * 16) + paramValue.x);
					midiMessages[paramX] = midiMessages[paramX] || [];
					if (isCC) {
						midiMessages[paramX] = midiMsgr.ctrlChange(midiChannel, paramType.cc, Math.round(paramValue.v * 127));
					}
					if (isNrpn) {
						var dm = Math.round(paramValue.v * 127);
						var msgs = midiMsgr.nrpn(midiChannel, paramType.nm, paramType.nl, dm, paramType.dl);
						msgs.reverse();
						msgs.forEach(function (msg) {
							midiMessages[paramX].unshift(msg);
						});
					}
				});
			});
		}
	}



});
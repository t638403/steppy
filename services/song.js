Box.Application.addService('song', function (application) {

	"use strict";

	var _ = application.getGlobal('_');
	var path = application.getGlobal('path');
	var fs = application.getGlobal('fs');
	var midi = application.getGlobal('midi');

	var sMetronome = application.getService('metronome').create(120);
	var sArrayLoop = application.getService('array-loop');
	var sMidiMsgr = application.getService('midi-msgr');
	var sInstr = application.getService('instrument');
	var sInstrType = application.getService('instrument-type');

	var song = JSON.parse(fs.readFileSync(path.join(__dirname, 'song.json'), {encoding: 'utf8'}));

	var isPlayingSong = false;
	var isPlayingPattern = false;

	var loop;
	var midiOut;
	sMetronome.on('quarter', function (nr) {
		var msgs = loop.next() || [];
		msgs.forEach(function (msg) {
			midiOut.sendMessage(msg);
		});
	});
	sMetronome.on('midiclock', function (nr) {
		midiOut.sendMessage(sMidiMsgr.clock());
	});

	var midiMate = 2;
	var currInstrument = 0;
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
				sMetronome.setBpm(song.bpm);
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
			sMetronome.stop();
			loop = sArrayLoop.create(calculateSongMidiMessages());
			midiOut = new midi.output();
			midiOut.openPort(midiMate);
			sMetronome.start();
			isPlayingSong = true;
		},
		stop: function () {
			if (midiOut) {
				// Send note off to each midi channel
				_.range(16).forEach(function(ch) {
					midiOut.sendMessage(sMidiMsgr.allNotesOff(ch))
				});
				midiOut.closePort();
			}
			sMetronome.stop();
			isPlayingSong = false;
		},
		open: function (name, cb) {
			if (midiOut) {
				midiOut.closePort();
			}
			sMetronome.stop();
			isPlayingSong = false;
			isPlayingPattern = false;

			fs.readFile(path.join(__dirname, '../songs/' + name + '.json'), {encoding: 'utf8'}, function (err, data) {
				if (err) {
					cb(err);
				} else {
					try {
						song = JSON.parse(data);
						currInstrument = 0;
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
				return song.instruments[currInstrument];
			},
			getSelectedInstrumentIndex: function () {
				return currInstrument;
			},
			setSelectedInstrumentIndex: function (index) {
				currInstrument = index;
				currParam = 0;
			},
			type: {
				getByName: function (name) {
					return sInstrType.getByName(name);
				},
				curr: function () {
					return sInstrType.getByName(song.instruments[currInstrument].type);
				}
			},
			key: {
				setCurr: function (k) {
					currKey = k;
				},
				getCurr: function () {
					return currKey;
				},
				down: function() {
					if(!isPlayingPattern && !isPlayingSong) {
						midiOut = new midi.output();
						midiOut.openPort(midiMate);
					}

					var midiChannel = song.instruments[currInstrument].ch
					var msg = sMidiMsgr.noteOn(midiChannel, currKey, 127);
					midiOut.sendMessage(msg);
				},
				up: function() {
					var midiChannel = song.instruments[currInstrument].ch
					var msg = sMidiMsgr.allNotesOff(midiChannel);
					midiOut.sendMessage(msg);

					if(!isPlayingPattern && !isPlayingSong) {
						midiOut.closePort();
					}
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
				sMetronome.stop();
				loop = sArrayLoop.create(calculatePatternMidiMessages());
				midiOut = new midi.output();
				midiOut.openPort(midiMate);
				sMetronome.start();
				isPlayingPattern = true;
			},
			stop: function () {
				if (midiOut) {
					_.range(16).forEach(function(ch) {
						midiOut.sendMessage(sMidiMsgr.allNotesOff(ch))
					});
					midiOut.closePort();
				}
				sMetronome.stop();
				isPlayingPattern = false;
			},
			list: function () {
				return song.instruments[currInstrument].patterns;
			},
			newOrder: function (newOrder) {
				var patterns = _.cloneDeep(song.instruments[currInstrument].patterns);
				var currPatternIsSet = false;
				newOrder.forEach(function (oldIndex, index) {
					if (!currPatternIsSet && oldIndex == currPattern) {
						currPattern = index;
						currPatternIsSet = true;
					}
					song.instruments[currInstrument].patterns[index] = patterns[oldIndex];
				});
				updateLoop();
			},
			duplicate: function (index) {
				var len = song.instruments[currInstrument].patterns.length;
				var duplicate = _.cloneDeep(song.instruments[currInstrument].patterns[index]);
				song.instruments[currInstrument].patterns.splice(index, 0, duplicate);
				song.instruments[currInstrument].patterns[index + 1].name = 'Pattern ' + len;
				currPattern = index + 1;
			},
			remove: function (index) {
				song.instruments[currInstrument].patterns.splice(index, 1);
				currPattern = index - 1;
				if (currPattern < 0) currPattern = 0;
				if (song.instruments[currInstrument].patterns.length == 0) {
					song.instruments[currInstrument].patterns = [
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
				return song.instruments[currInstrument].patterns[currPattern];
			},
			getCurrIndex: function () {
				return currPattern;
			},
			length: function () {
				return song.instruments[currInstrument].patterns[currPattern].length || 16;
			},
			getParams: function () {
				return song.instruments[currInstrument].patterns[currPattern].params[currParam] || [];
			},
			createParam: function (p, i) {
				if (!song.instruments[currInstrument].patterns[currPattern].params[currParam]) {
					song.instruments[currInstrument].patterns[currPattern].params[currParam] = [];
				}
				song.instruments[currInstrument].patterns[currPattern].params[currParam][i] = p;
				updateLoop();
			},
			removeParam: function (i) {
				if (!song.instruments[currInstrument].patterns[currPattern].params[currParam]) {
					song.instruments[currInstrument].patterns[currPattern].params[currParam] = [];
				}
				song.instruments[currInstrument].patterns[currPattern].params[currParam][i] = undefined;

				// Set params array to null if all values are null.
				// This happens when params are removed.
				// This way the params array keeps clean
				var allAreNull = true;
				var len = song.instruments[currInstrument].patterns[currPattern].params[currParam].length;
				for(var j=0; j<len; j++) {
					if(_.isObject(song.instruments[currInstrument].patterns[currPattern].params[currParam][j])) {
						allAreNull = false;
						break;
					}
				}
				if(allAreNull) {
					song.instruments[currInstrument].patterns[currPattern].params[currParam] = null;
				}

				updateLoop();
			},
			getNotes: function () {
				return song.instruments[currInstrument].patterns[currPattern].notes;
			},
			setNotes: function (newNotes) {
				song.instruments[currInstrument].patterns[currPattern].notes = newNotes;
				updateLoop();
			},
			deleteNotes: function () {
				song.instruments[currInstrument].patterns[currPattern].notes = song.instruments[currInstrument].patterns[currPattern].notes.reduce(function (notes, note, id) {
					if (!note.selected) {
						notes.push(note);
					}
					return notes;
				}, []);
				updateLoop();
			},
			setNoteLengths: function (l) {
				song.instruments[currInstrument].patterns[currPattern].notes.forEach(function (n, id) {
					if (n.selected) {
						song.instruments[currInstrument].patterns[currPattern].notes[id].l = l;
					}
				});
				updateLoop();
			},
			// Add a note to the notes array
			createNote: function (x, y) {
				song.instruments[currInstrument].patterns[currPattern].notes.push({
					x: x,
					y: y,
					v: 1.0,
					l: 1.0,
					selected: true
				});
				updateLoop();
			},
			deselectAll: function () {
				song.instruments[currInstrument].patterns[currPattern].notes.forEach(function (n, id) {
					song.instruments[currInstrument].patterns[currPattern].notes[id].selected = false;
				});
			},
			selectNote: function (id) {
				song.instruments[currInstrument].patterns[currPattern].notes[id].selected = true;
			},
			isSelectedNote: function (id) {
				return song.instruments[currInstrument].patterns[currPattern].notes[id].selected;
			},
			deselectNote: function deselectNote(id) {
				song.instruments[currInstrument].patterns[currPattern].notes[id].selected = false;
			},
			toggleNoteSelection: function (id) {
				song.instruments[currInstrument].patterns[currPattern].notes[id].selected = !song.instruments[currInstrument].patterns[currPattern].notes[id].selected;
			},
			logNotes: function () {
				song.instruments[currInstrument].patterns[currPattern].notes.forEach(function logNote(n, id) {
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
				midiMessages[noteX].unshift(sMidiMsgr.noteOn(midiChannel, noteNameNr, Math.round(note.v * 127)));

				var offIndex = (noteX + note.l);

				// Make up for note releases after pattern end
				if (offIndex >= maxPats * 16) {
					offIndex -= (maxPats * 16);

				}
				midiMessages[offIndex] = midiMessages[offIndex] || [];
				midiMessages[offIndex].unshift(sMidiMsgr.noteOff(midiChannel, noteNameNr, Math.round(note.v * 127)));
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
						var msg = sMidiMsgr.ctrlChange(midiChannel, paramType.cc, Math.round(paramValue.v * 127));
						midiMessages[paramX].unshift(msg);
					}
					if (isNrpn) {
						var dm = Math.round(paramValue.v * 127);
						var msgs = sMidiMsgr.nrpn(midiChannel, paramType.nm, paramType.nl, dm, paramType.dl);
						msgs.reverse();
						msgs.forEach(function (msg) {
							midiMessages[paramX].unshift(msg);
						});
					}
				});
			});
		}
	}

	function calculateSongMidiMessages() {
		var midiMessages = [];
		var maxPats = 0;
		song.instruments.forEach(function (instr) {

			var instrumentType = sInstrType.getByName(instr.type);
			maxPats = Math.max(maxPats, instr.patterns.length);

			instr.patterns.forEach(playPattern(instr.ch, instrumentType, midiMessages, maxPats));
		});

		// You don't want to end the last pattern after the last note, in stead fill up with nothing untill pattern
		// end is reached. e.g. total song must be devidable by 16 (pattern length)
		var trailingEmptyness = ((maxPats * 16) - midiMessages.length);
		for (var i = 0; i < trailingEmptyness; i++) {
			midiMessages.push(undefined);
		}
		return midiMessages;
	}

	function calculatePatternMidiMessages() {
		var instrument = song.instruments[currInstrument];
		var instrumentType = sInstrType.getByName(instrument.type);
		var midiMessages = [];
		var maxPats = 1;
		playPattern(instrument.ch, instrumentType, midiMessages, maxPats)(instrument.patterns[currPattern]);

		// You don't want to end the last pattern after the last note, in stead fill up with nothing untill pattern
		// end is reached. e.g. total song must be devidable by 16 (pattern length)
		var trailingEmptyness = ((maxPats * 16) - midiMessages.length);
		for (var i = 0; i < trailingEmptyness; i++) {
			midiMessages.push(undefined);
		}
		return midiMessages;
	}

	function updateLoop() {
		if(isPlayingSong) {
			sMetronome.stop();
			loop.update(calculateSongMidiMessages());
			sMetronome.start();
		} else if(isPlayingPattern) {
			sMetronome.stop();
			loop.update(calculatePatternMidiMessages());
			sMetronome.start();
		}
	}

});
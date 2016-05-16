Box.Application.addService('song', function(application) {

	var _ = application.getGlobal('_');
	var path = application.getGlobal('path');

	var song = require(path.join(__dirname, 'song.json'));

	var selectedInstrumentIndex = 0;
	var currPattern = 0;
	var currKey = 'C4';
	var currParam = 0;


	return {
		name:function() {
			return song.name;
		},
		instrument:{
			list:function() {
				return song.instruments;
			},
			getSelectedInstrument:function() {
				return song.instruments[selectedInstrumentIndex];
			},
			getSelectedInstrumentIndex:function() {
				return selectedInstrumentIndex;
			},
			setSelectedInstrumentIndex:function(index) {
				selectedInstrumentIndex = index;
				currParam = 0;
			},
			type:{
				getByName:function(name) {
					return _.find(song['instrument-types'], {name:name})
				},
				curr:function() {
					return _.find(song['instrument-types'], {name:song.instruments[selectedInstrumentIndex].type})
				}
			},
			key:{
				setCurr:function(k) {
					currKey = k;
				},
				getCurr:function() {
					return currKey;
				}
			},
			param:{
				getCurr:function(){
					return currParam;
				},
				setCurr:function(p) {
					currParam = p;
				}
			}
		},
		pattern : {
			list:function(){
				return song.instruments[selectedInstrumentIndex].patterns;
			},
			newOrder:function(order) {
				var patterns = _.cloneDeep(song.instruments[selectedInstrumentIndex].patterns);
				order.forEach(function(oldIndex, index) {
					if(oldIndex == currPattern) {
						currPattern = index;
					}
					song.instruments[selectedInstrumentIndex].patterns[index] = patterns[oldIndex];
				});
			},
			setCurrIndex:function(index) {
				currPattern = index;
			},
			getCurr:function() {
				return song.instruments[selectedInstrumentIndex].patterns[currPattern];
			},
			getCurrIndex:function() {
				return currPattern;
			},
			length:function() {
				return song.instruments[selectedInstrumentIndex].patterns[currPattern].length || 16;
			},
			getParams:function() {
				return song.instruments[selectedInstrumentIndex].patterns[currPattern].params[currParam] || [];
			},
			createParam: function(p, i) {
				if(!song.instruments[selectedInstrumentIndex].patterns[currPattern].params[currParam]) {
					song.instruments[selectedInstrumentIndex].patterns[currPattern].params[currParam] = [];
				}
				song.instruments[selectedInstrumentIndex].patterns[currPattern].params[currParam][i] = p;
			},
			removeParam:function(i) {
				if(!song.instruments[selectedInstrumentIndex].patterns[currPattern].params[currParam]) {
					song.instruments[selectedInstrumentIndex].patterns[currPattern].params[currParam] = [];
				}
				song.instruments[selectedInstrumentIndex].patterns[currPattern].params[currParam][i] = undefined;
			},
			getNotes:function() {
				return song.instruments[selectedInstrumentIndex].patterns[currPattern].notes;
			},
			setNotes: function(newNotes) {
				song.instruments[selectedInstrumentIndex].patterns[currPattern].notes = newNotes;
			},
			deleteNotes:function() {
				song.instruments[selectedInstrumentIndex].patterns[currPattern].notes = song.instruments[selectedInstrumentIndex].patterns[currPattern].notes.reduce(function(notes, note, id) {
					if(!note.selected) {
						notes.push(note);
					}
					return notes;
				}, []);
			},
			setNoteLengths:function(l) {
				song.instruments[selectedInstrumentIndex].patterns[currPattern].notes.forEach(function(n, id) {
					if(n.selected) {
						song.instruments[selectedInstrumentIndex].patterns[currPattern].notes[id].l = l;
					}
				});
			},
			// Add a note to the notes array
			createNote: function (x, y) {
				song.instruments[selectedInstrumentIndex].patterns[currPattern].notes.push({
					x:x,
					y:y,
					v:1.0,
					l:1.0,
					selected:true
				});
			},
			deselectAll:function() {
				song.instruments[selectedInstrumentIndex].patterns[currPattern].notes.forEach(function(n, id) {
					song.instruments[selectedInstrumentIndex].patterns[currPattern].notes[id].selected = false;
				});
			},
			selectNote: function(id) {
				song.instruments[selectedInstrumentIndex].patterns[currPattern].notes[id].selected = true;
			},
			isSelectedNote: function(id) {
				return song.instruments[selectedInstrumentIndex].patterns[currPattern].notes[id].selected;
			},
			deselectNote: function deselectNote(id) {
				song.instruments[selectedInstrumentIndex].patterns[currPattern].notes[id].selected = false;
			},
			toggleNoteSelection: function(id) {
				song.instruments[selectedInstrumentIndex].patterns[currPattern].notes[id].selected = !song.instruments[selectedInstrumentIndex].patterns[currPattern].notes[id].selected;
			},
			logNotes:function() {
				song.instruments[selectedInstrumentIndex].patterns[currPattern].notes.forEach(function logNote(n, id) {
					console.log('{x:'+n.x+',y:'+n.y+',v:'+n.v+',l:'+n.l+'}');
				});
			}
		}

	};



});
Box.Application.addService('midi-msgr', function(application) {

	var keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

	var _ = application.getGlobal('_');
	var util = application.getGlobal('util');

	return {
		noteOn:noteOn,
		noteOff:noteOff,
		ctrlChange:ctrChange,
		programChange:programChange,
		bankSelectMsb:bankSelectMsb,
		bankSelectLsb:bankSelectLsb,
		allNotesOff:allNotesOff,
		allSoundsOff:allSoundsOff,
		afterTouch:afterTouch,
		clock:clock,
		noteNrToStr:noteNrToStr,
		noteStrToNr:noteStrToNr,
		isBlackNote:isBlackNote
	};

	function noteOn(channelNr, noteName_or_noteNr, velocity) {
		var note_on = 143 + channelNr;
		var note_number = (typeof noteName_or_noteNr == 'string')?getNoteNumber(noteName_or_noteNr):noteName_or_noteNr;
		return [note_on, note_number, velocity];
	}

	function noteOff(channelNr, noteName_or_noteNr, velocity) {
		var note_off = 127 + channelNr;
		var note_number = (typeof noteName_or_noteNr == 'string')?getNoteNumber(noteName_or_noteNr):noteName_or_noteNr;
		return [note_off, note_number, velocity];
	}

	function getNoteNumber(nameAndOctave) {
		var names = {'C':12,'C#':13,'D':14,'D#':15,'E':16,'F':17,'F#':18,'G':19,'G#':20,'A':21,'A#':22,'B':23};
		var parts = nameAndOctave.toUpperCase().match(/^([CDEFGAB](|#))((|-)\d)$/);
		var name = parts[1];
		if(!(name in names)) {throw new Error(util.format('Invalid note name \'%s\'', nameAndOctave));}
		var octave = parseInt(parts[3]);
		var noteNr = names[name] + (octave * 12);
		if(noteNr<0 || noteNr > 127) {throw new Error('Note nr out of bounds, must be 0-127')}
		return noteNr
	}

	function ctrChange(channelNr, ctrl, value) {
		if(!_.isNumber(ctrl) || ctrl < 0 || ctrl > 127) {throw new Error('Ctrl index out of bounds, must be 0-127')}
		if(!_.isNumber(value) || value < 0 || value > 127) {throw new Error('Ctrl value must be 0-127')}
		var Bn = parseInt('0xB0', 16) + (channelNr - 1);
		if(!_.isNumber(Bn) || Bn < 176 || Bn > 191) {throw new Error('Ctr Bn index out of bounds, must be 176-191');}
		return [Bn, ctrl, value];
	}

	function programChange(channelNr, v) {
		var Cn = parseInt('0xC0', 16) + (channelNr - 1);
		return [Cn, v];
	}

	function afterTouch(channelNr, v) {
		var Dn = parseInt('0xD0', 16) + (channelNr - 1);
		return [Dn, v];
	}

	function allSoundsOff(channelNr) {
		var Bn = parseInt('0xB0', 16) + (channelNr - 1);
		return [Bn, parseInt('0x78', 16), 0];
	}

	function allNotesOff(channelNr) {
		var Bn = parseInt('0xB0', 16) + (channelNr - 1);
		return [Bn, parseInt('0x7B', 16), 0];
	}

	function bankSelectMsb(v) {
		return ctrChange(parseInt('0x00', 16), v);
	}

	function bankSelectLsb(v) {
		return ctrChange(parseInt('0x20', 16), v);
	}

	function clock() {
		return [248];
	}

	/* HELPER FUNCTIONS */

	function noteNrToStr(nr) {

		if(typeof nr !== 'number') throw new Error('input must be a number');
		if( !(nr > 20 && nr < 109) ) throw new Error('input should be 20 < nr < 109');

		var octave = Math.floor(nr/12);
		var key = (nr - (octave * 12));
		return keys[key] + (octave - 1);
	}

	function noteStrToNr(str) {

		if(typeof str !== 'string') throw new Error('input must be a string');
		if(!/^[ABCDEFG](#|)\d$/.test(str)) {throw new Error('Invalid note string ' + str);}

		var key = str.replace(/\d$/, '');
		var nr = keys.indexOf(key);
		if(nr === -1) throw new Error('Invalid key ' + key);

		var octave = (parseInt(str.replace(/^.*?(\d)$/, '$1')) + 1);

		return ((octave * 12) + nr);

	}

	function isBlackNote(nr) {

		if(typeof nr !== 'number') throw new Error('input must be a number');
		if( !(nr > 20 && nr < 109) ) throw new Error('input should be 20 < nr < 109');

		return /#/.test(noteNrToStr(nr))
	}

});
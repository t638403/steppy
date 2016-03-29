module.exports = MidiMsgr;

function MidiMsgr(application) {

	var keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

	return {
		noteNrToStr:noteNrToStr,
		noteStrToNr:noteStrToNr,
		isBlackNote:isBlackNote
	}

	function noteNrToStr(nr) {

		if(typeof nr !== 'number') throw new Error('input must be a number');
		if( !(nr > 20 && nr < 109) ) throw new Error('input should be 20 < nr < 109');

		var octave = Math.floor(nr/12);
		var key = (nr - (octave * 12));
		return keys[key] + (octave - 1);
	}

	function noteStrToNr(str) {

		if(typeof str !== 'string') throw new Error('input must be a string');
		if(!/^[ABCDEFG](#|)\d$/.test(str)) throw new Error('Invalid note string ' + str)

		var key = str.replace(/\d$/, '');
		var nr = keys.indexOf(key);
		if(nr === -1) throw new Error('Invalid key ' + key);

		var octave = parseInt(str.replace(/^.*?(\d)$/, '$1')) + 1

		return ((octave * 12) + nr);

	}

	function isBlackNote(nr) {

		if(typeof nr !== 'number') throw new Error('input must be a number');
		if( !(nr > 20 && nr < 109) ) throw new Error('input should be 20 < nr < 109');

		return /#/.test(noteNrToStr(nr))
	}

}
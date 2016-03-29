var ejs = require('ejs'),
	_ = require('lodash');

module.exports = PatternList;

function PatternList(context) {

	'use strict';

	var moduleEl,
		srv,
		tpls,
		blackkeys,
		selectedKey;

	return {
		init:init,
		destroy:destroy,
		onclick:onclick,
		oncontextmenu:onrightclick
	}

	function init() {

		moduleEl = context.getElement();

		tpls = {
			key:ejs.compile('<td data-type="key" data-note-nr="<%= noteNr %>" class="key noselect"><%= noteName %></td>'),
			noteRow:ejs.compile('<tr class="note-row noselect"><%= noteNr %></tr>'),
			note:ejs.compile('<td data-type="note" data-note-nr="<%= noteNr %>" data-note-index="<%= noteIndex %>" class="noselect"><div class="note-inner"></div></td>')
		}

		srv = {
			pattern:context.getService('pattern'),
			midiMsgr:context.getService('midi-msgr')
		};

		blackkeys = []
		_.range(9).forEach(function(octave) {
			var increment = octave * 12;
			[1, 3, 6, 8, 10].forEach(function(blackkey) {
				blackkeys.push(blackkey + increment);
			});
		});

		selectedKey = 60; // central c;

		render();

	}

	function destroy() {
		moduleEl = null;
		srv = null;
		tpls = null;
		blackkeys = null;
	}

	function onclick(event, elem, type) {

		switch(type) {
			case 'note':
				console.log('click', $(elem).data('note-index'), $(elem).data('note-nr'))
				break;
			default:
				console.log(type);
				break;
		}

	}

	function onrightclick(event, elem, type) {

		switch(type) {
			case 'note':
				console.log('right click', $(elem).data('note-index'), $(elem).data('note-nr'))
				break;
		}

	}

	function render() {

		var $noteTable = $(moduleEl).find('.note-table');
		var $noteRow;
		var $cell;

		for(var noteNr=108; noteNr>20; noteNr--) {

			var noteName = srv.midiMsgr.noteNrToStr(noteNr);
			var isBlackNote = srv.midiMsgr.isBlackNote(noteNr);

			$noteRow = $(tpls.noteRow({noteNr:noteNr}));

			for(var colIndex=0; colIndex<(1+16); colIndex++) {

				// First column is the keyboard
				if(colIndex == 0) {
					$cell = $(tpls.key({noteNr:noteNr, noteName:noteName}));
				} else {
					$cell = $(tpls.note({noteNr:noteNr, noteIndex:(colIndex - 1)}))
				}

				if(isBlackNote) {
					$cell.addClass('black');
				}
				if(noteName == 'C4') {
					$cell.addClass('central-c');
				}

				$noteRow.append($cell);

			}

			$noteTable.append($noteRow);

		}
	}

}
Box.Application.addModule('instruments', function(context) {

	"use strict";

	var $,
		$elem,
		song,
		instrType,
		types;

	return {
		messages:[],
		onmessage:onmessage,
		init:init,
		destroy:destroy
	};

	function init() {
		$ = context.getGlobal('jQuery');
		$elem = $(context.getElement());
		song = context.getService('song');
		instrType = context.getService('instrument-type');

		types = song.instrument.list().map(function(instr){return instrType.getByName(instr.type);});

	}

	function destroy() {
		$ = null;
		$elem = null;
	}

	function onmessage(name, data) {}
});
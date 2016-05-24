Box.Application.addModule('instruments', function(context) {

	"use strict";

	var $,
		$elem,
		song,
		types;

	return {
		messages:['layout-part-H'],
		onmessage:onmessage,
		init:init,
		destroy:destroy
	};

	function init() {
		$ = context.getGlobal('jQuery');
		$elem = $(context.getElement());
		song = context.getService('song');
		types = song.instrument.list().map(function(instr){return song.instrument.type.getByName(instr.type);});

		console.log(types[0])

	}

	function destroy() {
		$ = null;
		$elem = null;
	}

	function onmessage(name, data) {
		if(name == 'layout-part-H') {
			$elem.css(data);
		}
	}
});
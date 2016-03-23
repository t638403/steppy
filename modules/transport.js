module.exports = Transport;

function Transport(context) {

	'use strict';

	var moduleEl,
		pattern;

	return {
		init:init,
		destroy:destroy,
		onclick:onclick
	}

	function init() {
		moduleEl = context.getElement();
	}
	function destroy() {
		moduleEl = null;
	}
	function onclick(event, element, elementType) {
		console.log('transport: ' + elementType);
	}

	function addPattern() {

	}

}
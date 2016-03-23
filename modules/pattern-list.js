module.exports = PatternList;

function PatternList(context) {

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
		pattern = context.getService('pattern');

		$(moduleEl).height($(window).height());
		$(window).resize(function() {
			$(moduleEl).height($(window).height());
		});
	}
	function destroy() {
		moduleEl = null;
		pattern = null;
	}
	function onclick(event, element, elementType) {
		console.log('pattern-list: ' + elementType);
	}

	function addPattern() {

	}

}
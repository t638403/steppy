var ejs = require('ejs'),
	_ = require('lodash');

module.exports = PatternSettings;

function PatternSettings(context) {

	'use strict';

	var moduleEl;

	return {
		init:init,
		destroy:destroy,
		onclick:onclick,
	}

	function init() {

		moduleEl = context.getElement();

	}

	function destroy() {
		moduleEl = null;
	}

	function onclick(event, elem, type) {

		console.log(type);

	}

}
var	path = require('path');

module.exports = function (application) {

	'use strict';

	var srv;

	var entity =  application.getService('entity-factory').create(path.join(__dirname, '../instrument-type'));

	return {
		init:init,
		destroy:destroy,
		save:entity.save,
		read:entity.read,
		list:entity.list
	}

	function init() {
		srv = {};
	}

	function destroy() {
		srv = null;
	}

}
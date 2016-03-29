var ejs = require('ejs'),
	_ = require('lodash');

module.exports = PatternSettings;

function PatternSettings(context) {

	'use strict';

	var moduleEl,
		srv,
		tpls;

	return {
		init:init,
		destroy:destroy,
		onclick:onclick
	}

	function init() {

		moduleEl = context.getElement();

		srv = {
			rangeMapper:context.getService('range-mapper')
		}

		tpls = {
			param:ejs.compile('<td data-type="param-level" data-note-index="<%= noteIndex %>"><div class="level"></div></td>')
		}

		render();

	}

	function destroy() {
		moduleEl = null;
	}

	function onclick(event, elem, type) {

		switch(type) {
			case 'param-level':
				var thisHeight = $(elem).height();
				var rm = srv.rangeMapper.create(thisHeight+2, 0, 0, 127);
				var x = event.pageX - $(elem).offset().left;
				var y = event.pageY - $(elem).offset().top;

				var val = Math.round(rm(y));

				$(elem).find('.level').height(thisHeight - y);

				break;
		}

	}

	function render() {
		var $tr = $(moduleEl).find('.param-table tr:first-child');
		for(var colIndex=0; colIndex<(1+16); colIndex++) {

			if(colIndex ==0) {
				$tr.append($('<td data-type="param-level"><div class="level noselect"></div></td>'));
			} else {
				$tr.append($(tpls.param({noteIndex:(colIndex - 1)})));
			}

		}
	}

}
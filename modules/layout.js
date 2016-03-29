var ejs = require('ejs'),
	_ = require('lodash');

module.exports = Layout;

function Layout(context) {

	'use strict';

	var moduleEl,
		$patternView,
		$patternParams;

	return {
		init:init,
		destroy:destroy,
		onclick:onclick,
	}

	function init() {

		moduleEl = context.getElement();

		$patternView = $('[data-module="pattern-view"]');
		$patternParams = $('[data-module="pattern-params"]');

		$patternParams.scroll(function() {
			$patternView.scrollLeft($patternParams.scrollLeft());
		})

		$(document).ready(setModuleWidthHeight);
		$(window).resize(setModuleWidthHeight);

	}

	function setModuleWidthHeight() {

		var wHeight = $(window).height();
 		var wWidth =  $(window).width();

		var menuHeight = $('[data-module="menu-bar"]').height();
		var patternListWidth = $('[data-module="pattern-list"]').width();
		var patternParamsHeight = $patternParams.height();
		var patternViewHeight =  (wHeight - (patternParamsHeight + menuHeight));
		var patternViewWidth =  (wWidth - (patternListWidth));


		$patternView.width(patternViewWidth);
		$patternView.height(patternViewHeight);
		$patternView.scrollTop( ($patternView.find('.note-table-wrapper').height() - $patternView.height() )/ 2);

		$patternParams.width(patternViewWidth);

		$patternView.scroll(function() {

		})

		$('[data-module="pattern-list"] .patterns').height(patternViewHeight);
	}

	function destroy() {
		moduleEl = null;
		$patternView = null;
		$patternParams = null;
	}

	function onclick(event, elem, type) {

	}

}
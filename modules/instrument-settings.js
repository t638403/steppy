

module.exports = InstrumentSettings;

function InstrumentSettings(context) {

	'use strict';

	var moduleEl,
		srv,
		instrTypes;

	return {
		init:init,
		destroy:destroy,
		onclick:onclick
	}

	function init() {

		moduleEl = context.getElement();

		srv = {
			insrType:context.getService('instrument-type')
		}


		srv.insrType
			.list()
			.then(function(its) {
				instrTypes = its;
				render();
			});
	}

	function destroy() {
		moduleEl = null;
	}

	function onclick(event, elem, type) {

		console.log(type);

	}

	function render() {
		var $instrTypeSel = $('[data-type="select-entity"]');
		instrTypes.forEach(function(instrType) {
			$instrTypeSel.append($('<option value="'+instrType.id+'">'+instrType.name+'</option>'));
		});

	}

}
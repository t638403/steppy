Box.Application.addModule('song', function(context) {
	var $,
		$elem,
		cfg,
		song,
		params;

	return {
		messages:['layout-part-D', 'pianokeypress'],
		init:init,
		destroy:destroy,
		onchange:onchange,
		onmessage:function onmessage(name, data) {
			if(name == 'layout-part-D') {
				$elem.css(data).css(data);
				$elem.height(data.height + 15);
			}
			if(name == 'pianokeypress') {
				song.instrument.param.setCurr(0);
				render();
			}
		}
	};

	function init() {
		$ = context.getGlobal('jQuery');
		$elem = $(context.getElement());
		cfg = context.getConfig();
		song = context.getService('song');

		render();
	}

	function destroy() {
		$ = null;
		$elem = null;
		cfg = null;

		song = null;
	}

	function onchange(event, elem, elemType) {
		var $this = $(elem);
		switch(elemType) {
			case 'instruments':
				var selectedInstrumentIndex = parseInt($(elem).find('option:selected').val());
				song.pattern.setCurrIndex(0);
				song.instrument.setSelectedInstrumentIndex(selectedInstrumentIndex);
				context.broadcast('instrumentchange');
				render();
				break;
			case 'params':
				song.instrument.param.setCurr(parseInt($this.val()));
				context.broadcast('paramchange');
				break;
		}
	}

	function render() {
		$elem.find('input[data-type="name"]').val(song.name());

		$instruments = $elem.find('select[data-type="instruments"]');
		$instruments.html('');
		var instruments = song.instrument.list();
		instruments.forEach(function(instrument, i) {
			var $option = $('<option value="'+i+'">' + instrument.name + '</option>');
			$instruments.append($option);
		});
		$instruments.val(song.instrument.getSelectedInstrumentIndex());

		$params = $elem.find('select[data-type="params"]');
		$params.html('');

		var type = song.instrument.type.curr();
		var mappedKeys = _.has(type, 'keys')?type.keys: null;
		type.params.forEach(function(param, i) {

			// If param has no key linked to it
			// If param is global
			// If param has currently selected key linked to it
			if(!_.has(param, 'key') || param.key == '*' || (mappedKeys && param.key == mappedKeys[song.instrument.key.getCurr()])) {
				var $option = $('<option value="'+i+'">' + param.name + '</option>');
				$params.append($option);
			}
		});
		$params.val($params.find('option:first').val());
	}
});
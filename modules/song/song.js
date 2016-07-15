Box.Application.addModule('song', function(context) {
	var $,
		$elem,
		cfg,
		sSong,
		params;

	return {
		messages:['pianokeypress', 'paramedited'],
		init:init,
		destroy:destroy,
		onchange:onchange,
		onclick:onclick,
		ondblclick:ondblclick,
		onmessage:onmessage
	};

	function init() {
		$ = context.getGlobal('jQuery');
		$elem = $(context.getElement());
		cfg = context.getConfig();
		sSong = context.getService('song');

		$elem.find('[data-type="song-name"]').val(sSong.name());

		render();
	}

	function destroy() {
		$ = null;
		$elem = null;
		cfg = null;

		sSong = null;
	}

	function onclick(event, elem, elemType) {
		var $this = $(elem);
		switch(elemType) {
			case 'song-new':
				sSong.new();
				render();
				context.broadcast('instrumentchange');
				context.broadcast('patternchange');
				context.broadcast('paramchange');
				context.broadcast('info', 'Loaded empty song');
				break;
			case 'song-save':
				sSong.save(function(err) {
					if(err) {
						context.broadcast('error', err.toString());
					} else {
						context.broadcast('ok', 'File saved');
					}
				})
				break;
			case 'song-open':
				var name = $elem.find('[data-type="song-name"]').val();
				sSong.open(name, function(err) {
					if(err) {
						context.broadcast('error', err.toString());
					} else {
						context.broadcast('instrumentchange');
						context.broadcast('patternchange');
						context.broadcast('paramchange');
						render();
						context.broadcast('ok', 'File loaded');
					}
				});
				break;
			case 'song-play':
				sSong.play();
				context.broadcast('ok', '<i class="fa fa-music" aria-hidden="true"></i> Now playing <i class="fa fa-music" aria-hidden="true"></i>')
				break;
			case 'song-stop':
				sSong.stop();
				context.broadcast('ok', 'Music stopped')
				break;
		}
	}

	function onchange(event, elem, elemType) {
		var $this = $(elem);
		switch(elemType) {
			case 'instruments':
				var selectedInstrumentIndex = parseInt($(elem).find('option:selected').val());
				sSong.pattern.setCurrIndex(0);
				sSong.instrument.setSelectedInstrumentIndex(selectedInstrumentIndex);
				context.broadcast('instrumentchange');
				render();
				break;
			case 'params':
				sSong.instrument.param.setCurr(parseInt($this.val()));
				context.broadcast('paramchange');
				break;
			case 'song-name':
				sSong.name($this.val());
				render();
				context.broadcast('info', 'Song name changed to ' + sSong.name())
				break;
			case 'song-bpm':
				sSong.bpm($this.val());
				render();
				context.broadcast('info', 'Bpm name changed to ' + sSong.bpm())
				break;
		}
	}

	function render() {

		$elem.find('input[data-type="song-name"]').val(sSong.name());
		$elem.find('input[data-type="song-bpm"]').val(sSong.bpm());

		$instruments = $elem.find('select[data-type="instruments"]');
		$instruments.html('');
		var instruments = sSong.instrument.list();
		instruments.forEach(function(instrument, i) {
			var $option = $('<option value="'+i+'">' + instrument.name + '</option>');
			$instruments.append($option);
		});
		$instruments.val(sSong.instrument.getSelectedInstrumentIndex());

		$params = $elem.find('select[data-type="params"]');
		$params.html('');

		var type = sSong.instrument.type.curr();
		var mappedKeys = _.has(type, 'keys')?type.keys: null;
		var currPat = sSong.pattern.getCurr();
		var currParam = sSong.instrument.param.getCurr();
		type.params.forEach(function(param, i) {

			// If param has no key linked to it
			// If param is global
			// If param has currently selected key linked to it
			if(!_.has(param, 'key') || param.key == '*' || (mappedKeys && param.key == mappedKeys[sSong.instrument.key.getCurr()])) {
				var $option = $('<option value="'+i+'">' + param.name + '</option>');

				var paramIsUsed = (_.isArray(currPat.params[i]) && currPat.params[i].length > 0)
				if(paramIsUsed) {
					$option.css('font-weight','bold');
				}
				$params.append($option);
			}
		});
		$params.val(currParam);
	}

	function onmessage(name, data) {
		if(name == 'pianokeypress') {
			sSong.instrument.param.setCurr(0);
			render();
		}
		if(name == 'paramedited') {
			render();
		}
	}

});
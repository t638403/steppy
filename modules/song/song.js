Box.Application.addModule('song', function(context) {
	var $,
		$elem,
		cfg,
		song,
		params;

	return {
		messages:['pianokeypress'],
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
		song = context.getService('song');

		$elem.find('[data-type="song-name"]').val(song.name());

		render();
	}

	function destroy() {
		$ = null;
		$elem = null;
		cfg = null;

		song = null;
	}

	function onclick(event, elem, elemType) {
		var $this = $(elem);
		switch(elemType) {
			case 'song-new':
				song.new();
				render();
				context.broadcast('instrumentchange');
				context.broadcast('patternchange');
				context.broadcast('paramchange');
				context.broadcast('info', 'Loaded empty song');
				break;
			case 'song-save':
				song.save(function(err) {
					if(err) {
						context.broadcast('error', err.toString());
					} else {
						context.broadcast('ok', 'File saved');
					}
				})
				break;
			case 'song-open':
				var name = $elem.find('[data-type="song-name"]').val();
				song.open(name, function(err) {
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
				song.play();
				context.broadcast('ok', '<i class="fa fa-music" aria-hidden="true"></i> Now playing <i class="fa fa-music" aria-hidden="true"></i>')
				break;
			case 'song-stop':
				song.stop();
				context.broadcast('ok', 'Music stopped')
				break;
		}
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
			case 'song-name':
				song.name($this.val());
				render();
				context.broadcast('info', 'Song name changed to ' + song.name())
				break;
			case 'song-bpm':
				song.bpm($this.val());
				render();
				context.broadcast('info', 'Bpm name changed to ' + song.bpm())
				break;
		}
	}

	function render() {

		$elem.find('input[data-type="song-name"]').val(song.name());
		$elem.find('input[data-type="song-bpm"]').val(song.bpm());

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

	function onmessage(name, data) {
		if(name == 'pianokeypress') {
			song.instrument.param.setCurr(0);
			render();
		}
	}

});
Box.Application.addModule('piano', function(context) {
    
    var $,
		cfg,
		$elem,
        $piano,
		midiMsgr,
        keys,
        isPressingKey,
		song,
		mappedKeys;

    return {
		messages:['gridscroll', 'instrumentchange'],
        init:init,
        destroy:destroy,
        onmousedown:onmousedown,
        onmouseup:onmouseup,
		onmessage:onmessage
    };

    function init() {
        $ = context.getGlobal('jQuery');
		cfg = context.getConfig();
        var range = context.getGlobal('_').range;
		midiMsgr = context.getService('midi-msgr');
		song = context.getService('song');

		$elem = $(context.getElement());
        $piano = $elem.find('[data-type="piano"]');

        keys = range(88).map(createKey);
        isPressingKey = false;

		var type = song.instrument.type.curr();
		mappedKeys = _.has(type, 'keys')?type.keys: null;
		if(mappedKeys) {
			song.instrument.key.setCurr(Object.keys(mappedKeys)[0]);
		}

		// prevent piano from scrolling. Scrolling the piano is
		// supposed to be done by scrolling the grid
		$elem.on('mousewheel', preventEvent);

        render();
    }

	function preventEvent() {return false;}

    function destroy() {
		$ = null;
		$piano = null;
		keys = null;
		isPressingKey = null;
		midiMsgr = null;
		song = null;
	}

    function onmousedown(event, element, elementType) {
        var $this = $(element);
        switch(elementType) {
            case "key":
                isPressingKey = true;
                var id = parseInt($this.data('id'));
				song.instrument.key.setCurr(midiMsgr.noteNrToStr(id2notenr(id)));
				context.broadcast('pianokeypress', id2notenr(id));
                keys[id].pressed = true;
                render();
                break;
        }
    }
    
    function onmouseup(event, elem, elemType) {
        var $this = $(elem);
        if(isPressingKey) {
            isPressingKey = false;
            keys.forEach(releaseKey);
            render();
        }
    }

    function releaseKey(key, id) {
        keys[id].pressed = false;
    }

    function createKey(id) {
        return {
            id:id,
            pressed:false
        }
    }

    function render() {
		$piano.html('');
		$piano.height(cfg.y * 87);
		if(mappedKeys) {
			$piano.height(cfg.y * Object.keys(mappedKeys).length);
		}
        keys.forEach(renderKey);
    }

	function id2notenr(id) {
		return 108 - id;
	}

    function renderKey(k, i) {
		var noteStr = midiMsgr.noteNrToStr(id2notenr(i));
        var $key = $('<div data-type="key" data-id="'+k.id+'"  ondragstart="return false;" />');
		$key.html(noteStr);
		$key.removeClass('curr');

		// write key alias as defined in current instrument type
		if(mappedKeys && mappedKeys[noteStr]) {
			$key.html(mappedKeys[noteStr]);
			if(song.instrument.key.getCurr() == noteStr) {
				$key.addClass('curr');
			}
			$piano.append($key);
		}
		$key.css('line-height', cfg.y + 'px');

		if(!mappedKeys && midiMsgr.isBlackNote(id2notenr(i))) {
			$key.addClass('black');
		}
		if(!mappedKeys && noteStr == 'C4') {
			!$key.addClass('central-c')
		}
		$key.height(cfg.y);
        if(k.pressed) {
            $key.addClass('pressed');
        }
		if(!mappedKeys) {
        	$piano.append($key);
		}
    }

	function onmessage(name, data) {
		if(name == 'gridscroll') {
			$elem.scrollTop(data.top);
		}
		if(name == 'instrumentchange') {
			var type = song.instrument.type.curr();
			mappedKeys = _.has(type, 'keys')?type.keys: null;
			if(mappedKeys) {
				song.instrument.key.setCurr(Object.keys(mappedKeys)[0]);
			}
			render();
		}
	}
});

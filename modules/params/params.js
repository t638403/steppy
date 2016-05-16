Box.Application.addModule('params', function(context) {

	var $,
		$elem,
		cfg,
		$params,
		song;

	return {
		messages:['layout-part-F', 'gridscroll', 'patternchange', 'paramchange', 'instrumentchange'],
		init:init,
		destroy:destroy,
		onclick:onclick,
		onmessage:function onmessage(name, data) {
			if(name == 'layout-part-F') {
				$elem.css(data).css(data);
				$elem.height(data.height + 15);
			}
			if(name == 'gridscroll') {
				$elem.scrollLeft(data.left);
			}
			if(name == 'patternchange') {
				render();
			}
			if(name == 'paramchange') {
				render();
			}
			if(name == 'instrumentchange') {
				render();
			}
			if(name == 'pianokeypress') {
				render();
			}
		}
	};

	function init() {
		$ = context.getGlobal('jQuery');
		$elem = $(context.getElement());
		cfg = context.getConfig();
		song = context.getService('song');

		$params = $elem.find('[data-type="params"]');

		// prevent params from scrolling. Scrolling the params is
		// supposed to be done by scrolling the grid
		$elem.on('mousewheel', preventEvent);

		render();
	}

	function destroy() {
		$ = null;
		$elem = null;
		cfg = null;

		$params = null;
		song = null;
		$elem.off('mousewheel', preventEvent);
	}

	function preventEvent() {return false;}

	function onclick(event, elem, elemType) {
		var $this = $(elem);
		var id;
		switch(elemType) {
			case 'param':
				id = parseInt($this.data('id'));
				var h = $params.height();
				song.pattern.createParam({
					x:id,
					v:(( h - (event.clientY - parseInt($elem.css('top')))) / h)
				}, id);
				render();
				break;
			case 'remove-param':
				id = parseInt($this.data('id'));
				song.pattern.removeParam(id);
				render();
				break;
		}
	}

	function renderParam(p, i) {
		p =  song.pattern.getParams()[p];
		var h = $params.height();
		var $param = $('<div data-type="param" data-id="'+ i +'"  ondragstart="return false;" />');
		$param.width(cfg.x);
		var $innerParam = $('<div class="inner-param" />');
		var $removeParam = $('<button data-type="remove-param" data-id="'+ i +'"><i class="fa fa-eraser"></i></button>');
		if(!p) {
			$param.addClass('empty');
			$innerParam.css({
				'height': '0px',
				'margin-top': h +'px'
			});
		} else {
			$innerParam.css({
				'height': (p.v * h)+'px',
				'margin-top': (h - (p.v * h)) +'px'
			});
			$param.append($removeParam);
		}

		$param.append($innerParam);
		$params.append($param);
	}

	function render() {
		$params.html('');
		$params.width(song.pattern.length() * cfg.x);
		_.range(song.pattern.length()).forEach(renderParam);
	}

});

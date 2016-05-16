Box.Application.addModule('patterns', function (context) {

	'use strict';

	var $,
		$elem,
		$patterns,
		song;

	return {
		messages:['layout-part-A', 'instrumentchange'],
		onmessage:function(name, data) {
			if(name == 'layout-part-A') {
				$elem.css(data);
			}
			if(name == 'instrumentchange') {
				render();
			}
		},
		init:init,
		destroy:destroy,
		onclick:onclick,
		onmousedown:onmousedown
	};

	function init() {
		$ = context.getGlobal('jQuery');
		$elem = $(context.getElement());
		$patterns = $elem.find('.patterns');
		song = context.getService('song');

		$patterns.multisortable({
			axis:'y',
			selectedClass: "selected",
			stop: function(e, ui) {
				var order = [];
				$patterns.find('[data-type="pattern"]').each(function() {
					order.push(parseInt($(this).data('id')));
				});
				song.pattern.newOrder(order);
				render();
			}
		});

		render();

	}

	function destroy() {

	}

	function onmousedown(event, elem, elemType) {
		switch(elemType) {
			case 'pattern':
				song.pattern.setCurrIndex(parseInt($(elem).data('id')));
				context.broadcast('patternchange');
				break;
		}
	}

	function onclick(event, elem, elemType) {
		switch(elemType) {
			case 'pattern':
				song.pattern.setCurrIndex(parseInt($(elem).data('id')));
				context.broadcast('patternchange');
				render();
				break;
		}
	}

	function render() {
		$patterns.html('');
		song.pattern.list().forEach(function(pattern, index) {
			var $pattern = $('<li data-type="pattern" class="noselect" data-id="' + index + '"><div class="pattern-inner">' + pattern.name + '<button data-type="remove-btn"><i class="fa fa-eraser"></i></button><button data-type="copy-btn"><i class="fa fa-files-o" aria-hidden="true"></i></button></div></li>');
			if(index == song.pattern.getCurrIndex()) {
				$pattern.addClass('selected');
			}
			$patterns.append($pattern);
		});
	}

});

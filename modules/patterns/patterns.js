Box.Application.addModule('patterns', function (context) {

	'use strict';

	var $,
		$elem,
		$patterns,
		song;

	return {
		messages:['instrumentchange'],
		onmessage:onmessage,
		init:init,
		destroy:destroy,
		onclick:onclick
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

	function onclick(event, elem, elemType) {
		var $this = $(elem);
		switch(elemType) {
			case 'pattern':
				song.pattern.setCurrIndex(parseInt($(elem).data('id')));
				context.broadcast('patternchange');
				render();
				break;
			case 'remove-btn':
				var index = parseInt($this.closest('[data-type="pattern"]').data('id'));
				song.pattern.remove(index);
				context.broadcast('patternchange');
				render();
				break;
			case 'copy-btn':
				var index = parseInt($this.closest('[data-type="pattern"]').data('id'));
				song.pattern.duplicate(index);
				context.broadcast('patternchange');
				render();
				break;
		}
	}

	function render() {
		$patterns.html('');
		song.pattern.list().forEach(function(pattern, index) {
			var $pattern = $('<li data-type="pattern" class="noselect" data-id="' + index + '"><div class="pattern-inner">' + pattern.name + '<button data-type="remove-btn"><i class="fa fa-remove"></i></button><button data-type="copy-btn"><i class="fa fa-files-o" aria-hidden="true"></i></button></div></li>');
			if(index == song.pattern.getCurrIndex()) {
				$pattern.addClass('selected');
			}
			$patterns.append($pattern);
		});
	}

	function onmessage(name, data) {
		if(name == 'instrumentchange') {
			render();
		}
	}

});

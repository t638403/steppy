Box.Application.addModule('patterns', function (context) {

	'use strict';

	var $,
		$elem,
		$patterns,
		$tplPattern,

		playingPatternIndex,
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
		$tplPattern = $($elem.find('template#patterns-li').html());

		playingPatternIndex = null;
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
			case 'play-btn':
				var $pattern = $this.closest('[data-type="pattern"]');
				var patternId = parseInt($pattern.data('id'));
				song.pattern.setCurrIndex(patternId);
				context.broadcast('patternchange');
				if(playingPatternIndex == patternId) {
					song.pattern.stop();
					playingPatternIndex = null;
				} else {
					song.pattern.play();
					playingPatternIndex = patternId;
				}
				render();
				break;
		}
	}

	function render() {
		$patterns.html('');
		song.pattern.list().forEach(function(pattern, index) {
			var $pattern = $tplPattern.clone();
			$pattern.data('id', index);
			$pattern.find('[data-type="pattern-name"]').html(pattern.name);
			if(index == playingPatternIndex) {
				$pattern.addClass('playing');
				$pattern.find('.fa-play').addClass('fa-stop');
			}
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

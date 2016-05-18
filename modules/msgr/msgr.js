Box.Application.addModule('msgr', function(context) {

	var $,
		$elem,
		duration;

	return {
		messages:['ok', 'error', 'warning', 'info', 'layout-part-G'],
		init:init,
		destroy:destroy,
		onmessage:onmessage
	}

	function init() {
		$ = context.getGlobal('jQuery');
		$elem = $(context.getElement());

		duration = 2000;
		context.broadcast('ok', 'Welcome to Steppy! Have lots of fun :-)');
	}

	function destroy() {
		delete $;
		delete $elem;
	}

	function hideMsg() {
		$elem.addClass('info');
		$elem.text('');
	}

	function onmessage(type, data) {
		switch(type) {
			case 'ok':
				$elem.removeClass();
				$elem.addClass('ok');
				$elem.text(data);
				setTimeout(hideMsg, duration);
				break;
			case 'error':
				$elem.removeClass();
				$elem.addClass('error');
				$elem.text(data);
				setTimeout(hideMsg, duration);
				break;
			case 'warning':
				$elem.removeClass();
				$elem.addClass('warning');
				$elem.text(data);
				setTimeout(hideMsg, duration);
				break;
			case 'info':
				$elem.removeClass();
				$elem.addClass('info');
				$elem.text(data);
				setTimeout(hideMsg, duration);
				break;
			case 'layout-part-G':
				$elem.css(data).css(data);
				break;
		}
	}
});
Box.Application.addModule('msgr', function(context) {

	var $,
		$elem,
		$msg,
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
		$msg = $elem.find('.msg');

		duration = 2000;
		context.broadcast('ok', 'Welcome to Steppy! Have lots of fun :-)');
	}

	function destroy() {
		delete $;
		delete $elem;
	}

	function hideMsg() {
		$elem.addClass('info');
		$msg.html('');
	}

	function onmessage(type, data) {
		switch(type) {
			case 'ok':
				$elem.removeClass();
				$elem.addClass('ok');
				$msg.html(data);
				setTimeout(hideMsg, duration);
				break;
			case 'error':
				$elem.removeClass();
				$elem.addClass('error');
				$msg.html(data);
				setTimeout(hideMsg, duration);
				break;
			case 'warning':
				$elem.removeClass();
				$elem.addClass('warning');
				$msg.html(data);
				setTimeout(hideMsg, duration);
				break;
			case 'info':
				$elem.removeClass();
				$elem.addClass('info');
				$msg.html(data);
				setTimeout(hideMsg, duration);
				break;
			case 'layout-part-G':
				$elem.css(data).css(data);
				break;
		}
	}
});
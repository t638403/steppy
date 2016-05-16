Box.Application.addModule('layout', function(context) {

    'use strict';

    var $,
		cfg,
		_throttle = context.getGlobal('_').throttle,
		$elem;

    return {
        init:init,
        destroy:destroy
    };

    function init() {

        $ = context.getGlobal('jQuery');
        cfg = context.getConfig();
		$elem = $(context.getElement());

		broadcast();
		$(window).on('resize', _throttle(broadcast, 30));

    }

	function destroy() {
		$ = null;
		cfg = null;
		$elem = null;

		$(window).off('resize', broadcast);
	}

	function broadcast() {
		context.broadcast('layout-part-A', A());
		context.broadcast('layout-part-B', B());
		context.broadcast('layout-part-C', C());
		context.broadcast('layout-part-D', D());
		context.broadcast('layout-part-F', F());
	}

	function A() {
		return {
			left:0,
			top:0,
			width: 200,
			height: ($(window).height() - 200)
		}
	}

	function B() {
		return {
			left:200,
			top:0,
			width: 50,
			height: ($(window).height() - 200)
		}
	}

	function C() {
		return {
			left:250,
			top:0,
			width: ($(window).width() - 250),
			height: ($(window).height() - 200)
		}
	}

	function D() {
		return {
			left:0,
			top:($(window).height() - 200),
			width: 200,
			height: 200
		}
	}

	function F() {
		return {
			left:250,
			top:($(window).height() - 200),
			width: ($(window).width() - 250),
			height: 200
		}
	}
});

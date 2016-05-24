Box.Application.addModule('layout', function(context) {

    'use strict';

    var $,
		cfg,
		_throttle = context.getGlobal('_').throttle,
		$elem,
		cols,
		rows;

    return {
        init:init,
        destroy:destroy
    };

    function init() {

        $ = context.getGlobal('jQuery');
        cfg = context.getConfig();
		$elem = $(context.getElement());

		cols = [200, 50, '*', 400];
		rows = ['*', 200, 20];

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
		context.broadcast('layout-part-E', E());
		context.broadcast('layout-part-F', F());
		context.broadcast('layout-part-G', G());
		context.broadcast('layout-part-H', H());
	}

	function A() {
		return {
			left:0,
			top:0,
			width: cols[0],
			height: ($(window).height() - (rows[1]  + rows[2]))
		}
	}

	function B() {
		return {
			left:cols[0],
			top:0,
			width: cols[1],
			height: ($(window).height() - (rows[1]  + rows[2]))
		}
	}

	function C() {
		return {
			left:(cols[0] + cols[1]),
			top:0,
			width: ($(window).width() - (cols[0] + cols[1] + cols[3])),
			height: ($(window).height() - (rows[1] + rows[2]))
		}
	}

	function D() {
		return {
			left:0,
			top:($(window).height() - (rows[1] + rows[2])),
			width: cols[0],
			height: rows[1]
		}
	}

	function E() {
		return {
			left:cols[0],
			top:($(window).height() - (rows[1] + rows[2])),
			width: cols[1],
			height: rows[1]
		}
	}

	function F() {
		return {
			left:(cols[0] + cols[1]),
			top:($(window).height() - (rows[1] + rows[2])),
			width: ($(window).width() - (cols[0] + cols[1] + cols[3])),
			height: rows[1]
		}
	}

	function G() {
		return {
			left:0,
			top:($(window).height() - rows[2]),
			width: $(window).width(),
			height: rows[2]
		}
	}

	function H() {
		return {
			left:($(window).width() - cols[3]),
			top:0,
			width: cols[3],
			height: ($(window).width() - rows[2])
		}
	}
});

Box.Application.addModule('grid', function(context) {

    'use strict';

    var $,
        _ = context.getGlobal('_'),
		$elem,
        $grid,
        $body,
        $selection,
        $resizingNote,
        cfg,
		song,
        isDownAlt,
        isDownCtrl,
        isMoving,
        isMovingWithPrecision,
		mappedKeys,
        showSelection,
        resizingRight,
        mouseDownOnNote,
        mouseDownOnGrid,
        originalNotePositions,
        mouseDownCoord,
        mouseMoveCoord,
		offsetX,
		offsetY;

    return {
		messages:['patternchange', 'instrumentchange'],
        init:init,
        destroy:destroy,
        onmousedown:onmousedown,
        onmouseup:onmouseup,
        onmousemove:_.throttle(onmousemove, 30),
        onclick:onclick,
		onmessage:function onmessage(name, data) {
			if(name == 'patternchange') {
				render();
			}
			if(name == 'instrumentchange') {
				var type = song.instrument.type.curr();
				mappedKeys = _.has(type, 'keys')?type.keys: null;
				render();
			}
		}
    };

    function init() {
        $ = context.getGlobal('jQuery');
        cfg = context.getConfig();
		song = context.getService('song');

		if(cfg.y < 6) {throw new Error('minium note height is 6px;');}

		$elem = $(context.getElement());
        $grid = $elem.find('[data-type="grid"]');
        $body = $('body');
        $selection = $('<div class="selection" ondragstart="return false;"/>');

        $grid.append($selection);
        $selection.hide();

        isDownAlt = false;
        isDownCtrl = false;
        isMovingWithPrecision = false;
        isMoving = false;
        mouseDownOnNote = false;
        mouseDownOnGrid = false;
        showSelection = false;

		var type = song.instrument.type.curr();
		mappedKeys = _.has(type, 'keys')?type.keys: null;

		offsetX = parseInt($elem.css('left'));
		offsetY = parseInt($elem.css('top'));

		$elem.on('scroll', broadcastScroll);
        $body.on('keydown', onkeydown);
        $body.on('keyup', onkeyup);

        render();
    }

    function destroy() {
		$ = null;
		_ = null;
		$elem = null;
		$grid = null;
		$body = null;
		$selection = null;
		$resizingNote = null;
		cfg = null;
		song = null;
		isDownAlt = null;
		isDownCtrl = null;
		isMoving = null;
		isMovingWithPrecision = null;
		showSelection = null;
		resizingRight = null;
		mouseDownOnNote = null;
		mouseDownOnGrid = null;
		originalNotePositions = null;
		mouseDownCoord = null;
		mouseMoveCoord = null;
		offsetX = null;
		offsetY = null;

		$elem.off('scroll', broadcastScroll);
        $body.off('keydown', onkeydown);
        $body.off('keyup', onkeyup);
    }

	function broadcastScroll() {
		context.broadcast('gridscroll', {
			top:$elem.scrollTop(),
			left:$elem.scrollLeft()
		});
	}

    function onmousedown(event, element, elementType) {
        var $this = $(element);
		mouseDownCoord = relativeXY(event.x, event.y);
        switch(elementType) {
            case 'grid':
                mouseDownOnNote = false;
                mouseDownOnGrid = !mouseDownOnNote;
                break;
            case 'note':
        
                if($(event.toElement).hasClass('right-resize-handle')) {
                    $resizingNote = $(element);
                    resizingRight = true;
                    return
                }
				var noteId = parseInt($this.data('id'));
				if(song.pattern.isSelectedNote(noteId)) {
					mouseDownOnNote = true;
					mouseDownOnGrid = !mouseDownOnNote;
					originalNotePositions = song.pattern.getNotes().map(function(n) {
						return {x:n.x,y:n.y};
					});
				} else {
					// select this note and move it around
					// for some reason this does not work :-(
				}

                break;
        }
    }

    function onmouseup(event, elem, elemType) {

        if(resizingRight) {
            resizingRight = false;
            showSelection = false;
            mouseDownCoord = null;
            isMoving = false;
            return;
        }
        
        switch(elemType) {
            case 'grid':
                if(isMoving) return;
                var mouseUpCoord = relativeXY(event.x, event.y);
                if(closeTo(mouseDownCoord, mouseUpCoord)) {
					song.pattern.deselectAll();
                    song.pattern.createNote(toIndex(mouseDownCoord.x, 'x', 'floor'), toIndex(mouseDownCoord.y, 'y', 'floor'));
                } else {
                    // If the mouse down coord and the mouse up coord are far from each other, a selection was made.

                    if(!isDownCtrl) {
						song.pattern.deselectAll();
                    }
                        
                    var left2 = parseInt($selection.css('left'));
                    var top2 = parseInt($selection.css('top'));
                    var width2 = $selection.width();
                    var height2 = $selection.height();

                    $grid.find('[data-type="note"]').each(function() {
                        var $this = $(this);

                        var id = parseInt($this.data('id'));
                        var left1 = parseInt($this.css('left'));
                        var top1 = parseInt($this.css('top'));
                        var width1 = $this.width();
                        var height1 = $this.height();

                        if(isInSquare(left1, top1, width1, height1, left2, top2, width2, height2)) {
							song.pattern.toggleNoteSelection(id);
                        }
                    });
                    showSelection = false;
                }
                render();
                break;
            case 'note':
                break;
        }
        
        mouseDownOnNote = false;
        mouseDownOnGrid = false;
        mouseDownCoord = null;
    }

    function onmousemove(event, elem, elemType) {

		var $this = $(elem);
        mouseMoveCoord = relativeXY(event.x, event.y);

        if(resizingRight) {
            var noteId = parseInt($resizingNote.data('id'));
			song.pattern.selectNote(noteId);
            var newLen = toIndex(mouseMoveCoord.x - parseInt($resizingNote.css('left')), 'x', isDownAlt?'none':'ceil');
			song.pattern.setNoteLengths((newLen <= 0)?1:newLen);
            render();
            return;
        }


        if(mouseDownOnGrid && !closeTo(mouseDownCoord, mouseMoveCoord)) {
            showSelection = true;
            render();
            return;
        }

        if(mouseDownOnNote) {

            var deltaX = toIndex(mouseMoveCoord.x - mouseDownCoord.x, 'x', 'none');
            var deltaY = toIndex(mouseMoveCoord.y - mouseDownCoord.y, 'y', 'none');

			// @todo: come up with better solution
			var newNotes = song.pattern.getNotes().map(function(n, id) {
				if(n.selected) {
					n.x = Math.floor(originalNotePositions[id].x + deltaX);
					if(isDownAlt) {
						n.x = originalNotePositions[id].x + deltaX;
					}
					n.y = Math.floor(originalNotePositions[id].y + deltaY);
				}
				return n;
			});
			song.pattern.setNotes(newNotes);
            render();
        }

    }

    function onclick(event, elem, elemType) {
		var $this = $(elem);
        switch(elemType) {
            case 'grid':
                break;
            case 'note':
                 var id = parseInt($this.data('id'));
                 if(!isDownCtrl) {
                    song.pattern.deselectAll();
                }
                if(song.pattern.isSelectedNote(id)) {
					song.pattern.deselectNote(id);
                } else {
					song.pattern.selectNote(id);
                }        
                render();
                break;
        }
    }

    function onkeydown(event) {
        isDownAlt = event.altKey;
        isDownCtrl = event.ctrlKey;
        isMovingWithPrecision = (isMoving && isDownAlt);
        
        if(event.keyCode == 46 /* del key */) {

			song.pattern.deleteNotes();

            render();
        }
    }

    function onkeyup(event) {
        isDownAlt = event.altKey;
        isDownCtrl = event.ctrlKey;
        isMovingWithPrecision = (isMoving && isDownAlt);        
    }

    // Convert data into DOM elements
    function render() {
        if(showSelection) {

			// Makes it easyer to draw the selection rectangle
            var leftMin = Math.min(mouseDownCoord.x, mouseMoveCoord.x);
            var leftMax = Math.max(mouseDownCoord.x, mouseMoveCoord.x);
            var topMin = Math.min(mouseDownCoord.y, mouseMoveCoord.y);
            var topMax = Math.max(mouseDownCoord.y, mouseMoveCoord.y);

			// Draw the selection element
            $selection.css('left', leftMin + 'px');
            $selection.css('top', topMin + 'px');
            $selection.css('width', (leftMax - leftMin) + 'px');
            $selection.css('height', (topMax - topMin) + 'px');
            $selection.show();

        } else {
            $selection.hide();
        }

		// Resize grid to pattern dims
		$grid.css({
			'width':(cfg.x * song.pattern.length()) + 'px',
			'height':(cfg.y * 87) + 'px',
			'background-size':'50px ' + (12 * cfg.y) + 'px',
			'background-position':'0 ' + cfg.y + 'px'
		});

		if(mappedKeys) {
			$grid.addClass('mapped-keys');
			$grid.css('height', Object.keys(mappedKeys).length * cfg.y);
			$grid.css('background-size', '50px ' + (cfg.y) + 'px');
		} else {
			$grid.removeClass('mapped-keys')
		}

		// Remove all notes and draw them again
        $grid.find('[data-type="note"]').remove();

        song.pattern.getNotes().forEach(renderNote);

    }

    // add note to DOM
    function renderNote(n, id) {
        var $note = $('<div data-type="note" data-id="'+id+'" ondragstart="return false;" />');
        var $noteInner = $('<div class="note-inner" ondragstart="return false;"/>');
        var $rightResizeHandle = $('<div class="right-resize-handle" ondragstart="return false;"/>');
        $note.append($noteInner);
        $noteInner.append($rightResizeHandle);

        $note.width(n.l * cfg.x);
		$noteInner.height(cfg.y);
		$rightResizeHandle.height(cfg.y - 4);
		$note.height(cfg.y);

        if(n.selected) {
            $note.addClass('selected');
        } else {
            $note.removeClass('selected');
        }
        $grid.append($note);
        
        $note.css('left', (n.x * cfg.x) + 'px');
        $note.css('top', (n.y * cfg.y) + 'px');
    }

    // normalize distance v with respect to grid config. use method none to prevent snapping, use floor/ceil to snap
    function toIndex(v, dim, method) {
        if(_.includes(['round','floor','ceil'], method)) {
            return Math[method](v / cfg[dim]);
        }
        return v / cfg[dim];
    }

    // check if twoo coords are close (r) to each other
    function closeTo(c1, c2) {
        var r = 2;
        var inXRange = ((c1.x >= c2.x && c1.x < (c2.x + r)) || (c1.x <= c2.x && c1.x > (c2.x - r)));
        var inYRange = ((c1.y >= c2.y && c1.y < (c2.y + r)) || (c1.y <= c2.y && c1.y > (c2.y - r)));
        return inXRange && inYRange;
    }

    // first 4 params are inner square, last 4 params are outer square
    function isInSquare(left1, top1, width1, height1, left2, top2, width2, height2) {
        var lx1 = left1;
        var rx1 = left1 + width1;
        var ty1 = top1;
        var by1 = top1 + height1;

        var lx2 = left2;
        var rx2 = left2 + width2;
        var ty2 = top2;
        var by2 = top2 + height2;

        return (
            lx1 >= lx2 && rx1 <= rx2
            &&
            ty1 >= ty2 && by1 <= by2
        );
    }

	/**
	 * Calculate relative mouse x/y based on css top and left property of grid
	 *
	 * @param x {int} Absolute X
	 * @param y {int} Absolute Y
	 * @returns {{x: number, y: number}} The relative X and Y
	 */
	function relativeXY(x, y) {

		var scrollTop = $(context.getElement()).scrollTop();
		var scrollLeft = $(context.getElement()).scrollLeft();

		return {
			x:(x - offsetX) + scrollLeft,
			y:(y - offsetY) + scrollTop
		};
	}

});

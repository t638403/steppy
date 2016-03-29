var ejs = require('ejs'),
	_ = require('lodash');

module.exports = PatternList;

function PatternList(context) {

	'use strict';

	var moduleEl,
		srv,
		tpls,
		selected;

	return {
		init:init,
		destroy:destroy,
		onclick:onclick
	}

	function init() {

		tpls = {
			pattern:ejs.compile('<li data-type="pattern" class="noselect" data-id="<%= id %>"><div class="pattern-inner"><%= id %></div></li>')
		};

		moduleEl = context.getElement();
		srv = {
			pattern:context.getService('pattern')
		};
		srv.pattern.createAtIndex(0);

		selected = [0];

		render();

		$(moduleEl).find('.patterns').multisortable({
			axis:'y',
			selectedClass: "selected",
			stop: function(e, ui) {
				selected = getSelectedIndexes();
				var newOrder = getOrder();
				srv.pattern.set(newOrder);
				render();
			}
		});
	}

	function destroy() {
		moduleEl = null;
		srv = null;
		tpls = null;
	}

	function onclick(event, elem, type) {
		switch(type) {
			case 'remove-btn':
				var indexes = getSelectedIndexes();
				indexes.forEach(function(listIndex, selectionIndex) {
					srv.pattern.removeAtIndex( (listIndex-selectionIndex) );
				});
				var selectedIndex = indexes.slice(0,1)[0] - 1;
				selectedIndex = selectedIndex>=0?selectedIndex:0;
				selected = [selectedIndex];
				render();
				break;
			case 'copy-btn':
				var indexes = getSelectedIndexes();
				var lastIndex = Math.max.apply(null, indexes);
				var inserAt = lastIndex + 1;
				var newIndexes = [];
				indexes.forEach(function(index, selectionIndex) {
					var newIndex = inserAt+selectionIndex;
					newIndexes.push(newIndex);
					srv.pattern.copyFromTo(index, newIndex);
				});
				selected = newIndexes;
				render();
				break;
			case 'new-btn':
				var indexes = getSelectedIndexes();
				var lastIndex = Math.max.apply(null, indexes);
				var inserAt = lastIndex + 1;

				var newIndexes = [];
				indexes.forEach(function(index, selectionIndex) {
					var newIndex = inserAt+selectionIndex;
					newIndexes.push(newIndex);
					srv.pattern.createAtIndex(newIndex);
				});

				selected = newIndexes;
				render();
				break;
		}
	}

	function render() {
		var patterns = srv.pattern.list().map(function(patternId, index) {
			var pattern = srv.pattern.get(patternId);
			pattern.index = index;
			return tpls.pattern(pattern);
		});
		$(moduleEl).find('.patterns').html(patterns.join(''));
		grabSelectedElems().forEach(function(elem) {
			$(elem).addClass('selected');
		})
	}

	function getSelectedIndexes() {
		return $(moduleEl)
			.find('[data-type="pattern"].selected')
			.toArray()
			.map(function(selectedElement) {
				return $(selectedElement).index();
			});
	}

	function grabSelectedElems() {
		return selected.map(function(index) {
			return $(moduleEl).find('[data-type="pattern"]:nth-child('+(index+1)+')');
		})
	}

	function getOrder() {
		return $(moduleEl)
			.find('[data-type="pattern"]')
			.toArray()
			.map(function(selectedElement) {
				return $(selectedElement).data('id');
			});
	}

}
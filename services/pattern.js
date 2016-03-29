var ObjectId = require('bson-objectid');

module.exports = Pattern;

function Pattern(application) {

	'use strict';

	var patterns = {};
	var order = [];

	return {
		get:get,
		set:set,
		createAtIndex:createAtIndex,
		removeAtIndex:removeAtIndex,
		list:list,
		moveFromTo:moveFromTo,
		copyFromTo:copyFromTo
	}

	function get(patternId) {
		if(typeof patterns[patternId] == 'undefined') throw new Error('Unknown pattern id');
		return patterns[patternId];
	}
	function set(newOrder) {
		if(!newOrder.forEach) throw new Error('newOrder should be array');
		var allValidIds = newOrder.every(function(id) {return typeof patterns[id] == 'object'});
		if(!allValidIds) throw new Error('Cannot set new order, invalid ids');
		order = newOrder;
	}
	function list() {
		return order;
	}
	function createAtIndex(index) {

		if(typeof index !== 'number') throw new Error('Index must be an integer');
		if(index < 0 || index > order.length) throw new Error('Index out of bounds');

		var id = ObjectId().toString();
		order.splice(index, 0, id);
		patterns[id] = {id:id};
		return id;
	}
	function removeAtIndex(index) {

		if(typeof index !== 'number') throw new Error('Index must be an integer');
		if(index < 0 || index > order.length) throw new Error('Index out of bounds');

		var removed = order.splice(index, 1).pop();
		if(order.length==0) {
			createAtIndex(0);
		}
		return removed;
	}
	function moveFromTo(indexA, indexB) {

		if(typeof indexA !== 'number') throw new Error('IndexA must be an integer');
		if(indexA < 0 || indexA > order.length) throw new Error('IndexA out of bounds');
		if(typeof indexB !== 'number') throw new Error('IndexB must be an integer');
		if(indexB < 0 || indexB > order.length) throw new Error('IndexB out of bounds');

		var removed = removeAtIndex(indexA);
		order.splice(indexB, 0, removed);
	}

	function copyFromTo(indexA, indexB) {

		if(typeof indexA !== 'number') throw new Error('IndexA must be an integer');
		if(indexA < 0 || indexA > order.length) throw new Error('IndexA out of bounds');
		if(typeof indexB !== 'number') throw new Error('IndexB must be an integer');
		if(indexB < 0 || indexB > order.length) throw new Error('IndexB out of bounds');


		order.splice(indexB, 0, order[indexA]);
	}

}
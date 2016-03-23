module.exports = Pattern;

function Pattern(application) {

	'use strict';

	var patterns = [{name:'p001'}];

	return {
		get:get,
		getList:getList,
		insert:insert,
		append:append,
		create:create
	}

	function getList() {
		return patterns.map(function(p){return p.name;});
	}
	function get(index) {
		return patterns[index];
	}
	function insert(index, pattern) {
		patterns.splice(index, 1, pattern);
	}
	function append(pattern) {
		patterns.push(pattern);
	}
	function create(name) {
		name = name || 'p'+patterns.length;
		return {name:name};
	}
}
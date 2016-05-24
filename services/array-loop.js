Box.Application.addService('array-loop', function(application) {

	var _ = application.getGlobal('_');

	return {
		create:function(values) {
			return arrayLoop(values);
		}
	}

	function arrayLoop(values) {
		var valuesCloned = _.cloneDeep(values);
		return Object.freeze({
			next:next
		});

		function next() {
			var v = values.shift();
			var rv;
			if (typeof v == 'function') {
				rv = v();
			} else {
				rv = v;
			}
			values.push(v);
			return rv;
		}
	}


});
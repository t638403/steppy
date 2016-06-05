Box.Application.addService('array-loop', function(application) {

	var _ = application.getGlobal('_');

	return {
		create:function(values) {
			return arrayLoop(values);
		}
	}

	function arrayLoop(values) {

		var index = 0;

		return Object.freeze({
			next:next
		});

		function next() {
			if(index >= values.length) {
				index = 0;
			}
			return values[index++];
		}
	}


});
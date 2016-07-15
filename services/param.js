Box.Application.addService('param', function(application) {

	var _ = application.getGlobal('_');

	return {
		create:Param,
		createCollection:ParamCollection
	}

	function Param(name) {

		var instance = this;

		return {
		};

		function toJSON() {
			throw new Error('Not yet implemented');
		}
	}

	function ParamCollection() {

		var collection = [];

		return {
			toJSON:toJSON
		};

		function toJSON() {
			return collection.map(function(p){return p.toJSON();});
		}
	}

});
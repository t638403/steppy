Box.Application.addService('note', function(application) {

	var _ = application.getGlobal('_');

	return {
		create:Note,
		createCollection:NoteCollection
	}

	function Note(name) {

		var instance = this;

		return {
		};

		function toJSON() {
			throw new Error('Not yet implemented');
		}
	}

	function NoteCollection() {

		var collection = [];

		return {
			toJSON:toJSON
		};

		function toJSON() {
			return collection.map(function(p){return p.toJSON();});
		}
	}

});
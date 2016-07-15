Box.Application.addService('pattern', function(application) {

	var _ = application.getGlobal('_');
	var sNote = application.getService('note');
	var sParam = application.getService('param');

	return {
		create:Pattern,
		createCollection:PatternCollection
	}

	function Pattern(name) {

		var instance = this;
		var noteCollection = sNote.createCollection();
		var paramCollection = sParam.createCollection();

		return {
			getName:getName,
			setName:setName,
			insertNote:insertNote,
			duplicate:duplicate,
			toJSON:toJSON
		};

		function getName() {return name;}
		function setName(n) {name = n; return instance;}
		function insertNote(x, noteNr, velocity, duration) {
			var note = sNote.create(noteNr, velocity, duration);
			noteCollection.insertAt(x, note);
			return instance;
		}
		function deleteNote(x, noteNr) {
			noteCollection.delete(x, noteNr);
			return instance;
		}
		function moveNote() {

		}

		function toJSON() {
			throw new Error('Not yet implemented');
		}
	}

	function PatternCollection() {

		var collection = [];

		return {
			append:append,
			swap:swap,
			toJSON:toJSON
		};

		function append(p) {
			collection.push(p);
		}

		function swap(index1, index2) {
			if(!(_.isNumber(index1) && index1 >=0 && index1 < collection.length)) {
				throw new Error('Invalid index 1 for swap');
			}
			if(!(_.isNumber(index2) && index2 >=0 && index2 < collection.length)) {
				throw new Error('Invalid index 2 for swap');
			}
			var temp = collection[index1];
			collection[index1] = collection[index2];
			collection[index2] = temp;
		}

		function toJSON() {
			return collection.map(function(p){return p.toJSON();});
		}
	}

});
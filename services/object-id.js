module.exports = function(application) {
	var bsonObjectId = require('bson-objectid');
	return {
		objectId:function() {
			return bsonObjectId().toString();
		}
	}
}
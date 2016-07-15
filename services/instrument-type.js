Box.Application.addService('instrument-type', function(application) {

	var _ = application.getGlobal('_');
	var path = require('path');
	var fs = require('fs');

	return {
		getByName:getByName
	}

	function getByName(name) {
		return JSON.parse(fs.readFileSync(path.join(__dirname, 'instrument-type', name + '.json'), {encoding:'utf8'}));
	}

});
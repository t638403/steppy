Box.Application.addService('instrument', function(application) {

	var _ = application.getGlobal('_');
	var sInstrType = application.getService('instrument-type');
	var sPattern = application.getService('pattern');
	var ObjectId = require('bson-objectid');

	return {
		create:Instrument
	}

	function Instrument(name, type, device, channel) {

		var instance = this;

		return {
			getName:getName,
			getType:getType,
			getDevice:getDevice,
			getChannel:getChannel,
			setDevice:setDevice,
			setChannel:setChannel,
			toJSON:toJSON
		};

		function getName() {return name;}
		function getType() {return sInstrType.getByName(type);}
		function getDevice() {return device;}
		function getChannel() {return channel;}
		function setDevice(d) {device = d; return instance;}
		function setChannel(c) {channel = c; return instance;}

		function toJSON() {
			return {
				name:name,
				type:type,
				device:device,
				channel:channel
			}
		}
	}

});
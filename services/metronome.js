Box.Application.addService('metronome', function(application) {

	var util = application.getGlobal('util');
	var events = application.getGlobal('events');

	util.inherits(ExactInterval, events.EventEmitter);
	util.inherits(Metronome, events.EventEmitter);

	return {
		create:function(bpm) {
			return new Metronome(bpm);
		}
	};


	function Metronome(bpm) {
		events.EventEmitter.call(this);
		var _this = this;
		var notes = {
			//whole:new ExactInterval(beatInterval(bpm)),
			//half:new ExactInterval(beatInterval(bpm * 2)),
			//third:new ExactInterval(beatInterval(bpm * 3)),
			quarter:new ExactInterval(beatInterval(bpm * 4)),
			//eighth:new ExactInterval(beatInterval(bpm * 8)),
			//sixteenth:new ExactInterval(beatInterval(bpm * 16)),
			midiclock:new ExactInterval(beatInterval(bpm * 24))
		};

		Object.keys(notes).forEach(function(note) {
			notes[note].on('tick', function(nr) {_this.emit(note, nr)});
		});

		this.start = start;
		this.stop = stop;
		this.setBpm = setBpm;

		function start() {
			Object.keys(notes).forEach(function(note) {
				notes[note].start();
			});
		}
		function stop() {
			Object.keys(notes).forEach(function(note) {
				notes[note].stop();
			});
		}
		function setBpm(bpm) {
			//notes.whole.setInterval(beatInterval(bpm));
			//notes.half.setInterval(beatInterval(bpm * 2));
			//notes.third.setInterval(beatInterval(bpm * 3));
			notes.quarter.setInterval(beatInterval(bpm * 4));
			//notes.eighth.setInterval(beatInterval(bpm * 8));
			//notes.sixteenth.setInterval(beatInterval(bpm * 16));
			notes.midiclock.setInterval(beatInterval(bpm * 24));
		}

		function beatInterval(bpm) {return 60000 / bpm;}
	}


	function ExactInterval(interval, eventName) {
		events.EventEmitter.call(this);
		var _this = this;
		interval = interval || 1000;
		eventName = eventName || 'tick';
		var startTime;
		var tickNr = 0;
		var nextTick;
		var timeOut;
		var correctedInterval;

		this.start = start;
		this.stop = stop;
		this.setInterval = setInterval;

		function start() {
			startTime = Date.now();
			tick();
		}
		function stop() {
			tickNr = 0;
			clearTimeout(timeOut);
		}
		function setInterval(i) {
			interval = i;
		}
		function tick() {
			_this.emit(eventName, tickNr);
			nextTick = ( startTime + ( ++tickNr * interval ) );
			correctedInterval = nextTick - Date.now();
			timeOut = setTimeout(tick, correctedInterval);
		}
	}
});
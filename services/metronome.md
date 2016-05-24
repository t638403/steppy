# metronome
Emits `whole`, `half`, `third`, `quarter`, `eighth` and `sixteenth` events on a specified bpm. 

Usage:

    var Metronome = require('@erik/metronome');
    m = new Metronome(120);
    m.on('whole', function(nr) {console.log('whole, nr: ' + nr);});
    m.on('quarter', function(nr) {console.log('quarter, nr: ' + nr);});
    m.start();
    
Result:


    whole, nr: 0
    quarter, nr: 0
    quarter, nr: 1
    quarter, nr: 2
    quarter, nr: 3
    whole, nr: 1
    quarter, nr: 4
    quarter, nr: 5
    quarter, nr: 6
    quarter, nr: 7
    ...
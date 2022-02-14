// midiTransport.js
// PlaysNotes using easyMIDI
// sudo apt-get install libasound2-dev
// npm install easymidi
// https://www.npmjs.com/package/easymidi
const easymidi = require('easymidi');

class MidiTransport { //extends Transport {
    constructor() {
        console.log("constructing MidiTransport...");
        console.log('MIDI outputs:');
        var outputs = easymidi.getOutputs();
        console.log(outputs);
        this.output = new easymidi.Output(outputs[1]);

        /* NTS1: OSC: Square 
        this.output.send('cc', {
            controller: 53,
            value: 50,
            channel: 0
        }); */
    }
    // send a midi note value
    sendNoteOn(note) {
        //console.log('Transport playNote: ${note}');
        console.log("Transport playNote: ", note);
        this.output.send('noteon', {
            note: note,
            velocity: 64,
            channel: 0
        });
        // https://nodejs.org/en/docs/guides/timers-in-node/
        // setTimeout(this.sendNoteOff.bind(this), 500, note); //in 500ms or half a second
    }
    //send a note off!
    sendNoteOff(note) {
        console.log("Transport sendNoteOff: ", note);
        this.output.send('noteoff', {
            note: note,
            velocity: 64,
            channel: 0
        });
    }
    // close
    close() {
        console.log("MidiTransport closing...");
        //send all notes off
        this.output.send('cc', {
            controller: 123,	// Aux Message: All Notes Off
            value: 0,
            channel: 0
        });        
        this.output.close();
    }
}
module.exports.MidiTransport = MidiTransport;
// melody.js
// run as node melody.js

//import process from 'process';
const SerialPort = require('serialport');
const core = require('@magenta/music/node/core');
const pg = require('@magenta/music/node/piano_genie');
const transport = require('./midiTransport.js');

// 8 button input via serial from Arduino
const NUM_BUTTONS                     = 8;
const FIRST_BUTTON_PRESSED_MASK       = 0b00000001;
const SECOND_BUTTON_PRESSED_MASK      = 0b00000010
const THIRD_BUTTON_PRESSED_MASK       = 0b00000100
const FOURTH_BUTTON_PRESSED_MASK      = 0b00001000
const FIFTH_BUTTON_PRESSED_MASK       = 0b00010000
const SIXTH_BUTTON_PRESSED_MASK       = 0b00100000
const SEVENTH_BUTTON_PRESSED_MASK     = 0b01000000
const EIGHTH_BUTTON_PRESSED_MASK      = 0b10000000

const ARDUINO_CONTROLLER_BAUD         = 9600;

const buttonMap                       = new Map();  // current MIDI notes of buttons
const pressedMap                      = new Map();  // current state of button presses

// TensorFlow Magenta PianoGenie
const CONSTANTS = {
    //TODO: probably need my own checkpoint
    GENIE_CHECKPOINT : 'https://storage.googleapis.com/magentadata/js/checkpoints/piano_genie/model/epiano/stp_iq_auto_contour_dt_166006',  
}
const genie = new pg.PianoGenie(CONSTANTS.GENIE_CHECKPOINT);
console.log(".initializing piano genie");
genie
    .initialize()
    .then(() => {
        console.log('..piano genie ready!..');
        // Slow to start up, so do a fake prediction to warm up the model.
        const note = genie.next(0);
        genie.resetState();
    });

// Play Notes through USB MIDI
const player = new transport.MidiTransport();

/* Listen for button stream
SerialPort.list().then(function(devices) {
    console.log("Serial devices: ");
    console.log(devices)
})
*/
//Bottom Left USB port
const arduinoSerial = new SerialPort('/dev/ttyACM1', {
    baudRate: ARDUINO_CONTROLLER_BAUD
})
// Setup the arduino port to listen for button presses
let Readline = SerialPort.parsers.Readline
const parser = arduinoSerial.pipe(new Readline({ delimiter: '\n'}));
// Read the port data
arduinoSerial.on("open", () => {
    console.log('serial port open...');
});
parser.on('data', data =>{
    //console.log('got word from arduino:', data);
    let dataByte = parseInt(data.split('b')[1]);

    let firstButton = !(FIRST_BUTTON_PRESSED_MASK & dataByte);
    let secondButton = !(SECOND_BUTTON_PRESSED_MASK & dataByte);
    let thirdButton = !(THIRD_BUTTON_PRESSED_MASK & dataByte);
    let fourthButton = !(FOURTH_BUTTON_PRESSED_MASK & dataByte);
    let fifthButton = !(FIFTH_BUTTON_PRESSED_MASK & dataByte);
    let sixthButton = !(SIXTH_BUTTON_PRESSED_MASK & dataByte);
    let seventhButton = !(SEVENTH_BUTTON_PRESSED_MASK & dataByte);
    let eighthButton = !(EIGHTH_BUTTON_PRESSED_MASK & dataByte);
  
    handleButtonValue(0, firstButton);
    handleButtonValue(1, secondButton);
    handleButtonValue(2, thirdButton);
    handleButtonValue(3, fourthButton);
    handleButtonValue(4, fifthButton);
    handleButtonValue(5, sixthButton);
    handleButtonValue(6, seventhButton);
    handleButtonValue(7, eighthButton);
});

handleButtonValue = function(button, value) {
    if (pressedMap.has(button)) {
        if (pressedMap.get(button) != value) {
            if (!value) {
                playNote(button);
            } else {
                stopNote(button)
            }
        } // else button is being held
    } else { // not in pressedMap
        if (!value) {
            playNote(button);
        } else {
            stopNote(button)
        }
    }
    pressedMap.set(button, value);
}

playNote = function(button) {
    const note = genie.next(button);
    console.log(`note: ${note}`);
    player.sendNoteOn(note);
    // Add to current list of output notes
    buttonMap.set(button, note);
}

stopNote = function(button) {
    console.log("melody stopNote...");
    if (buttonMap.has(button)) {
        let note = buttonMap.get(button)
        player.sendNoteOff(note);
        buttonMap.delete(button);
    }
}

// https://nodejs.org/api/process.html#event-exit
// process.on('exit', function(code) {
process.on('exit', (code) => {
    // Turn off any stray notes
    for (let i = 0 ; i < NUM_BUTTONS; i++) {
        stopNote(i);
    }
    player.close();
    //return console.log(`About to exit with code ${code}`);
    console.log(`About to exit with code: ${code}`);
});
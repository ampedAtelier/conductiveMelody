# PiGenie
PianoGenie running as a node.js app on a Raspberry Pi.
* melody.js — **Conductive Melody v2** Node.js calling [Magenta](https://github.com/magenta) Music's [Piano Genie model](https://github.com/magenta/magenta/tree/master/magenta/models/piano_genie)
* midiTransport.js — extends the base **Transport** class sending playing notes using MIDI out
* oscTransport.js — **Transport** class built using [osc.js](https://www.npmjs.com/package/osc)
* package.json — Node project description
* transport.js —  base **Transport** class for playing notes

## Installation
Node.js & Magenta-js installation instructions. I installed everything from the home directory
1. Install Node.js  with
	```
	curl -sL https://deb.nodesource.com/setup_17.x | sudo -E bash -
	sudo apt install -y nodejs
	node -v
	npm -v
	```
2. Install ALSA (Advanced Linux Sound Architecture) shared library dependency for **easyMIDI** using:\
`sudo apt-get install libasound2-dev`
3. Install [easyMIDI](https://www.npmjs.com/package/easymidi) using:\
`npm install easymidi`
4. Install [JavaScript implementation of Magenta's musical note-based models](https://magenta.github.io/magenta-js/music/) using:\
`npm install --save @magenta/music`
5. Install [serialport](https://www.npmjs.com/package/serialport) using:\
`npm i serialport`

## Run
* `node melody.js`

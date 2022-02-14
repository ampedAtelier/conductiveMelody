let osc = require("osc");

class OscTransport extends Transport {
    constructor() {
        // Create an osc.js UDP Port listening on port 57121.
        this.udpPort = new osc.UDPPort({
            remoteAddress: "192.168.86.209",
            remotePort: 8888,
            metadata: true
        });
        // Listen for incoming OSC messages.
        this.udpPort.on("message", function (oscMsg, timeTag, info) {
            console.log("An OSC message just arrived!", oscMsg);
            console.log("Remote info is: ", info);
        });
        // Open the socket.
        this.udpPort.open();

        // When the port is ready, send an OSC message to, say, SuperCollider
        this.udpPort.on("ready", function () {
            console.log("the port is ready,sending an OSC message...");
            this.playNote(60);
        });
    }
    // send a midi note value
    playNote(note) {
        //console.log('Transport playNote: ${note}');
        console.log("Transport playNote: ", note);
        this.udpPort.send({
            address: "/note",
            args: [
                {
                    type: "i",
                    value: note
                }
            ]
        }); //, "192.168.86.209", 8888);
    }
}
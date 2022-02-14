// Transport Base Class
class Transport {
    constructor() {
        console.log("Base Transport constructed.");
    }
    playNote(note) {
        console.log('Transport playNote: ${note}');
    }
}
module.exports.Transport = Transport;
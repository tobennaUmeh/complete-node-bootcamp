const EventEmitter = require('events');
class Sales extends EventEmitter {
	constructor() {
		super();
	}
}

const eventEmitter = new Sales();

eventEmitter.on('my_event', () => {
	console.log('data received successfully.');
});

// crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
// 	console.log(Date.now() - start, 'Password encrypted');
// });

// eventEmitter.on('my_');

eventEmitter.on('my_event', () => {
	console.log('Sale in Jonas');
});

eventEmitter.on('letsgo', () => {
	console.log();
});

eventEmitter.emit('my_event');

//////////////////

const http = require('http');
const server = http.createServer();

server.on('request', (req, res) => {
	console.log('Request received');
	res.end('Damn');
});

server.on('request', (req, res) => {
	console.log('Another request');
});

server.on('close', () => {
	console.log('Server closed');
});

server.listen(8000, '127.0.0.1', () => {
	console.log('Waiting for requests...');
});

const fs = require('fs');
const crypto = require('crypto');

const start = Date.now();
process.env.UV_THREADPOOL_SIZE = 4;

setTimeout(() => {
	console.log('Timer 1 finished');
}, 0);

setImmediate(() => {
	console.log('immediate 1 fiished');
});

fs.readFile('./test-file.txt', () => {
	console.log('i/o finished');
	console.log('-------------');
	setTimeout(() => {
		console.log('Timer 2 finished');
	}, 0);

	setImmediate(() => {
		console.log('immediate 2 fiished');
	});

	setTimeout(() => {
		console.log('Timer 3 finished');
	}, 0);

	process.nextTick(() => {
		console.log('Process tick');
	});

	crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
		console.log(Date.now() - start, 'Password encrypted');
	});

	crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
		console.log(Date.now() - start, 'Password encrypted');
	});
	crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
		console.log(Date.now() - start, 'Password encrypted');
	});
	crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
		console.log(Date.now() - start, 'Password encrypted');
	});
});

setImmediate(() => {
	console.log('immediate 3 fiished');
});

process.nextTick(() => {
	console.log('Process tick 2');
});

console.log('Hello from top level');

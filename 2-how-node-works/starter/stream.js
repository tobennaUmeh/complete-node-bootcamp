const fs = require('fs');
const server = require('http').createServer();

server.on('request', (_req, res) => {
	// fs.readFile('./test-file.txt', (err, data) => {
	// 	if (err) console.log(err);
	// 	res.end(data);
	// });

	const readable = fs.createReadStream('./test-file.txt');
	readable.on('data', (chunck) => {
		res.write(chunck);
	});
	readable.on('end', () => {
		res.end();
	});
});

server.listen(8000, '127.0.0.1');

const fs = require('fs');
const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
const http = require('http');
const path = require('path');
// const { dirname } = require('path');
const url = require('url');
const replaceTemplate = require('./modules/replaceTemplate');
const slugify = require('slugify');

console.log(textIn);
// console.log('sdefvds');

// const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', textOut);
// // console.log('File written!');

// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
// 	fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
// 		console.log(data2);
// 		// console.log(data1);
// 		fs.readFile(`./txt/append.txt`, 'utf-8', (err, data3) => {
// 			console.log(data3, 3);
// 			fs.writeFile(
// 				'./txt/avocadoLesson.txt',
// 				`${data2} ${data3} \n Created on ${Date()}`,
// 				(err) => {
// 					console.log(err);
// 				},
// 			);
// 		});
// 	});
// 	//   console.log(data1);
// 	// console.log(err);
// });

// console.log(Date(1691341851029).toString());

// console.log('read file');

// function findErrorNums(nums) {
// 	const n = nums.length;
// 	const seen = new Set();
// 	let duplicate, missing;
// 	let sum = 0;

// 	for (const num of nums) {
// 		if (seen.has(num)) {
// 			duplicate = num;
// 		} else {
// 			seen.add(num);
// 			sum += num;
// 		}
// 	}

// 	missing = (n * (n + 1)) / 2 - (sum - duplicate);

// 	return [duplicate, missing];
// }

// const input = [1, 2, 3, 2];

// console.log(findErrorNums(input));

//Server
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const templateOverview = fs.readFileSync(
	`${__dirname}/templates/template_overview.html`,
	'utf-8',
);
const templateCard = fs.readFileSync(
	`${__dirname}/templates/template_card.html`,
	'utf-8',
);
const templateProduct = fs.readFileSync(
	`${__dirname}/templates/template_product.html`,
	'utf-8',
);

const dataArray = JSON.parse(data);
// const card = fs.readFileSync('')

// console.log(slugify('Fresh tomatoes', { lower: true, trim: true }));
const slugs = dataArray.map((el) => slugify(el.productName, { lower: true }));
console.log(slugs);

const server = http.createServer((req, res) => {
	const { query, pathname } = url.parse(req.url, true);
	// console.log(req.url);
	// console.log(url.parse(req.url), true);
	console.log(query);
	console.log(pathname);
	// const pathName = req.url;

	// Overview
	if (pathname === '/overview' || pathname === '/') {
		res.writeHead(200, { 'Content-type': 'text/html' });
		const cardsHtml = dataArray.map((el) => replaceTemplate(templateCard, el));
		const output = templateOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
		res.end(output);
		// Product
	} else if (pathname === '/product') {
		res.writeHead(200, { 'Content-type': 'text/html' });
		const product = dataArray[query.id];
		const output = replaceTemplate(templateProduct, product);
		res.end(output);
	}
	// API
	else if (pathname === '/api') {
		// fs.readFile(`${__dirname}/dev-data/data.json`, 'utf-8', (err, data) => {
		// 	const productData = JSON.parse(data);
		// 	res.writeHead(200, { 'Content-type': 'application/json' });
		// 	console.log(productData);
		// 	res.end(data);
		// });
		res.writeHead(200, { 'Content-type': 'application/json' });
		res.end(data);
	} else {
		res.writeHead(404, {
			'Content-type': 'text/html',
			'my-own-header': 'hello-world',
		});
		res.end('<h1>not found<h1>');
	}
});

server.listen(8000, '127.0.0.1', () => {
	console.log('Listening to requests on port 8000');
});

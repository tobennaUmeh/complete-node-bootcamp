const fs = require('fs');
const superagent = require('superagent');

const readFilePro = (file) => {
	return new Promise((res, rej) => {
		fs.readFile(file, 'utf-8', (err, data) => {
			if (err) rej('Could not find file');
			res(data);
		});
	});
};

const writeFilePro = (dir, file) => {
	return new Promise((res, rej) => {
		fs.writeFile(dir, file, (err) => {
			if (err) rej('Could not write file');
			res('success');
		});
	});
};

const getDogPic = async () => {
	try {
		const data = await readFilePro(`${__dirname}/dog.txt`);
		console.log(data);
		const res1 = superagent.get(
			`https://dog.ceo/api/breed/${data}/images/random`,
		);
		const res2 = superagent.get(
			`https://dog.ceo/api/breed/${data}/images/random`,
		);
		const res3 = superagent.get(
			`https://dog.ceo/api/breed/${data}/images/random`,
		);
		const all = await Promise.all([res1, res2, res3]);
		const imgs = all.map((el) => el.body.message);

		// console.log(res.body.message);
		await writeFilePro('dog-img.txt', imgs.join('\n'));
	} catch (err) {
		console.log(err);
		throw err;
	}
	return null;
};
// const getDogPic = async () => {
// 	try {
// 		const data = await readFilePro(`${__dirname}/dogg.txt`);
// 		console.log(data);
// 		const res = await superagent.get(
// 			`https://dog.ceo/api/breed/${data}/images/random`,
// 		);
// 		console.log(res.body.message);
// 		await writeFilePro('dog-img.txt', res.body.message);
// 	} catch (err) {
// 		console.log(err);
// 		throw err;
// 	}
// 	return null;
// };

(async () => {
	try {
		const data = await getDogPic();
		console.log(data);
	} catch (error) {
		console.log(error);
	}
})();

/*
getDogPic()
	.then((res) => {})
	.catch((err) => console.log(err));
*/

/*
readFilePro(`${__dirname}/dog.txt`)
	.then((data) => {
		return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
	})
	.then((res) => {
		console.log(res.body.message);
		return writeFilePro('dog-img.txt', res.body.message);
	})
	.catch((err) => {
		console.log(err);
	});
*/
// console.log(file);

// writeFilePro('dog-img.txt', file);

// fs.readFile(`${__dirname}/dog.txt`, 'utf-8', (err, data) => {
// 	// console.log(data);
// 	superagent
// 		.get(`https://dog.ceo/api/breed/${data}/images/random`)
// 		.end((err, res) => {
// 			console.log(res.body.message);
// 			fs.writeFile('dog-img.txt', res.body.message, (err) => console.log(err));
// 		});
// });

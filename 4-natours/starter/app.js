const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');

app.use(express.json());
// app.get('/', (req, res) => {
//   res.status(200);
//   res.json({ message: 'Hello From the server side!', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.status(200);
//   res.send('You can send to this endpoint');
// });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
);

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

app.post('/api/v1/tours', (req, res) => {
  // console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = { id: newId, ...req.body };
  // const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  const toursJSON = JSON.stringify(tours);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    toursJSON,
    (err) => {
      return console.log(err);
    }
  );
  res.send('New tour add successfully');
});

// app.delete('/api/v1/tours', (req, res) => {
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

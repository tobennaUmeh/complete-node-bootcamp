const fs = require('fs');
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
);

exports.checkID = (req, res, next, val) => {
  const id = req.params.id * 1;
  if (id * 1 > tours.length || !id) {
    return res.status(404).json({
      status: 'File not found',
      message: 'Invalid id',
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  const data = req.body;
  if (!data.price || !data.name) {
    return res.status(400).json({
      status: 'fail',
      message: 'missing name or price',
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestTime: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  // if (id > tours.length) {
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.createTours = (req, res) => {
  // console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = { id: newId, ...req.body };
  // const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  const toursJSON = JSON.stringify(tours);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    toursJSON,
    (err) => {
      res.status(201).json({
        status: 'success',
        results: tours.length,
        tours,
      });
    }
  );
  // res.send('New tour add successfully');
};

exports.updatedTour = (req, res) => {
  const tour = tours.find((el) => el.id === id);
  const updatedTour = { ...tour, ...req.body };
  console.log(tour);

  res.status(200).json({
    status: 'success',
    data: {
      updatedTour,
    },
  });
};

exports.deleteTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  if (id * 1 > tours.length) {
    res.status(404).json({
      status: 'File not found',
      message: 'Invalid id',
    });
  }
  const updatedTour = {};
  console.log(tour);

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

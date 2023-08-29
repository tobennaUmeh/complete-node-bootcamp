const express = require('express');
const app = express();
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const morgan = require('morgan');

// MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
// console.log(process.env);
// console.log(process.env);
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toUTCString();
  console.log('hello form Middleware');
  next();
});
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
// );

// ROUTE HANDLERS

// ROUTES
// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTours);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updatedTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//ROUTER

// ROUTES
// const tourRouter = express.Router();
// tourRouter.route('/').get(getAllTours).post(createTours);
// tourRouter.route('/:id').get(getTour).patch(updatedTour).delete(deleteTour);

// MOUNTING ROUTES

// app.delete('/api/v1/tours', (req, res) => {
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

// SERVER
// app.listen(port, () => console.log(`Example app listening on port ${port}!`));

module.exports = app;

// const fs = require('fs');
const Tour = require('../models/tourModels');
const { APIFeatures } = require('../utils/APIFeatures');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,-price';
  req.query.fields =
    'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const allTours = await features.query;

  // SEND RES
  res.status(200).json({
    status: 'success',
    results: allTours.length,
    data: {
      tours: allTours,
    },
  });
  // try {
  //   //BUILD QUERY
  //   // FILTERING;
  //   // let queryString = { ...req.query };

  //   // const excludedPages = [
  //   //   'page',
  //   //   'sort',
  //   //   'limit',
  //   //   'fields',
  //   // ];
  //   // const queryObj = removeKeysFromObject(
  //   //   excludedPages,
  //   //   query
  //   // );

  //   // // ADVANCED FILTERING
  //   // let queryStr = JSON.stringify(queryObj);
  //   // queryStr = queryStr.replace(
  //   //   /\b(gt|gte|lt|lte)\b/g,
  //   //   (match) => `$${match}`
  //   // );

  //   // const queryFind = Tour.find(JSON.parse(queryStr));
  //   // // console.log(queryStr);
  //   // // SORTING0
  //   // if (req.query.sort) {
  //   //   const sortBy = req.query.sort.split(',').join(' ');
  //   //   queryFind.sort(sortBy);
  //   // } else {
  //   //   queryFind.sort('-createdAt');
  //   // }

  //   // // FIELD LIMITING
  //   // if (req.query.fields) {
  //   //   const fields = req.query.fields.split(',').join(' ');
  //   //   queryFind.select(fields);
  //   // } else {
  //   //   queryFind.select('-__v');
  //   // }

  //   // // PAGINATION?
  //   // const page = req.query.page * 1 || 1;
  //   // const limit = req.query.limit * 1 || 5;
  //   // const skip = (page - 1) * limit;
  //   // queryFind.skip(skip).limit(limit);

  //   const features = new APIFeatures(Tour.find(), req.query)
  //     .filter()
  //     .sort()
  //     .limitFields()
  //     .paginate();

  //   // EXECUTE QUERY
  //   const allTours = await features.query;

  //   // SEND RES
  //   res.status(200).json({
  //     status: 'success',
  //     results: allTours.length,
  //     data: {
  //       tours: allTours,
  //     },
  //   });
  // } catch (error) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: error,
  //   });
  // }
});

exports.getTour = catchAsync(async (req, res) => {
  const id = req.params.id;
  const tour = await Tour.findOne({ _id: id });

  res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
  // try {
  //   const tour = await Tour.findOne({ _id: id });

  //   res.status(200).json({
  //     status: 'success',
  //     data: {
  //       tour: tour,
  //     },
  //   });
  // } catch (error) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: error,
  //   });
  // }
  // if (id > tours.length) {
});

// exports.createTours = (req, res) => {
//   // console.log(req.body);
//   const newId = tours[tours.length - 1].id + 1;
//   const newTour = { id: newId, ...req.body };
//   // const newTour = Object.assign({ id: newId }, req.body);
//   tours.push(newTour);
//   const toursJSON = JSON.stringify(tours);
//   fs.writeFile(
//     `${__dirname}/../dev-data/data/tours-simple.json`,
//     toursJSON,
//     (err) => {
//       res.status(201).json({
//         status: 'success',
//         results: tours.length,
//         tours,
//       });
//     }
//   );
//   // res.send('New tour add successfully');
// };

exports.createTours = catchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body);

  console.log('TOUR UPLOAD SUCCESSFULL');
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
  // const newTour = new Tour(req.body); MOdel.prototype.save()
  // newTour.save();
  // try {
  //   const newTour = await Tour.create(req.body);

  //   console.log('TOUR UPLOAD SUCCESSFULL');

  //   res.status(201).json({
  //     status: 'success',
  //     data: {
  //       tour: newTour,
  //     },
  //   });
  // } catch (error) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: error,
  //   });
  // }
});

exports.updatedTour = catchAsync(async (req, res) => {
  const id = req.params.id;
  const updatedTour = await Tour.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({
    status: 'success',
    data: {
      updatedTour,
    },
  });

  // try {
  //   const updatedTour = await Tour.findByIdAndUpdate(
  //     id,
  //     req.body,
  //     {
  //       new: true,
  //       runValidators: true,
  //     }
  //   );
  //   res.status(200).json({
  //     status: 'success',
  //     data: {
  //       updatedTour,
  //     },
  //   });
  // } catch (error) {
  //   const err = new AppError(error.message, 404);
  //   next(err);
  // }
});

exports.deleteTour = catchAsync(async (req, res) => {
  await Tour.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
  });
  // const id = req.params.id * 1;
  // const tour = tours.find((el) => el.id === id);
  // if (id * 1 > tours.length) {
  //   res.status(404).json({
  //     status: 'File not found',
  //     message: 'Invalid id',
  //   });
  // }
  // const updatedTour = {};

  // res.status(200).json({
  //   status: 'success',
  //   data: null,
  // });
  // try {
  //   // await Tour.findByIdAndDelete(req.params.id);
  //   // res.status(204).json({
  //   //   status: 'success',
  //   // });
  // }
  //  catch (error) {
  //   // res.status(404).json({
  //   //   status: 'fail',
  //   //   message: error,
  //   // });
  //   const err = new AppError(
  //     'No tour found with that ID',
  //     404
  //   );
  //   next(err);
  // }
});

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $lte: 5 } },
    },
    {
      $group: {
        _id: { $toLower: '$difficulty' },
        // _id: '$rating',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        // priceDiscount: {
        //   $avg: {
        //     $cond: {
        //       if: {
        //         $gt: ['$price', '$discount'],
        //       },
        //       then: '$price',
        //       else: 0,
        //     },
        //   },
        // },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
  // try {
  //   const stats = await Tour.aggregate([
  //     {
  //       $match: { ratingsAverage: { $lte: 5 } },
  //     },
  //     {
  //       $group: {
  //         _id: { $toLower: '$difficulty' },
  //         // _id: '$rating',
  //         numTours: { $sum: 1 },
  //         numRatings: { $sum: '$ratingsQuantity' },
  //         avgRating: { $avg: '$ratingsAverage' },
  //         avgPrice: { $avg: '$price' },
  //         minPrice: { $min: '$price' },
  //         maxPrice: { $max: '$price' },
  //         // priceDiscount: {
  //         //   $avg: {
  //         //     $cond: {
  //         //       if: {
  //         //         $gt: ['$price', '$discount'],
  //         //       },
  //         //       then: '$price',
  //         //       else: 0,
  //         //     },
  //         //   },
  //         // },
  //       },
  //     },
  //     {
  //       $sort: { avgPrice: 1 },
  //     },
  //     // {
  //     //   $match: { _id: { $ne: 'EASY' } },
  //     // },
  //   ]);

  //   res.status(200).json({
  //     status: 'success',
  //     data: {
  //       stats,
  //     },
  //   });
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: error,
  //   });
  // }
});

exports.getBusyMonth = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  const plans = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    // {
    //   $limit: 6,
    // },
  ]);
  const numberOfPlans = await plans.length;

  res.status(200).json({
    status: 'sucess',
    data: {
      year,
      numberOfPlans,
      plans,
    },
  });
  // try {
  //   const year = req.params.year * 1;
  //   const plans = await Tour.aggregate([
  //     {
  //       $unwind: '$startDates',
  //     },
  //     {
  //       $match: {
  //         startDates: {
  //           $gte: new Date(`${year}-01-01`),
  //           $lte: new Date(`${year}-12-31`),
  //         },
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: { $month: '$startDates' },
  //         numTourStarts: { $sum: 1 },
  //         tours: { $push: '$name' },
  //       },
  //     },
  //     {
  //       $addFields: { month: '$_id' },
  //     },
  //     {
  //       $project: {
  //         _id: 0,
  //       },
  //     },
  //     {
  //       $sort: { numTourStarts: -1 },
  //     },
  //     // {
  //     //   $limit: 6,
  //     // },
  //   ]);
  //   const numberOfPlans = await plans.length;

  //   res.status(200).json({
  //     status: 'sucess',
  //     data: {
  //       year,
  //       numberOfPlans,
  //       plans,
  //     },
  //   });
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: error,
  //   });
  // }
});

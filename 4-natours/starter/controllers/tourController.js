// const fs = require('fs');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('./handlerFactory');
// const { apiFeatures } = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,-price';
  req.query.fields =
    'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = handlerFactory.getAll(Tour);
exports.getTour = handlerFactory.getOne(Tour, {
  path: 'reviews',
});
exports.deleteTour = handlerFactory.deleteOne(Tour);
exports.updateTour = handlerFactory.updateOne(Tour);
exports.createTour = handlerFactory.createOne(Tour);
exports.getToursWithin = catchAsync(
  async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const radius =
      unit === 'mi' ? distance / 3963.2 : distance / 6378.1; //radians
    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitude and longitude in the format lat,lng.',
          400
        )
      );
    }
    const tours = await Tour.find({
      startLocation: {
        $geoWithin: { $centerSphere: [[lng, lat], radius] },
      },
    });
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours,
      },
    });
  }
);

exports.getDistances = catchAsync(
  async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitude and longitude in the format lat,lng.',
          400
        )
      );
    }
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1],
          },
          distanceField: 'distance',
          //not madittory
          distanceMultiplier: multiplier,
        },
      },
      {
        $project: {
          distance: 1,
          name: 1,
        },
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        data: distances,
      },
    });
  }
);

// exports.getAllTours = catchAsync(async (req, res) => {
//   const features = new apiFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const allTours = await features.query;

//   // SEND RES
//   res.status(200).json({
//     status: 'success',
//     results: allTours.length,
//     data: {
//       tours: allTours,
//     },
//   });
// });

// exports.getTour = catchAsync(async (req, res, next) => {
//   const id = req.params.id;
//   const tour = await Tour.findById(id).populate('reviews');

//   if (!tour) {
//     return next(
//       new AppError('No tour found with that ID', 404)
//     );
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: tour,
//     },
//   });
// });

// exports.createTours = catchAsync(async (req, res) => {
//   const newTour = await Tour.create(req.body);

//   console.log('TOUR UPLOAD SUCCESSFULL');
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });

// exports.updatedTour = catchAsync(async (req, res, next) => {
//   const id = req.params.id;
//   const updatedTour = await Tour.findByIdAndUpdate(
//     id,
//     req.body,
//     {
//       new: true,
//       runValidators: true,
//     }
//   );

//   if (!updatedTour) {
//     return next(
//       new AppError('No tour found with that ID', 404)
//     );
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       updatedTour,
//     },
//   });
// });

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(
//       new AppError('No tour found with that ID', 404)
//     );
//   }
//   res.status(204).json({
//     status: 'success',
//     message: 'Tour deleted successfully',
//   });
// });

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
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
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
});

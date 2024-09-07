const Review = require('../models/reviewModel');
// const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('./handlerFactory');

exports.getAllReviews = catchAsync(
  async (req, res, next) => {
    let filter = {};
    if (req.params.tourId)
      filter = { tour: req.params.tourId };
    const reviews = await Review.find(filter);
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  }
);
// exports.getAllReviews = handlerFactory.getAll(Review);

exports.getAllUserReviews = catchAsync(
  async (req, res, next) => {
    const reviews = await Review.find({
      user: req.user._id,
    });
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  }
);

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.find({
    _id: req.params.reviewId,
  });
  res.status(200).json({
    status: 'success',
    length: review.length,
    data: {
      review,
    },
  });
});

exports.createReview = catchAsync(
  async (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user._id;
    const tour = req.params.tourId;
    const review = await Review.create({
      ...req.body,
      tour,
      user: req.user._id,
    });
    res.status(201).json({
      status: 'success',
      data: {
        review,
      },
    });
  }
);

exports.deleteReview = handlerFactory.deleteOne(Review);
exports.updateReview = handlerFactory.updateOne(Review, [
  'rating',
  'review',
]);
// exports.getTourReviews = handlerFactory.getOne(Review);

// exports.deleteReview = catchAsync(
//   async (req, res, next) => {
//     await Review.findByIdAndDelete(req.params.id);
//     res.status(204).json({
//       status: 'success',
//       data: null,
//     });
//   }
// );

// exports.updateReview = catchAsync(
//   async (req, res, next) => {
//     const review = await Review.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       {
//         new: true,
//         runValidators: true,
//       }
//     );
//     res.status(200).json({
//       status: 'success',
//       data: {
//         review,
//       },
//     });
//   }
// );

exports.getTourReviews = catchAsync(
  async (req, res, next) => {
    console.log(req.params.tourId);
    const reviews = await Review.find({
      tour: req.params.tourId,
    });
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  }
);

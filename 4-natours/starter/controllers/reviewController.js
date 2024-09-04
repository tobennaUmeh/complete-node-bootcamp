const Review = require('../models/reviewModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(
  async (req, res, next) => {
    const reviews = await Review.find();
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  }
);

exports.getAllUserReviews = catchAsync(
  async (req, res, next) => {
    console.log(req.user._id);
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
  const review = await Review.find({ _id: req.params.id });
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
    const tour = req.params.id;
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

exports.deleteReview = catchAsync(
  async (req, res, next) => {
    await Review.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);

exports.updateReview = catchAsync(
  async (req, res, next) => {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      status: 'success',
      data: {
        review,
      },
    });
  }
);

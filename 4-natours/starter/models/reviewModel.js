const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// reviewSchema.pre('save', async function (next) {
//   const tour = await this.populate('tour').execPopulate();
//   tour.ratingsAverage =
//     (tour.ratingsAverage * tour.ratingsQuantity +
//       this.rating) /
//     (tour.ratingsQuantity + 1);
//   tour.ratingsQuantity = tour.ratingsQuantity + 1;
//   await tour.save();
//   next();
// });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  //   .populate({
  //   path: 'tour',
  //   select:
  //     '-guides -createdAt -description -imageCover -duration -difficulty -price',
  // });

  next();
});

reviewSchema.statics.calcAverageRatings = async function (
  tourId
) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// reviewSchema.pre('save', function (next) {
//   this.constructor.calcAverageRatings(this.tour);
//   next();
// });

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});
// doesbt have access to the document after it has been saved only query

reviewSchema.pre(/^findOneAnd/, async function (next) {
  // access to document
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

reviewSchema.methods.checkUser = function (user) {
  return this.user._id.toString() === user.id.toString();
};

module.exports = mongoose.model('Review', reviewSchema);

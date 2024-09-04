const mongoose = require('mongoose');

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

module.exports = mongoose.model('Review', reviewSchema);

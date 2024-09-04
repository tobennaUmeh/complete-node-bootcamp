const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

let regex = /^[a-zA-Z]+$/;

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, ' A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [
        40,
        'A tour length cannot be more than 40 characters',
      ],
      minLength: [
        10,
        'A tour length cannot be less than 10 characters',
      ],
      // validate: [
      //   validator.isAlpha,
      //   'Tour name must only contain characters',
      // ],
      validate: {
        validator: function (val) {
          return regex.test(val.split(' ').join(''));
        },
        message: 'Tour name must only contain characters',
      },
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'Difficulty is either: easy, medium, difficult',
      },
    },
    // rating: {
    //   type: Number,
    //   required: [true, 'A tour must have a rating'],
    //   default: 4.5,
    //   min: 1,
    //   max: 5,
    // },
    ratingsAverage: {
      type: Number,
      // required: [true, 'A tour must have a rating'],
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingQuantity: {
      type: Number,
      // required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message:
          'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: {
          values: ['Point'],
          message: 'Type must be Point',
        },
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: {
            values: ['Point'],
            message: 'Type must be Point',
          },
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
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

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//DOCUMENT MIDDLEWARE RUNS BEFORE .SAVE() AND .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guded.map(async (el) =>
//     User.findById(el)
//   );
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// QUERY MIDDLEWARE RUNS before .find()
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  // console.log(
  //   `Query took ${Date.now() - this.start} milliseconds!`
  // );
  // console.log(doc);
  next();
});

// AGGREATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  // console.log(this);
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

// const testTour = new Tour({
//   name: 'Test 2',
//   rating: 4.5,
// console.log(testTour);
//   price: 4007,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => console.log(err));

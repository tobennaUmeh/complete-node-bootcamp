const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: '../../config.env' });
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');
const mongoose = require('mongoose');

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    dbName: 'natours',
  })
  .then(() => {
    console.log('DB connection successful');
  });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
);

const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully uploaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const importUsers = async () => {
  try {
    await User.create(users, {
      validateBeforeSave: false,
    });
    console.log('Data successfully uploaded!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const importReviews = async () => {
  try {
    await Review.create(reviews, {
      validateBeforeSave: false,
    });
    console.log('Data successfully uploaded!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted');
    process.exit();
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const deletUserData = async () => {
  try {
    await User.deleteMany();
    console.log('Data deleted');
    process.exit();
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const deleteReviews = async () => {
  try {
    await Review.deleteMany();
    console.log('Data deleted');
    process.exit();
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else if (process.argv[2] === '--import-users') {
  importUsers();
} else if (process.argv[2] === '--delete-users') {
  deletUserData();
} else if (process.argv[2] === '--import-reviews') {
  importReviews();
} else if (process.argv[2] === '--delete-reviews') {
  deleteReviews();
}

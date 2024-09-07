const express = require('express');
// const factory = require('./handlerFactory');
const {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getAllUserReviews,
} = require('../controllers/reviewController');
const {
  protect,
  restrictTo,
} = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .get(restrictTo('admin', 'user'), getAllReviews);

router
  .route('/')
  .post(restrictTo('admin', 'user'), createReview);
router
  .route('/users')
  .get(restrictTo('admin', 'user'), getAllUserReviews);

router
  .route('/:reviewId')
  .get(getReview)
  .patch(restrictTo('admin', 'user'), updateReview)
  .delete(restrictTo('admin', 'user'), deleteReview);
// router
//   .route('/:tourId/reviews')
//   .post(protect, createReview);

// router
//   .route('/users/:userId')
//   .get(protect, restrictTo('admin'), getAllUserReviews);

module.exports = router;

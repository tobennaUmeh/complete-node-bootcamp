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

router.route('/').get(getAllReviews);

router.route('/user').get(protect, getAllUserReviews);
router
  .route('/:id')
  .get(getReview)
  .patch(updateReview)
  .delete(deleteReview)
  .post(protect, restrictTo('user'), createReview);

router
  .route('/tour/:tourId/reviews')
  .post(protect, restrictTo('user'), createReview);

module.exports = router;

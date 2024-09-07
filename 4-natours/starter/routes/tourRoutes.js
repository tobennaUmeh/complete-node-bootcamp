const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTour,
  getTourStats,
  getBusyMonth,
  getToursWithin,
  getDistances,
  // checkID,
  // checkBody,
} = require('../controllers/tourController');
const {
  protect,
  restrictTo,
} = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);
// router.param('id', checkID); defines params middleware

router
  .route('/tour-cheapest')
  .get(aliasTopTour, getAllTours);
// // 127.0.0.1:3000/api/v1/tours?page=1&sort=rating,-price

router.route('/tour-stats').get(getTourStats);
router.route('/busy-months/:year').get(getBusyMonth);
router.route('/top-5-cheap').get(aliasTopTour, getAllTours);

// geospatial aggregation
router
  .route(
    '/tours-within/:distance/center/:latlng/unit/:unit'
  )
  .get(getToursWithin);

// geospatial aggregation with mongodb
router
  .route('/distances/:latlng/unit/:unit')
  .get(getDistances);

router
  .route('/')
  .get(protect, getAllTours)
  .post(
    protect,
    restrictTo('admin', 'lead-guide'),
    createTour
  );
router
  .route('/:id')
  .get(protect, getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    updateTour
  )
  .delete(protect, restrictTo('admin'), deleteTour);

// const {
//   createReview,
//   getReview,
//   updateReview,
//   deleteReview,
//   getAllReviews,
//   getAllUserReviews,
//   getTourReviews,
// } = require('../controllers/reviewController');
// Review Routes
// router
//   .route('/:tourId/reviews')
//   .post(protect, createReview)
//   .get(getTourReviews);
// router
//   .route('/:tourId/reviews/:reviewId')
//   .get(getReview)
//   .patch(protect, updateReview)
//   .delete(protect, deleteReview);

module.exports = router;

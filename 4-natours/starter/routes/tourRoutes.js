const express = require('express');
const {
  getAllTours,
  createTours,
  getTour,
  updatedTour,
  deleteTour,
  aliasTopTour,
  getTourStats,
  getBusyMonth,
  // checkID,
  // checkBody,
} = require('../controllers/tourController');
const {
  protect,
  restrictTo,
} = require('../controllers/authController');

const router = express.Router();
// router.param('id', checkID); defines params middleware

router
  .route('/tour-cheapest')
  .get(aliasTopTour, getAllTours);
// 127.0.0.1:3000/api/v1/tours?page=1&sort=rating,-price

router.route('/tour-stats').get(getTourStats);
router.route('/busy-months/:year').get(getBusyMonth);
router.route('/top-5-cheap').get(aliasTopTour, getAllTours);

router.route('/').get(protect, getAllTours).post(
  protect,
  // restrictTo('admin', 'lead-guide'),
  createTours
);
router
  .route('/:id')
  .get(protect, getTour)
  .patch(updatedTour)
  .delete(protect, restrictTo('admin'), deleteTour);

module.exports = router;

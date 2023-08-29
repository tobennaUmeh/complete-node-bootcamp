const express = require('express');
const {
  getAllTours,
  createTours,
  getTour,
  updatedTour,
  deleteTour,
  checkID,
  checkBody,
} = require('../controllers/tourController');

const router = express.Router();
router.param('id', checkID);

router.route('/').get(getAllTours).post(checkBody, createTours);
router.route('/:id').get(getTour).patch(updatedTour).delete(deleteTour);

module.exports = router;

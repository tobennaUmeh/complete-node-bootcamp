const express = require('express');

const {
  getAllUsers,
  // createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  // checkID,
} = require('../controllers/userController');
const {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/authController');

const router = express.Router();

// router.param('id', checkID);
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch(`/updateMyPassword`, protect, updatePassword);
router.patch(`/updateMe`, protect, updateMe);
router.delete(`/deleteMe`, protect, deleteMe);
// {
//   validateBeforeSave: false;
// }

router
  .route('/')
  .get(protect, restrictTo('admin'), getAllUsers);
router
  .route('/:id')
  .get(protect, restrictTo('admin'), getUser)
  .patch(protect, restrictTo('admin'), updateUser)
  .delete(protect, restrictTo('admin'), deleteUser);

module.exports = router;

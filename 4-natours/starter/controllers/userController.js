const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// exports.checkID = (req, res, next, val) => {
//   const id = req.params.id * 1;
//   if (id * 1 > user.length || typeof val !== 'number') {
//     return res.status(404).json({
//       status: 'File not found',
//       message: 'Invalid id',
//     });
//   }
//   next();
// };

const filterObj = (obj, ...allowedFields) => {
  const filteredObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredObj[key] = obj[key];
    }
  });
  return filteredObj;
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user) {
    return next(
      new AppError('No user found with that ID', 404)
    );
  }
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// exports.createUser = catchAsync(async (req, res) => {
//   const newUser = await User.create(req.body);
//   console.log('User Created successfully');
//   res.status(201).json({
//     status: 'success',
//     data: {
//       user: newUser,
//     },
//   });
// });

exports.updateUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const user = await User.findByIdAndUpdate(
    id,
    {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      active: req.body.active,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!user) {
    return next(
      new AppError('No user found with that ID', 404)
    );
  }
  console.log('User Updated successfully');
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return next(
      new AppError('No user found with that ID', 404)
    );
  }
  res.status(200).json({
    status: 'success',
    message: 'USER DELETED SUCCESSFULLY',
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  // if (req.file) filteredBody.photo = req.file.filename;
  // // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
  res.status(200).json;
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  if (req.user.role === 'admin') {
    return next(
      new AppError('Admins cannot be deleted', 402)
    );
  }
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

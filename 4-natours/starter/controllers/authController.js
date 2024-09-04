const User = require('../models/userModel');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const createSendToken = async (
  user,
  statusCode,
  req,
  res
) => {
  const token = await jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        process.env.JWT_COOKIE_EXPIRES_IN *
          24 *
          60 *
          60 *
          1000
    ),
    httpOnly: true,
    // secure: true,
    // secure:
    //   req.secure ||
    //   req.headers['x-forwarded-proto'] === 'https',
  };

  if (process.env.NODE_ENV === 'production')
    cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // res.status(201).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     user: newUser,
  //   },
  // });
  createSendToken(newUser, 200, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError(
        'Please provide email and password!',
        400
      )
    );
  }

  const user = await User.findOne({ email }).select(
    '+password'
  );

  if (!user) {
    return next(new AppError('Incorrect email', 400));
  }

  if (
    !(await user.correctPassword(password, user.password))
  ) {
    try {
      await user.increaseLoginAttempts();
      await user.save({ validateBeforeSave: false });

      if (await user.isLockedOut()) {
        return next(
          new AppError(
            'Your account has been locked for 10 mins. Please try again later.',
            401
          )
        );
      }
    } catch (err) {
      return next(
        new AppError('Error increasing login attempts', 500)
      );
    }

    return next(new AppError('Incorrect password', 401));
  }

  if (await user.isLockedOut()) {
    return next(
      new AppError(
        'Your account has been locked for 10 mins. Please try again later.',
        401
      )
    );
  }

  await user.resetLoginAttempts();
  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //Get token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  //checks if user changed password after token was given
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed password! Please log in again.',
        401
      )
    );
  }

  if (!token) {
    return next(
      new AppError(
        'You are not logged in! Please log in to get access.',
        401
      )
    );
  }

  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perform this action',
          403
        )
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(
  async (req, res, next) => {
    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user) {
      return next(
        new AppError(
          'There is no user with that email address',
          404
        )
      );
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}\nIf you did not forget your password, please ignore this email!`;
    console.log(message);
    try {
      await sendEmail({
        email: user.email,
        subject:
          'Your password reset token (valid for 10 min)',
        message,
        html: message,
      });
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(
        new AppError(
          'There was an error sending the email. Try again later!',
          500
        )
      );
    }
  }
);

exports.resetPassword = catchAsync(
  async (req, res, next) => {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      return next(
        new AppError('Token is invalid or has expired', 400)
      );
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    createSendToken(user, 200, req, res);
  }
);

exports.updatePassword = catchAsync(
  async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select(
      '+password'
    );

    // 2) Check if POSTed current password is correct
    if (
      !(await user.correctPassword(
        req.body.passwordCurrent,
        user.password
      ))
    ) {
      return next(
        new AppError('Your current password is wrong.', 401)
      );
    }

    if (
      await user.correctPassword(
        req.body.password,
        user.password
      )
    ) {
      return next(
        new AppError(
          'Your current password and new passwords are the same.',
          401
        )
      );
    }

    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
  }
);

const AppError = require('../utils/appError.js');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  const error = new AppError(message, 400);
  return error;
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(
    (el) => el.message
  );
  const message = `Invalid input data. ${errors.join(
    '. '
  )}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError(
    'Your token has expired! Please log in again.',
    401
  );

const sendErrorDev = (err, req, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'fail',
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  let error = { ...err };
  if (process.env.NODE_ENV === 'development') {
    if (err.name === 'CastError') {
      error = handleCastErrorDB(err);
    }
    if (err.name === 'ValidationError') {
      error = handleValidationErrorDB(err);
    } else if (err.code === 11000) {
      error = handleDuplicateFieldsDB(err);
    } else if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    } else if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    } else {
      sendErrorDev(err, req, res);
      next();
    }
    sendErrorDev(error, req, res);
    next();
  } else if (process.env.NODE_ENV === 'production') {
    if (error.name === 'CastError') {
      error = handleCastErrorDB(err);
    } else if (error.code === 11000) {
      console.log('💥 error');
      error = handleDuplicateFieldsDB(err);
    } else if (err.name === 'ValidationError') {
      error = handleValidationErrorDB(err);
    } else if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    } else if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    } else {
      sendErrorProd(err, req, res);
      next();
    }

    sendErrorProd(error, req, res);
    next();
  }
};

// const express = require('express');
const catchAsync = require('../utils/catchAsync');
// const { Model } = require('mongoose');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const filteredObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredObj[key] = obj[key];
    }
  });
  return filteredObj;
};

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(
      Model.find(),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    console.log(req.query);
    // const doc = await features.query.explain();
    const doc = await features.query;
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(
        new AppError('No document found with that ID', 404)
      );
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
};

exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    if (req.params.reviewId) {
      req.params.id = req.params.reviewId;
    }

    // Retrieve the document first
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      return next(
        new AppError('No document found with that ID', 404)
      );
    }

    // Check if the user is allowed to delete the document
    if (
      req.user.role !== 'admin' &&
      !doc.checkUser(req.user)
    ) {
      return next(
        new AppError(
          'You can only delete your own review',
          401
        )
      );
    }

    // Remove the document
    await doc.remove();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
};

exports.deleteMe = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.user.id);
    if (!doc) {
      return next(
        new AppError('No document found with that ID', 404)
      );
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
};

exports.updateOne = (Model, updateOptions) => {
  return catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /updateMyPassword.',
          400
        )
      );
    }

    // 2) Filter out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(
      req.body,
      ...updateOptions
    );

    if (req.params.reviewId) {
      req.params.id = req.params.reviewId;
    }

    // Retrieve the document first
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      return next(
        new AppError('No document found with that ID', 404)
      );
    }

    // Check if the user is allowed to update the document
    if (
      req.user.role !== 'admin' &&
      !doc.checkUser(req.user)
    ) {
      return next(
        new AppError(
          'You can only update your own account',
          401
        )
      );
    }

    // 3) Update the document
    const updatedDoc = await Model.findByIdAndUpdate(
      req.params.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        data: updatedDoc,
      },
    });
  });
};

exports.updateMe = (Model, updateOptions) => {
  return catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /updateMyPassword.',
          400
        )
      );
    }
    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(
      req.body,
      ...updateOptions
    );
    const doc = await Model.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!doc) {
      return next(
        new AppError('No document found with that ID', 404)
      );
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
};

exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: newDoc,
      },
    });
  });
};

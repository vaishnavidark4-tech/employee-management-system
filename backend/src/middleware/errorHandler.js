const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

// Handles unknown routes
const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// Central error handler: every error ends up here and is sent in the same JSON format
// { success: false, message: '...', errors: { field: 'message' } }
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let errors = err.errors || null;

  // Mongoose schema validation failed -> 400
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = {};
    Object.keys(err.errors).forEach((field) => {
      errors[field] = err.errors[field].message;
    });
  }

  // Invalid MongoDB id (e.g. /api/tasks/abc) -> treat as not found
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 404;
    message = `Invalid ${err.path}: ${err.value}`;
    errors = null;
  }

  // Unique index violation -> 409
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    const fieldNames = { employeeId: 'Employee ID', email: 'Email' };
    message = `${fieldNames[field] || field} "${err.keyValue[field]}" already exists`;
    errors = { [field]: message };
  }

  // Bad JSON body
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  if (statusCode === 500) {
    console.error(err);
    if (process.env.NODE_ENV === 'production') message = 'Internal server error';
  }

  res.status(statusCode).json({ success: false, message, errors });
};

module.exports = { notFound, errorHandler };

const { sendError } = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

module.exports = function errorHandler(err, req, res, next) {
  // our custom errors
  if (err instanceof ApiError) {
    return sendError(res, err.message, err.statusCode);
  }

  // mongoose validation
  if (err.name === 'ValidationError') {
    let msgs = Object.values(err.errors).map(e => e.message);
    return sendError(res, msgs.join('. '), 400);
  }

  // duplicate key
  if (err.code === 11000) {
    let field = Object.keys(err.keyPattern)[0];
    return sendError(res, `${field} already exists`, 409);
  }

  // bad ObjectId
  if (err.name === 'CastError') {
    return sendError(res, 'Invalid resource ID', 400);
  }

  return sendError(res, 'Internal server error', 500);
};

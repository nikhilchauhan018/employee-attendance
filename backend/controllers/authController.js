const authService = require('../services/authService');
const { sendSuccess, sendCreated } = require('../utils/ApiResponse');

exports.register = async function(req, res, next) {
  try {
    let result = await authService.register(req.body);
    sendCreated(res, result, 'Registration successful');
  } catch (err) {
    next(err);
  }
};

exports.login = async function(req, res, next) {
  try {
    let result = await authService.login(req.body);
    sendSuccess(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async function(req, res, next) {
  try {
    let user = await authService.getProfile(req.user._id);
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

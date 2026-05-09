const dashboardService = require('../services/dashboardService');
const { sendSuccess } = require('../utils/ApiResponse');

exports.getEmployeeDashboard = async function(req, res, next) {
  try {
    let data = await dashboardService.getEmployeeDashboard(req.user._id);
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

exports.getManagerDashboard = async function(req, res, next) {
  try {
    let data = await dashboardService.getManagerDashboard();
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

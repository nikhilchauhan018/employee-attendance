const svc = require('../services/attendanceService');
const { sendSuccess } = require('../utils/ApiResponse');

const checkIn = async (req, res, next) => {
  try {
    let record = await svc.checkIn(req.user._id);
    sendSuccess(res, record, 'Checked in successfully');
  } catch (err) { next(err); }
};

const checkOut = async (req, res, next) => {
  try {
    let record = await svc.checkOut(req.user._id);
    sendSuccess(res, record, 'Checked out successfully');
  } catch (err) { next(err); }
};

const getTodayStatus = async (req, res, next) => {
  try {
    let record = await svc.getTodayStatus(req.user._id);
    sendSuccess(res, record);
  } catch (err) { next(err); }
};

const getMyHistory = async (req, res, next) => {
  try {
    let data = await svc.getHistory(req.user._id, req.query);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

const getMySummary = async (req, res, next) => {
  try {
    let year = parseInt(req.query.year) || new Date().getFullYear();
    let month = parseInt(req.query.month) || new Date().getMonth() + 1;
    let summary = await svc.getMonthlySummary(req.user._id, year, month);
    sendSuccess(res, summary);
  } catch (err) { next(err); }
};

// ==================== MANAGER CONTROLLERS ====================

const getAllAttendance = async (req, res, next) => {
  try {
    let data = await svc.getAllAttendance(req.query);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

const getEmployeeAttendance = async (req, res, next) => {
  try {
    let data = await svc.getEmployeeAttendance(req.params.id, req.query);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

const getTeamSummary = async (req, res, next) => {
  try {
    let data = await svc.getTeamSummary(req.query);
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

const exportAttendance = async (req, res, next) => {
  try {
    let csv = await svc.exportAttendance(req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.csv');
    res.send(csv);
  } catch (err) { next(err); }
};

const getTodayAllStatus = async (req, res, next) => {
  try {
    let data = await svc.getTodayAllStatus();
    sendSuccess(res, data);
  } catch (err) { next(err); }
};

module.exports = {
  checkIn, checkOut, getTodayStatus,
  getMyHistory, getMySummary,
  getAllAttendance, getEmployeeAttendance,
  getTeamSummary, exportAttendance, getTodayAllStatus
};

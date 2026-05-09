const { Router } = require('express');
const ctrl = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const router = Router();

router.use(authenticate);

// employee routes
router.post('/checkin', ctrl.checkIn);
router.post('/checkout', ctrl.checkOut);
router.get('/today', ctrl.getTodayStatus);
router.get('/my-history', ctrl.getMyHistory);
router.get('/my-summary', ctrl.getMySummary);

// manager routes
router.get('/all', authorize(ROLES.MANAGER), ctrl.getAllAttendance);
router.get('/employee/:id', authorize(ROLES.MANAGER), ctrl.getEmployeeAttendance);
router.get('/summary', authorize(ROLES.MANAGER), ctrl.getTeamSummary);
router.get('/export', authorize(ROLES.MANAGER), ctrl.exportAttendance);
router.get('/today-status', authorize(ROLES.MANAGER), ctrl.getTodayAllStatus);

module.exports = router;

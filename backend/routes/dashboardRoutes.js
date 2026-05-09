const { Router } = require('express');
const ctrl = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const router = Router();

router.use(authenticate);

router.get('/employee', ctrl.getEmployeeDashboard);
router.get('/manager', authorize(ROLES.MANAGER), ctrl.getManagerDashboard);

module.exports = router;

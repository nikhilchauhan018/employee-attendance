const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../validators/authValidator');

router.post('/register', validateRegister, ctrl.register);
router.post('/login', validateLogin, ctrl.login);
router.get('/me', authenticate, ctrl.getProfile);

module.exports = router;

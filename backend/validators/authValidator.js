const ApiError = require('../utils/ApiError');
const { DEPARTMENTS, ROLES } = require('../config/constants');

function validateRegister(req, res, next) {
  let { name, email, password, department, role } = req.body;
  let errs = [];

  if (!name || name.trim().length < 2) errs.push('Name must be at least 2 characters');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errs.push('Valid email is required');
  if (!password || password.length < 6) errs.push('Password must be at least 6 characters');
  if (!department || !DEPARTMENTS.includes(department)) errs.push('Valid department is required');
  if (!role || !Object.values(ROLES).includes(role)) errs.push('Valid role is required');

  if (errs.length) return next(new ApiError(400, errs.join('. ')));
  next();
}

function validateLogin(req, res, next) {
  let { email, password } = req.body;
  let errs = [];

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errs.push('Valid email is required');
  if (!password) errs.push('Password is required');

  if (errs.length) return next(new ApiError(400, errs.join('. ')));
  next();
}

module.exports = { validateRegister, validateLogin };

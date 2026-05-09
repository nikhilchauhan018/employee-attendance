const User = require('../models/User');
const Counter = require('../models/Counter');
const ApiError = require('../utils/ApiError');
const { generateToken } = require('../utils/helpers');

async function register(data) {
  let { email } = data;

  // check if email already taken
  let existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'Email is already registered');
  }

  // generate next employee ID using atomic counter
  // findOneAndUpdate with $inc is atomic in MongoDB — no race conditions
  let seq = await Counter.getNextSequence('employeeId');
  data.employeeId = 'EMP' + String(seq).padStart(4, '0');

  let user = await User.create(data);
  let token = generateToken(user._id);

  return { user, token };
}

async function login({ email, password }) {
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  let user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  let token = generateToken(user._id);
  return { user, token };
}

async function getProfile(userId) {
  let user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

module.exports = { register, login, getProfile };

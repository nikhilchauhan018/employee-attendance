const jwt = require('jsonwebtoken');

exports.generateToken = function(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// strips time portion from date
exports.getDateOnly = function(d) {
  let date = d ? new Date(d) : new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

exports.calculateHoursBetween = function(start, end) {
  let diff = new Date(end) - new Date(start);
  return diff / (1000 * 60 * 60);
};

exports.getDaysInMonth = function(year, month) {
  return new Date(year, month, 0).getDate();
};

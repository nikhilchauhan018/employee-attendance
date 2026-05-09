const ApiError = require('../utils/ApiError');

exports.validateMonthlySummary = function(req, res, next) {
  let y = parseInt(req.params.year);
  let m = parseInt(req.params.month);

  if (isNaN(y) || y < 2020 || y > 2100)
    return next(new ApiError(400, 'Year must be between 2020 and 2100'));

  if (isNaN(m) || m < 1 || m > 12)
    return next(new ApiError(400, 'Month must be between 1 and 12'));

  next();
};

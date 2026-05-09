// standard api response helpers
function sendSuccess(res, data, msg = 'Success', code = 200) {
  return res.status(code).json({
    success: true,
    message: msg,
    data: data
  });
}

function sendCreated(res, data, msg = 'Created successfully') {
  return sendSuccess(res, data, msg, 201);
}

function sendError(res, msg = 'Something went wrong', code = 500) {
  return res.status(code).json({
    success: false,
    message: msg,
    data: null
  });
}

module.exports = { sendSuccess, sendCreated, sendError };

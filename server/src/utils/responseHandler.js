function sendSuccess(res, data = null, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    error: null,
    timestamp: new Date().toISOString(),
  });
}

function sendError(
  res,
  message = "Request failed.",
  errorCode = "ERR_BAD_REQUEST",
  statusCode = 400,
  details = null,
) {
  return res.status(statusCode).json({
    success: false,
    message,
    error: errorCode,
    data: null,
    details,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  sendSuccess,
  sendError,
};

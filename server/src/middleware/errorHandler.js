const { ERROR_CODES } = require("../config/constants");
const { sendError } = require("../utils/responseHandler");

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  console.error("[error]", {
    path: req.originalUrl,
    method: req.method,
    code: error.code,
    message: error.message,
  });

  if (error.name === "ValidationError") {
    return sendError(
      res,
      error.message || "Validation failed.",
      ERROR_CODES.ERR_VALIDATION,
      400,
      error.details || null,
    );
  }

  if (
    error.name === "UnauthorizedError" ||
    error.name === "JsonWebTokenError"
  ) {
    return sendError(
      res,
      "Authentication failed.",
      ERROR_CODES.ERR_UNAUTHORIZED,
      401,
    );
  }

  if (error.code === "ER_DUP_ENTRY") {
    return sendError(
      res,
      "Duplicate record detected.",
      ERROR_CODES.ERR_DUPLICATE_ENTRY,
      409,
      error.sqlMessage || null,
    );
  }

  if (typeof error.code === "string" && error.code.startsWith("ER_")) {
    return sendError(
      res,
      "A database error occurred.",
      ERROR_CODES.ERR_DATABASE,
      500,
      error.sqlMessage || null,
    );
  }

  return sendError(
    res,
    error.message || "An unexpected error occurred.",
    error.errorCode || ERROR_CODES.ERR_INTERNAL_SERVER,
    error.statusCode || error.status || 500,
    error.details || null,
  );
}

module.exports = errorHandler;

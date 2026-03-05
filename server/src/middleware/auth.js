const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { ERROR_CODES } = require("../config/constants");
const { sendError } = require("../utils/responseHandler");

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return sendError(
      res,
      "Authorization token is required.",
      ERROR_CODES.ERR_UNAUTHORIZED,
      401,
    );
  }

  try {
    req.user = jwt.verify(token, env.jwt.secret);
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendError(
        res,
        "Authorization token has expired.",
        ERROR_CODES.ERR_TOKEN_EXPIRED,
        403,
      );
    }

    return sendError(
      res,
      "Authorization token is invalid.",
      ERROR_CODES.ERR_UNAUTHORIZED,
      401,
    );
  }
}

function authorizeRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(
        res,
        "User context is missing.",
        ERROR_CODES.ERR_UNAUTHORIZED,
        401,
      );
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        "You do not have permission to access this resource.",
        ERROR_CODES.ERR_FORBIDDEN,
        403,
      );
    }

    return next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRole,
};

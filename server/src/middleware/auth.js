const { ERROR_CODES } = require("../config/constants");
const { sendError } = require("../utils/responseHandler");
const { verifyAccessToken } = require("../utils/jwtUtils");

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
    req.user = verifyAccessToken(token);
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendError(
        res,
        "Authorization token has expired.",
        ERROR_CODES.ERR_TOKEN_EXPIRED,
        401,
      );
    }

    return sendError(
      res,
      "Authorization token is invalid.",
      ERROR_CODES.ERR_INVALID_TOKEN,
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

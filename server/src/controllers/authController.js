const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { ERROR_CODES } = require("../config/constants");
const userModel = require("../models/userModel");
const { sendSuccess, sendError } = require("../utils/responseHandler");
const {
  comparePassword,
  hashPassword,
  validatePasswordStrength,
} = require("../utils/passwordUtils");
const {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwtUtils");

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function isWithinDateRange(user) {
  const today = new Date();
  const from = user.from_date ? new Date(user.from_date) : null;
  const to = user.to_date ? new Date(user.to_date) : null;

  if (from && today < from) {
    return false;
  }

  if (to && today > to) {
    return false;
  }

  return true;
}

function toMd5(value) {
  return crypto.createHash("md5").update(value).digest("hex");
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendError(
        res,
        "Username and password are required.",
        ERROR_CODES.ERR_VALIDATION_ERROR,
        400,
      );
    }

    const user = await userModel.findUserByUsername(username.trim());

    if (!user) {
      return sendError(
        res,
        "User not found.",
        ERROR_CODES.ERR_USER_NOT_FOUND,
        404,
      );
    }

    if (Number(user.is_active) !== 0 || !isWithinDateRange(user)) {
      return sendError(
        res,
        "User account is inactive.",
        ERROR_CODES.ERR_USER_INACTIVE,
        403,
      );
    }

    const storedHash = user.password || "";
    const isBcryptHash = storedHash.startsWith("$2");
    let passwordValid = false;

    if (isBcryptHash) {
      passwordValid = await comparePassword(password, storedHash);
    } else {
      passwordValid = toMd5(password) === storedHash.toLowerCase();
      if (passwordValid) {
        const upgradedHash = await hashPassword(password);
        await userModel.updateUserPassword(user.id, upgradedHash);
      }
    }

    if (!passwordValid) {
      return sendError(
        res,
        "Invalid credentials.",
        ERROR_CODES.ERR_INVALID_CREDENTIALS,
        401,
      );
    }

    const roleName = (user.role || "user").toLowerCase();
    const payload = {
      userId: user.id,
      companyId: user.company_id,
      role: roleName,
      roleId: user.role_id,
      username: user.username,
      email: user.email,
    };

    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await userModel.insertLoginHistory({
      companyId: user.company_id,
      userId: user.id,
      loginIp: getClientIp(req),
      loginBrowser: String(req.headers["user-agent"] || "unknown").slice(0, 50),
    });

    return sendSuccess(
      res,
      {
        token,
        refreshToken,
        user_id: user.id,
        company_id: user.company_id,
        username: user.username,
        email: user.email,
        role: roleName,
        user_name: user.username,
      },
      "Login successful",
      200,
    );
  } catch (error) {
    return next(error);
  }
}

async function logout(req, res, next) {
  try {
    await userModel.markLogoutByUserId(req.user.userId);
    return sendSuccess(res, null, "Logout successful", 200);
  } catch (error) {
    return next(error);
  }
}

async function refreshToken(req, res) {
  const { refreshToken: providedRefreshToken } = req.body;

  if (!providedRefreshToken) {
    return sendError(
      res,
      "Refresh token is required.",
      ERROR_CODES.ERR_VALIDATION_ERROR,
      400,
    );
  }

  try {
    const decoded = verifyRefreshToken(providedRefreshToken);
    const token = generateToken({
      userId: decoded.userId,
      companyId: decoded.companyId,
      role: decoded.role,
      roleId: decoded.roleId,
      username: decoded.username,
      email: decoded.email,
    });

    return sendSuccess(
      res,
      {
        token,
        expiresIn: env.jwt.expiry,
      },
      "Token refreshed",
      200,
    );
  } catch (error) {
    return sendError(
      res,
      "Invalid refresh token.",
      ERROR_CODES.ERR_INVALID_TOKEN,
      401,
    );
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(
        res,
        "Email is required.",
        ERROR_CODES.ERR_VALIDATION_ERROR,
        400,
      );
    }

    const user = await userModel.findUserByEmail(email.trim());

    if (!user) {
      return sendError(
        res,
        "Email not found.",
        ERROR_CODES.ERR_USER_NOT_FOUND,
        404,
      );
    }

    const resetToken = jwt.sign(
      {
        userId: user.id,
        companyId: user.company_id,
        email: user.email,
        purpose: "password-reset",
      },
      env.jwt.secret,
      { expiresIn: "1h" },
    );

    console.log(
      `[auth] password reset token for ${user.email}: ${env.corsOrigin}/reset-password?token=${resetToken}`,
    );

    return sendSuccess(
      res,
      env.nodeEnv === "production" ? null : { resetToken },
      "Password reset link sent to email",
      200,
    );
  } catch (error) {
    return next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return sendError(
        res,
        "Token and newPassword are required.",
        ERROR_CODES.ERR_VALIDATION_ERROR,
        400,
      );
    }

    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      return sendError(
        res,
        "Password does not meet strength requirements.",
        ERROR_CODES.ERR_VALIDATION_ERROR,
        400,
        passwordCheck.checks,
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.jwt.secret);
    } catch (tokenError) {
      const code =
        tokenError.name === "TokenExpiredError"
          ? ERROR_CODES.ERR_TOKEN_EXPIRED
          : ERROR_CODES.ERR_INVALID_TOKEN;
      return sendError(res, "Invalid or expired reset token.", code, 401);
    }

    if (decoded.purpose !== "password-reset") {
      return sendError(
        res,
        "Invalid reset token.",
        ERROR_CODES.ERR_INVALID_TOKEN,
        401,
      );
    }

    const existing = await userModel.getProfileByUserId(
      decoded.userId,
      decoded.companyId,
    );

    if (!existing) {
      return sendError(
        res,
        "User not found for reset token.",
        ERROR_CODES.ERR_USER_NOT_FOUND,
        404,
      );
    }

    const currentUser = await userModel.findUserByUsername(existing.email);
    const currentHash = currentUser?.password || "";

    const isSamePassword = currentHash.startsWith("$2")
      ? await comparePassword(newPassword, currentHash)
      : toMd5(newPassword) === currentHash.toLowerCase();

    if (isSamePassword) {
      return sendError(
        res,
        "New password cannot be the same as old password.",
        ERROR_CODES.ERR_VALIDATION_ERROR,
        400,
      );
    }

    const newHash = await hashPassword(newPassword);
    await userModel.updateUserPassword(decoded.userId, newHash);

    return sendSuccess(res, null, "Password reset successful", 200);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
};

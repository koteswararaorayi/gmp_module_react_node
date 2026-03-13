const crypto = require("crypto");
const { ERROR_CODES } = require("../config/constants");
const userModel = require("../models/userModel");
const { sendSuccess, sendError } = require("../utils/responseHandler");
const {
  comparePassword,
  hashPassword,
  validatePasswordStrength,
} = require("../utils/passwordUtils");

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function transformProfileRow(profile) {
  return {
    user_id: profile.user_id,
    username: profile.username,
    email: profile.email,
    role: (profile.role || "user").toLowerCase(),
    company_id: profile.company_id,
    user_name: profile.username,
    user_image: profile.user_image,
    from_date: profile.from_date,
    to_date: profile.to_date,
    is_active: profile.is_active,
    current_status: profile.current_status,
  };
}

function toMd5(value) {
  return crypto.createHash("md5").update(value).digest("hex");
}

async function getProfile(req, res, next) {
  try {
    const profile = await userModel.getProfileByUserId(
      req.user.userId,
      req.user.companyId,
    );

    if (!profile) {
      return sendError(
        res,
        "Profile not found.",
        ERROR_CODES.ERR_USER_NOT_FOUND,
        404,
      );
    }

    return sendSuccess(
      res,
      transformProfileRow(profile),
      "Profile retrieved",
      200,
    );
  } catch (error) {
    return next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { email, user_name: userName, user_image: userImage } = req.body;

    if (!email) {
      return sendError(
        res,
        "Email is required.",
        ERROR_CODES.ERR_VALIDATION_ERROR,
        400,
      );
    }

    if (!isValidEmail(email)) {
      return sendError(
        res,
        "Email format is invalid.",
        ERROR_CODES.ERR_VALIDATION_ERROR,
        400,
      );
    }

    if (userImage && String(userImage).length > 5_000_000) {
      return sendError(
        res,
        "Profile image is too large.",
        ERROR_CODES.ERR_VALIDATION_ERROR,
        413,
      );
    }

    const duplicate = await userModel.emailExistsForOtherUser(
      email.trim(),
      req.user.userId,
    );

    if (duplicate) {
      return sendError(
        res,
        "Email already in use.",
        ERROR_CODES.ERR_DUPLICATE_ENTRY,
        409,
      );
    }

    const existing = await userModel.getProfileByUserId(
      req.user.userId,
      req.user.companyId,
    );

    if (!existing) {
      return sendError(
        res,
        "Profile not found.",
        ERROR_CODES.ERR_USER_NOT_FOUND,
        404,
      );
    }

    await userModel.updateProfileByUserId(req.user.userId, req.user.companyId, {
      email: email.trim(),
      userName: userName?.trim() || existing.username,
      userImage: userImage || null,
    });

    return sendSuccess(
      res,
      { user_id: req.user.userId },
      "Profile updated successfully",
      200,
    );
  } catch (error) {
    return next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return sendError(
        res,
        "oldPassword and newPassword are required.",
        ERROR_CODES.ERR_VALIDATION_ERROR,
        400,
      );
    }

    if (oldPassword === newPassword) {
      return sendError(
        res,
        "New password must be different from old password.",
        ERROR_CODES.ERR_VALIDATION_ERROR,
        400,
      );
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      return sendError(
        res,
        "Password does not meet strength requirements.",
        ERROR_CODES.ERR_VALIDATION_ERROR,
        400,
        strength.checks,
      );
    }

    const user = await userModel.findUserByUsername(req.user.username);
    if (!user) {
      return sendError(
        res,
        "User not found.",
        ERROR_CODES.ERR_USER_NOT_FOUND,
        404,
      );
    }

    const passwordMatches = user.password.startsWith("$2")
      ? await comparePassword(oldPassword, user.password)
      : toMd5(oldPassword) === user.password.toLowerCase();

    if (!passwordMatches) {
      return sendError(
        res,
        "Current password is incorrect.",
        ERROR_CODES.ERR_INVALID_CREDENTIALS,
        401,
      );
    }

    const isSamePassword = user.password.startsWith("$2")
      ? await comparePassword(newPassword, user.password)
      : toMd5(newPassword) === user.password.toLowerCase();
    if (isSamePassword) {
      return sendError(
        res,
        "New password cannot be the same as old password.",
        ERROR_CODES.ERR_VALIDATION_ERROR,
        400,
      );
    }

    const newHash = await hashPassword(newPassword);
    await userModel.updateUserPassword(req.user.userId, newHash);

    return sendSuccess(res, null, "Password changed successfully", 200);
  } catch (error) {
    return next(error);
  }
}

async function getRoles(req, res, next) {
  try {
    const roles = await userModel.getRoles();
    const transformed = roles.map((row) => ({
      id: row.id,
      role: row.role,
      description: `${row.role} role`,
      permissions: [],
    }));

    return sendSuccess(res, transformed, "Roles retrieved", 200);
  } catch (error) {
    return next(error);
  }
}

async function getLoginHistory(req, res, next) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const offset = Math.max(Number(req.query.offset || 0), 0);

    const { rows, total } = await userModel.getLoginHistoryByUserId(
      req.user.userId,
      limit,
      offset,
    );

    return res.status(200).json({
      success: true,
      message: "Login history retrieved",
      data: rows,
      total,
      error: null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getRoles,
  getLoginHistory,
};

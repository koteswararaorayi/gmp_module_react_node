const express = require("express");
const { checkDatabaseConnection } = require("../config/database");
const env = require("../config/env");
const { sendSuccess, sendError } = require("../utils/responseHandler");

const router = express.Router();

router.get("/health", async (req, res, next) => {
  try {
    const dbStatus = await checkDatabaseConnection();

    if (!dbStatus.connected) {
      return sendError(
        res,
        "Database is unavailable.",
        "ERR_DATABASE_UNAVAILABLE",
        503,
        dbStatus,
      );
    }

    return sendSuccess(
      res,
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        db: "connected",
      },
      "Success",
    );
  } catch (error) {
    return next(error);
  }
});

router.get("/version", (req, res) => {
  return sendSuccess(
    res,
    {
      version: "1.0.0",
      environment: env.nodeEnv,
    },
    "Success",
  );
});

module.exports = router;

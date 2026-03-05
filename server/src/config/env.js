const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: process.env.ENV_FILE
    ? path.resolve(process.cwd(), process.env.ENV_FILE)
    : path.resolve(process.cwd(), ".env"),
});

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  db: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "infinextg_ricon",
    port: Number(process.env.DB_PORT || 3306),
    connectionLimit: 10,
  },
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      "your_super_secret_key_change_in_production_min_32_chars",
    expiry: process.env.JWT_EXPIRY || "24h",
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      "your_refresh_secret_key_change_in_production",
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
  },
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  maxFileSize: Number(process.env.MAX_FILE_SIZE || 10485760),
  uploadDir: process.env.UPLOAD_DIR || "../uploads",
  logLevel: process.env.LOG_LEVEL || "dev",
};

module.exports = env;

const cors = require("cors");
const env = require("../config/env");

const corsMiddleware = cors({
  origin: env.corsOrigin,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
});

module.exports = corsMiddleware;

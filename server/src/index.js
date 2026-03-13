require("./config/env");

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const env = require("./config/env");
const corsMiddleware = require("./middleware/cors");
const errorHandler = require("./middleware/errorHandler");
const healthRoutes = require("./routes/health");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const { sendError } = require("./utils/responseHandler");

const app = express();

app.use(corsMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve(__dirname, env.uploadDir)));

app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) =>
  sendError(res, "Route not found.", "ERR_NOT_FOUND", 404),
);

app.use(errorHandler);

function startServer() {
  return app.listen(env.port, () => {
    console.log("+----------------------------------------+");
    console.log("|     GMP_LIVE Backend Server Started    |");
    console.log(
      `|  Running on http://localhost:${env.port}`.padEnd(41, " ") + "|",
    );
    console.log(`|  Environment: ${env.nodeEnv}`.padEnd(41, " ") + "|");
    console.log("+----------------------------------------+");
  });
}

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer,
};

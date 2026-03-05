const mysql = require("mysql2/promise");
const env = require("./env");

const pool = mysql.createPool({
  host: env.db.host,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  port: env.db.port,
  waitForConnections: true,
  connectionLimit: env.db.connectionLimit,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

async function checkDatabaseConnection() {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.ping();

    console.log(
      `[database] connected to ${env.db.host}:${env.db.port}/${env.db.name}`,
    );

    return {
      connected: true,
      host: env.db.host,
      port: env.db.port,
      database: env.db.name,
    };
  } catch (error) {
    console.error("[database] connection failed", {
      code: error.code,
      message: error.message,
    });

    return {
      connected: false,
      code: error.code || "DB_CONNECTION_ERROR",
      message: error.message,
    };
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

checkDatabaseConnection();

module.exports = {
  pool,
  checkDatabaseConnection,
};

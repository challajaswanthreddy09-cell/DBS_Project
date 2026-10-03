/**
 * DATABASE CONNECTION POOL CONFIGURATION (db.js)
 * Connects Express to MySQL database 'library_rfid' using mysql2/promise.
 * Provides resilient query execution and connection pooling.
 */

const mysql = require("mysql2/promise");
require("dotenv").config();

// Create connection pool with environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "library_rfid",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection on initialization
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log(" [MySQL] Successfully connected to database: " + (process.env.DB_NAME || "library_rfid"));
    connection.release();
  } catch (err) {
    console.warn(" [MySQL Warning] Could not connect to MySQL Server:", err.message);
    console.warn(" Please verify MySQL service is running and credentials in backend/.env are correct.");
  }
})();

module.exports = pool;

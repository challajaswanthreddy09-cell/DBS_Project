/**
 * MAIN EXPRESS SERVER ENTRYPOINT (server.js)
 * Assembles Express application, enables CORS, parses JSON bodies,
 * mounts modular API routes, and starts HTTP server listener.
 */

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware: Enable Cross-Origin Resource Sharing for Vite React frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  })
);

// Middleware: Parse incoming JSON payloads
app.use(express.json());

// Base Health Check
app.get("/", (req, res) => {
  res.json({
    project: "Library Management System with RFID Integration",
    role: "Backend REST API",
    status: "Operational",
    version: "1.0.0",
    simulationMode: "RFID Software Simulation Active"
  });
});

// Mounted Circulation API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/books", require("./routes/books"));
app.use("/api/members", require("./routes/members"));
app.use("/api/rfid", require("./routes/rfid"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/fines", require("./routes/fines"));
app.use("/api/inventory", require("./routes/inventory"));
app.use("/api/recommendations", require("./routes/recommendations"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/student", require("./routes/student"));

// 404 Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error("Internal Server Error:", error);
  res.status(error.status || 500).json({
    message: error.message || "An unexpected error occurred on the server.",
    error: process.env.NODE_ENV === "development" ? error : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("==================================================");
  console.log(` Library Management API Server running on port ${PORT}`);
  console.log(` Base URL: http://localhost:${PORT}`);
  console.log(` API Healthcheck: http://localhost:${PORT}/`);
  console.log("==================================================");
});

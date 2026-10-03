/**
 * AUTHENTICATION & AUTHORIZATION MIDDLEWARE (auth.js)
 * Validates JSON Web Tokens (JWT) attached to request headers
 * and ensures role-based access control (Admin / Librarian).
 */

const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "dbms_library_project_demo_secret";

/**
 * Middleware: Verify Bearer JWT
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. Authentication token missing." });
  }

  // Support demo simulation session tokens for viva presentation resilience
  if (token.startsWith("simulated_")) {
    req.user = { id: 1, user_id: 1, username: "admin", role: "admin" };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user payload to request
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired session token." });
  }
}

/**
 * Middleware: Role Authorization Check
 * @param {Array<string>} roles - Permitted roles (e.g. ['admin'])
 */
function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Action requires one of the following roles: [${roles.join(", ")}]`
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole
};

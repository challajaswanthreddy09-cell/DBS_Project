/**
 * AUTHENTICATION ROUTES (routes/auth.js)
 * Endpoints for system login and credential verification using bcrypt and JWT.
 * Features database-driven authentication with resilient fallback.
 */

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "dbms_library_project_demo_secret";

/**
 * POST /api/auth/login
 * Verifies username and password against the 'users' table in MySQL.
 * Generates a signed JWT for authenticated sessions.
 */
router.post("/login", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Please provide both username and password." });
  }

  const cleanUser = username.trim();
  const cleanPass = password.trim();

  try {
    // 1. Query user from MySQL database
    const [rows] = await pool.query(
      `SELECT 
        id, 
        id AS user_id, 
        username, 
        password, 
        role, 
        member_id, 
        COALESCE(full_name, username) AS full_name, 
        COALESCE(email, CONCAT(username, '@collegelibrary.edu')) AS email 
       FROM users WHERE username = ?`,
      [cleanUser]
    );

    let user = rows[0];

    if (!user) {
      // Check demo credentials if not in DB table
      if (
        (cleanUser === "admin" && cleanPass === "admin123") ||
        (cleanUser === "librarian" && cleanPass === "librarian123") ||
        (cleanUser === "student" && cleanPass === "student123")
      ) {
        user = {
          id: cleanUser === "admin" ? 1 : cleanUser === "librarian" ? 2 : 5,
          user_id: cleanUser === "admin" ? 1 : cleanUser === "librarian" ? 2 : 5,
          username: cleanUser,
          role: role || cleanUser,
          member_id: cleanUser === "student" ? 1 : null,
          full_name:
            cleanUser === "admin"
              ? "Chief Administrator"
              : cleanUser === "librarian"
              ? "Assistant Librarian"
              : "Aarav Sharma",
          email: cleanUser === "student" ? "aarav.sharma@example.com" : `${cleanUser}@collegelibrary.edu`
        };

        const token = jwt.sign(
          {
            id: user.id,
            user_id: user.user_id,
            username: user.username,
            role: user.role,
            member_id: user.member_id
          },
          JWT_SECRET,
          { expiresIn: "12h" }
        );

        return res.json({
          message: "Login successful (Demo Mode)",
          token,
          user: {
            id: user.id,
            user_id: user.user_id,
            username: user.username,
            role: user.role,
            member_id: user.member_id,
            full_name: user.full_name,
            email: user.email
          }
        });
      }

      return res.status(401).json({ message: "Invalid username or user does not exist." });
    }

    // 2. Validate password using bcrypt comparison
    const passwordMatches = await bcrypt.compare(cleanPass, user.password);
    if (!passwordMatches && cleanPass !== user.password) {
      return res.status(401).json({ message: "Invalid password credentials." });
    }

    // 3. Check role consistency if provided
    if (role && user.role !== role) {
      return res.status(403).json({ message: `Access denied: Account is not registered as ${role}.` });
    }

    // 4. Generate JSON Web Token with member_id
    const token = jwt.sign(
      {
        id: user.id,
        user_id: user.user_id,
        username: user.username,
        role: user.role,
        member_id: user.member_id
      },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        user_id: user.user_id,
        username: user.username,
        role: user.role,
        member_id: user.member_id,
        full_name: user.full_name,
        email: user.email
      }
    });
  } catch (err) {
    console.warn("MySQL login query fallback:", err.message);

    // Resilient fallback for viva/demo if MySQL password is not yet configured
    if (
      (cleanUser === "admin" && cleanPass === "admin123") ||
      (cleanUser === "librarian" && cleanPass === "librarian123") ||
      (cleanUser === "student" && cleanPass === "student123")
    ) {
      const fallbackUser = {
        id: cleanUser === "admin" ? 1 : cleanUser === "librarian" ? 2 : 5,
        user_id: cleanUser === "admin" ? 1 : cleanUser === "librarian" ? 2 : 5,
        username: cleanUser,
        role: role || cleanUser,
        member_id: cleanUser === "student" ? 1 : null,
        full_name:
          cleanUser === "admin"
            ? "Chief Administrator"
            : cleanUser === "librarian"
            ? "Assistant Librarian"
            : "Aarav Sharma",
        email: cleanUser === "student" ? "aarav.sharma@example.com" : `${cleanUser}@collegelibrary.edu`
      };

      const token = jwt.sign(
        {
          id: fallbackUser.id,
          user_id: fallbackUser.user_id,
          username: fallbackUser.username,
          role: fallbackUser.role,
          member_id: fallbackUser.member_id
        },
        JWT_SECRET,
        { expiresIn: "12h" }
      );

      return res.json({
        message: "Login successful (Database Offline Fallback)",
        token,
        user: fallbackUser
      });
    }

    return res.status(401).json({
      message: "Authentication failed. Use demo accounts: admin / admin123, librarian / librarian123, or student / student123.",
      error: err.message
    });
  }
});

module.exports = router;

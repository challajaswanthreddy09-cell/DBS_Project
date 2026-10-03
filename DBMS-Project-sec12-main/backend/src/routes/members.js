/**
 * MEMBER MANAGEMENT ROUTES (routes/members.js)
 * Implements CRUD operations for student and faculty patrons.
 */

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../config/db");
const { authenticateToken, requireRole } = require("../middleware/auth");

// Protect all member management routes for Admin and Librarian only
router.use(authenticateToken);
router.use(requireRole(["admin", "librarian"]));


/**
 * GET /api/members
 */
router.get("/", async (req, res) => {
  const { search } = req.query;

  try {
    let sql = `
      SELECT 
        m.member_id,
        m.name,
        m.email,
        m.phone,
        m.status,
        COUNT(CASE WHEN t.status = 'Issued' THEN 1 END) AS books_issued
      FROM members m
      LEFT JOIN transactions t ON m.member_id = t.member_id
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim() !== "") {
      sql += ` AND (m.name LIKE ? OR m.email LIKE ? OR m.phone LIKE ?)`;
      const q = `%${search.trim()}%`;
      params.push(q, q, q);
    }

    sql += ` GROUP BY m.member_id ORDER BY m.member_id DESC`;

    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error("GET /api/members error:", err);
    return res.status(500).json({
      message: "Failed to retrieve members from database",
      error: err.message
    });
  }
});

/**
 * GET /api/members/:id
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT m.member_id, m.name, m.email, m.phone, m.status,
              COUNT(CASE WHEN t.status = 'Issued' THEN 1 END) AS books_issued
       FROM members m
       LEFT JOIN transactions t ON m.member_id = t.member_id
       WHERE m.member_id = ?
       GROUP BY m.member_id`,
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ message: `Member #${id} not found.` });
    return res.json(rows[0]);
  } catch (err) {
    console.error("GET /api/members/:id error:", err);
    return res.status(500).json({ message: "Failed to retrieve member", error: err.message });
  }
});

/**
 * POST /api/members
 */
router.post("/", async (req, res) => {
  const { name, email, phone, status = "Active", username, password } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ message: "Please provide member name, email, and phone." });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO members (name, email, phone, status) VALUES (?, ?, ?, ?)",
      [name.trim(), email.trim(), phone.trim(), status]
    );

    const newMemberId = result.insertId;

    // Optional student account creation
    let studentUserCreated = false;
    if (username && password && username.trim() && password.trim()) {
      const hash = await bcrypt.hash(password.trim(), 10);
      await pool.query(
        `INSERT INTO users (username, password, role, member_id, full_name, email)
         VALUES (?, ?, 'student', ?, ?, ?)
         ON DUPLICATE KEY UPDATE password = VALUES(password), role = 'student', member_id = VALUES(member_id), full_name = VALUES(full_name), email = VALUES(email)`,
        [username.trim(), hash, newMemberId, name.trim(), email.trim()]
      );
      studentUserCreated = true;
    }

    return res.status(201).json({
      message: "Member registered successfully." + (studentUserCreated ? " Student login account created." : ""),
      member_id: newMemberId,
      student_account_created: studentUserCreated
    });
  } catch (err) {
    console.error("POST /api/members error:", err);
    return res.status(500).json({ message: "Failed to register member in database", error: err.message });
  }
});

/**
 * PUT /api/members/:id
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, status } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE members SET name = ?, email = ?, phone = ?, status = ? WHERE member_id = ?",
      [name.trim(), email.trim(), phone.trim(), status || "Active", id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: `Member #${id} not found.` });
    return res.json({ message: "Member updated successfully." });
  } catch (err) {
    console.error("PUT /api/members/:id error:", err);
    return res.status(500).json({ message: "Failed to update member in database", error: err.message });
  }
});

/**
 * DELETE /api/members/:id
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM members WHERE member_id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: `Member #${id} not found.` });
    return res.json({ message: "Member deleted successfully." });
  } catch (err) {
    console.error("DELETE /api/members/:id error:", err);
    return res.status(500).json({ message: "Failed to delete member from database", error: err.message });
  }
});

module.exports = router;

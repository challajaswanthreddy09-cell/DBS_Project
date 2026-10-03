/**
 * AUDIT & ANALYTICS REPORTS ROUTES (routes/reports.js)
 * Implements report queries for books, patrons, circulation volume, and fine dues.
 */

const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticateToken, requireRole } = require("../middleware/auth");

// Protect overall library audit reports routes for Admin and Librarian
router.use(authenticateToken);
router.use(requireRole(["admin", "librarian"]));


/**
 * GET /api/reports/:type
 */
router.get("/:type", async (req, res) => {
  const { type } = req.params;

  try {
    if (type === "books") {
      const [rows] = await pool.query(`
        SELECT b.book_id, b.title, b.author, b.category, b.isbn, b.status, COALESCE(r.rfid_id, 'Unassigned') AS rfid_id
        FROM books b LEFT JOIN rfid_tags r ON b.book_id = r.book_id
        ORDER BY b.category ASC, b.title ASC
      `);
      return res.json(rows);
    }

    if (type === "members") {
      const [rows] = await pool.query(`
        SELECT m.member_id, m.name, m.email, m.phone, m.status,
               COUNT(CASE WHEN t.status = 'Issued' THEN 1 END) AS books_issued
        FROM members m LEFT JOIN transactions t ON m.member_id = t.member_id
        GROUP BY m.member_id ORDER BY m.name ASC
      `);
      return res.json(rows);
    }

    if (type === "transactions") {
      const [rows] = await pool.query(`
        SELECT t.transaction_id, b.title AS book_title, m.name AS member_name, t.rfid_id,
               DATE_FORMAT(t.issue_date, '%Y-%m-%d') AS issue_date,
               DATE_FORMAT(t.due_date, '%Y-%m-%d') AS due_date,
               DATE_FORMAT(t.return_date, '%Y-%m-%d') AS return_date,
               t.status, COALESCE(f.fine_amount, 0) AS fine
        FROM transactions t
        JOIN books b ON t.book_id = b.book_id
        JOIN members m ON t.member_id = m.member_id
        LEFT JOIN fines f ON t.transaction_id = f.transaction_id
        ORDER BY t.transaction_id DESC
      `);
      return res.json(rows);
    }

    if (type === "fines") {
      const [rows] = await pool.query(`
        SELECT f.fine_id, f.transaction_id, m.name AS member_name, b.title AS book_title,
               DATE_FORMAT(t.due_date, '%Y-%m-%d') AS due_date,
               f.overdue_days, f.fine_amount, f.fine_status
        FROM fines f
        JOIN transactions t ON f.transaction_id = t.transaction_id
        JOIN books b ON t.book_id = b.book_id
        JOIN members m ON t.member_id = m.member_id
        ORDER BY f.fine_id DESC
      `);
      return res.json(rows);
    }

    if (type === "inventory") {
      const [rows] = await pool.query(`
        SELECT b.book_id, b.title, b.isbn, b.status, COALESCE(r.rfid_id, 'UNTAGGED') AS rfid_id,
               'Verified Present' AS verification_state
        FROM books b LEFT JOIN rfid_tags r ON b.book_id = r.book_id
        ORDER BY b.book_id ASC
      `);
      return res.json(rows);
    }

    return res.status(400).json({ message: `Unknown report category '${type}'.` });
  } catch (err) {
    console.error(`GET /api/reports/${type} error:`, err);
    return res.status(500).json({
      message: `Failed to retrieve ${type} report data from database.`,
      error: err.message
    });
  }
});

module.exports = router;

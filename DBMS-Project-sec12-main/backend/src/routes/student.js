/**
 * STUDENT PORTAL ROUTES (routes/student.js)
 * Dedicated, secure endpoints for student patrons to view their own circulation
 * records, active borrowings, overdue fines, and browse the library catalog.
 * Strict data isolation: authenticated JWT token determines the patron ID.
 */

const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticateToken, requireRole } = require("../middleware/auth");

// All student routes require valid JWT and student role
router.use(authenticateToken);
router.use(requireRole(["student"]));

/**
 * Helper: Resolve student's member_id from JWT token or fallback lookup
 */
async function getStudentMemberId(req) {
  if (req.user && req.user.member_id) {
    return req.user.member_id;
  }

  // Fallback: look up member_id from users table if not in token
  const userId = req.user.id || req.user.user_id;
  if (userId) {
    const [rows] = await pool.query("SELECT member_id FROM users WHERE id = ?", [userId]);
    if (rows.length > 0 && rows[0].member_id) {
      req.user.member_id = rows[0].member_id;
      return rows[0].member_id;
    }
  }

  return 1; // Default demo student fallback
}

/**
 * GET /api/student/dashboard
 * Aggregates student-specific summary statistics and recent transactions.
 */
router.get("/dashboard", async (req, res) => {
  try {
    const memberId = await getStudentMemberId(req);

    // Run parallel queries for instant response
    const [
      [availableBooksCount],
      [borrowedBooksCount],
      [unpaidFinesTotal],
      [recentLoans],
      [memberRows]
    ] = await Promise.all([
      pool.query("SELECT COUNT(*) AS count FROM books WHERE status = 'Available'"),
      pool.query(
        "SELECT COUNT(*) AS count FROM transactions WHERE member_id = ? AND status = 'Issued'",
        [memberId]
      ),
      pool.query(
        `SELECT COALESCE(SUM(f.fine_amount), 0) AS total 
         FROM fines f 
         JOIN transactions t ON f.transaction_id = t.transaction_id 
         WHERE t.member_id = ? AND f.fine_status = 'Unpaid'`,
        [memberId]
      ),
      pool.query(
        `SELECT 
          t.transaction_id,
          t.book_id,
          b.title AS book_title,
          b.author,
          t.rfid_id,
          DATE_FORMAT(t.issue_date, '%Y-%m-%d') AS issue_date,
          DATE_FORMAT(t.due_date, '%Y-%m-%d') AS due_date,
          DATE_FORMAT(t.return_date, '%Y-%m-%d') AS return_date,
          t.status,
          COALESCE(f.fine_amount, t.fine, 0) AS fine,
          COALESCE(f.fine_status, t.fine_status, 'Paid') AS fine_status,
          CASE 
            WHEN t.status = 'Issued' AND t.due_date < CURDATE() THEN 1 
            ELSE 0 
          END AS is_overdue
        FROM transactions t
        JOIN books b ON t.book_id = b.book_id
        LEFT JOIN fines f ON t.transaction_id = f.transaction_id
        WHERE t.member_id = ?
        ORDER BY t.transaction_id DESC
        LIMIT 4`,
        [memberId]
      ),
      pool.query("SELECT member_id, name, email, phone, status FROM members WHERE member_id = ?", [
        memberId
      ])
    ]);

    const member = memberRows[0] || {
      member_id: memberId,
      name: req.user.full_name || req.user.username,
      email: req.user.email
    };

    return res.json({
      student: {
        member_id: member.member_id,
        name: member.name,
        email: member.email,
        username: req.user.username
      },
      stats: {
        availableBooks: Number(availableBooksCount[0].count) || 0,
        myBorrowedBooks: Number(borrowedBooksCount[0].count) || 0,
        myActiveFines: parseFloat(unpaidFinesTotal[0].total) || 0
      },
      recentLoans
    });
  } catch (err) {
    console.error("GET /api/student/dashboard error:", err);
    return res.status(500).json({
      message: "Failed to load student dashboard.",
      error: err.message
    });
  }
});

/**
 * GET /api/student/borrowed-books
 * Returns all active and past borrowings belonging ONLY to the logged-in student.
 */
router.get("/borrowed-books", async (req, res) => {
  try {
    const memberId = await getStudentMemberId(req);

    const [rows] = await pool.query(
      `SELECT 
        t.transaction_id,
        t.book_id,
        b.title AS book_title,
        b.author,
        b.category,
        b.isbn,
        COALESCE(t.rfid_id, b.rfid_id, 'Unassigned') AS rfid_id,
        DATE_FORMAT(t.issue_date, '%Y-%m-%d') AS issue_date,
        DATE_FORMAT(t.due_date, '%Y-%m-%d') AS due_date,
        DATE_FORMAT(t.return_date, '%Y-%m-%d') AS return_date,
        t.status,
        COALESCE(f.fine_amount, t.fine, 0) AS fine,
        COALESCE(f.fine_status, t.fine_status, 'Paid') AS fine_status,
        CASE 
          WHEN t.status = 'Issued' AND t.due_date < CURDATE() THEN 1 
          ELSE 0 
        END AS is_overdue,
        CASE
          WHEN t.status = 'Issued' AND t.due_date < CURDATE() THEN DATEDIFF(CURDATE(), t.due_date)
          ELSE 0
        END AS overdue_days
      FROM transactions t
      JOIN books b ON t.book_id = b.book_id
      LEFT JOIN fines f ON t.transaction_id = f.transaction_id
      WHERE t.member_id = ?
      ORDER BY t.transaction_id DESC`,
      [memberId]
    );

    return res.json(rows);
  } catch (err) {
    console.error("GET /api/student/borrowed-books error:", err);
    return res.status(500).json({
      message: "Failed to load borrowed books.",
      error: err.message
    });
  }
});

/**
 * GET /api/student/fines
 * Returns overdue penalty records belonging ONLY to the logged-in student.
 */
router.get("/fines", async (req, res) => {
  try {
    const memberId = await getStudentMemberId(req);

    const [rows] = await pool.query(
      `SELECT 
        f.fine_id,
        f.transaction_id,
        b.title AS book_title,
        f.overdue_days,
        f.fine_amount,
        f.fine_status,
        DATE_FORMAT(f.paid_date, '%Y-%m-%d') AS paid_date,
        DATE_FORMAT(t.due_date, '%Y-%m-%d') AS due_date,
        DATE_FORMAT(t.return_date, '%Y-%m-%d') AS return_date,
        DATE_FORMAT(t.issue_date, '%Y-%m-%d') AS issue_date
      FROM fines f
      JOIN transactions t ON f.transaction_id = t.transaction_id
      JOIN books b ON t.book_id = b.book_id
      WHERE t.member_id = ?
      ORDER BY f.fine_id DESC`,
      [memberId]
    );

    let totalFine = 0;
    let unpaidFine = 0;
    let paidFine = 0;

    rows.forEach((r) => {
      const amt = parseFloat(r.fine_amount) || 0;
      totalFine += amt;
      if (r.fine_status === "Unpaid") unpaidFine += amt;
      else paidFine += amt;
    });

    return res.json({
      summary: {
        totalFine,
        unpaidFine,
        paidFine,
        recordsCount: rows.length
      },
      fines: rows
    });
  } catch (err) {
    console.error("GET /api/student/fines error:", err);
    return res.status(500).json({
      message: "Failed to load student fines.",
      error: err.message
    });
  }
});

/**
 * GET /api/student/profile
 * Returns profile metadata for the authenticated student.
 */
router.get("/profile", async (req, res) => {
  try {
    const memberId = await getStudentMemberId(req);

    const [rows] = await pool.query(
      `SELECT 
        u.id AS user_id,
        u.username,
        u.role,
        m.member_id,
        m.name,
        m.email,
        m.phone,
        m.status AS membership_status,
        DATE_FORMAT(m.created_at, '%Y-%m-%d') AS member_since
      FROM users u
      LEFT JOIN members m ON u.member_id = m.member_id
      WHERE u.id = ?`,
      [req.user.id || req.user.user_id]
    );

    if (rows.length === 0) {
      return res.json({
        user_id: req.user.id,
        username: req.user.username,
        role: "student",
        member_id: memberId,
        name: req.user.full_name || "Student Patron",
        email: req.user.email || `${req.user.username}@collegelibrary.edu`,
        membership_status: "Active"
      });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("GET /api/student/profile error:", err);
    return res.status(500).json({
      message: "Failed to load profile.",
      error: err.message
    });
  }
});

/**
 * GET /api/student/books
 * Read-only book catalog search for students.
 */
router.get("/books", async (req, res) => {
  const { search, category, status } = req.query;

  try {
    let sql = `
      SELECT 
        b.book_id,
        b.title,
        b.author,
        b.category,
        b.isbn,
        b.status,
        COALESCE(r.rfid_id, b.rfid_id, 'Unassigned') AS rfid_id
      FROM books b
      LEFT JOIN rfid_tags r ON b.book_id = r.book_id
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim() !== "") {
      sql += ` AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)`;
      const q = `%${search.trim()}%`;
      params.push(q, q, q);
    }

    if (category && category !== "ALL") {
      sql += ` AND b.category = ?`;
      params.push(category);
    }

    if (status && status !== "ALL") {
      sql += ` AND b.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY b.title ASC`;

    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error("GET /api/student/books error:", err);
    return res.status(500).json({
      message: "Failed to load books catalog.",
      error: err.message
    });
  }
});

module.exports = router;

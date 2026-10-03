/**
 * FINE & DUES MANAGEMENT ROUTES (routes/fines.js)
 * Implements overdue dues tracking, aggregate balances, and payment receipt clearance.
 */

const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticateToken, requireRole } = require("../middleware/auth");

// Protect overall library fines routes for Admin and Librarian
router.use(authenticateToken);
router.use(requireRole(["admin", "librarian"]));


/**
 * GET /api/fines
 */
router.get("/", async (req, res) => {
  const { status } = req.query;

  try {
    let sql = `
      SELECT 
        f.fine_id,
        f.transaction_id,
        f.overdue_days,
        f.fine_amount,
        f.fine_status,
        DATE_FORMAT(f.paid_date, '%Y-%m-%d') AS paid_date,
        b.title AS book_title,
        m.name AS member_name,
        DATE_FORMAT(t.due_date, '%Y-%m-%d') AS due_date,
        DATE_FORMAT(t.return_date, '%Y-%m-%d') AS return_date
      FROM fines f
      JOIN transactions t ON f.transaction_id = t.transaction_id
      JOIN books b ON t.book_id = b.book_id
      JOIN members m ON t.member_id = m.member_id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== "ALL") {
      sql += " AND f.fine_status = ?";
      params.push(status);
    }

    sql += " ORDER BY f.fine_id DESC";

    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error("GET /api/fines error:", err);
    return res.status(500).json({
      message: "Failed to retrieve fines from database",
      error: err.message
    });
  }
});

/**
 * PUT /api/fines/:id/pay
 */
router.put("/:id/pay", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "UPDATE fines SET fine_status = 'Paid', paid_date = CURDATE() WHERE fine_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: `Fine #${id} not found.` });
    }

    return res.json({ message: `Fine #${id} successfully marked as Paid.` });
  } catch (err) {
    console.error("PUT /api/fines/:id/pay error:", err);
    return res.status(500).json({
      message: "Failed to update fine payment in database",
      error: err.message
    });
  }
});

module.exports = router;

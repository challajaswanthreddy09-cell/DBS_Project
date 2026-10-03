/**
 * DASHBOARD ANALYTICS ROUTE (routes/dashboard.js)
 * Computes high-level Key Performance Indicators (KPIs) and recent circulation history.
 */

const express = require("express");
const router = express.Router();
const pool = require("../config/db");

/**
 * GET /api/dashboard/stats
 * Aggregates summary counters and latest circulation transactions for the dashboard.
 */
router.get("/stats", async (req, res) => {
  try {
    // Run all 5 analytics queries in parallel for high-speed response
    const [
      [bookCounts],
      [memberCounts],
      [overdueCounts],
      [fineTotals],
      [recentTransactions]
    ] = await Promise.all([
      pool.query(`
        SELECT 
          COUNT(*) AS totalBooks,
          COUNT(CASE WHEN status = 'Available' THEN 1 END) AS availableBooks,
          COUNT(CASE WHEN status = 'Issued' THEN 1 END) AS issuedBooks
        FROM books
      `),
      pool.query("SELECT COUNT(*) AS totalMembers FROM members"),
      pool.query(`
        SELECT COUNT(*) AS overdueBooks
        FROM transactions
        WHERE status = 'Issued' AND due_date < CURDATE()
      `),
      pool.query(`
        SELECT 
          COALESCE(SUM(fine_amount), 0) AS totalFine,
          COALESCE(SUM(CASE WHEN fine_status = 'Unpaid' THEN fine_amount ELSE 0 END), 0) AS unpaidFine
        FROM fines
      `),
      pool.query(`
        SELECT 
          t.transaction_id,
          t.book_id,
          b.title,
          t.member_id,
          m.name AS member_name,
          COALESCE(t.rfid_id, b.rfid_id, 'Unassigned') AS rfid_id,
          DATE_FORMAT(t.issue_date, '%Y-%m-%d') AS issue_date,
          DATE_FORMAT(t.due_date, '%Y-%m-%d') AS due_date,
          DATE_FORMAT(t.return_date, '%Y-%m-%d') AS return_date,
          t.status,
          COALESCE(f.fine_amount, 0) AS fine,
          COALESCE(f.fine_status, 'Paid') AS fine_status
        FROM transactions t
        JOIN books b ON t.book_id = b.book_id
        JOIN members m ON t.member_id = m.member_id
        LEFT JOIN fines f ON t.transaction_id = f.transaction_id
        ORDER BY t.transaction_id DESC
        LIMIT 6
      `)
    ]);

    const stats = {
      totalBooks: Number(bookCounts[0].totalBooks) || 0,
      availableBooks: Number(bookCounts[0].availableBooks) || 0,
      issuedBooks: Number(bookCounts[0].issuedBooks) || 0,
      members: Number(memberCounts[0].totalMembers) || 0,
      overdueBooks: Number(overdueCounts[0].overdueBooks) || 0,
      totalFine: parseFloat(fineTotals[0].totalFine) || 0,
      unpaidFine: parseFloat(fineTotals[0].unpaidFine) || 0,
      recentTransactions
    };

    return res.json(stats);
  } catch (err) {
    console.error("GET /api/dashboard/stats error:", err);
    return res.status(500).json({
      message: "Failed to load dashboard statistics from MySQL database.",
      error: err.message
    });
  }
});

module.exports = router;

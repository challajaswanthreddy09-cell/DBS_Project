/**
 * INVENTORY & STOCK AUDITING ROUTES (routes/inventory.js)
 * Implements catalog reconciliation against active RFID tags to identify
 * verified physical stock, current circulating items, and tag discrepancies.
 */

const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticateToken, requireRole } = require("../middleware/auth");

// Protect inventory stock verification for Admin and Librarian
router.use(authenticateToken);
router.use(requireRole(["admin", "librarian"]));


/**
 * GET /api/inventory
 */
router.get("/", async (req, res) => {
  try {
    const [[counts], [rfidCount], [books]] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) AS total_books,
          COUNT(CASE WHEN status = 'Available' THEN 1 END) AS available_books,
          COUNT(CASE WHEN status = 'Issued' THEN 1 END) AS issued_books
        FROM books
      `),
      pool.query("SELECT COUNT(*) AS rfid_tagged FROM rfid_tags WHERE status = 'Active'"),
      pool.query(`
        SELECT 
          b.book_id,
          b.title,
          b.author,
          b.isbn,
          b.status,
          COALESCE(r.rfid_id, b.rfid_id, 'UNTAGGED') AS rfid_id,
          COALESCE(r.status, 'Active') AS rfid_status,
          CASE 
            WHEN COALESCE(r.rfid_id, b.rfid_id) IS NOT NULL THEN 'Verified Present'
            ELSE 'Tag Discrepancy'
          END AS verification_result
        FROM books b
        LEFT JOIN rfid_tags r ON b.book_id = r.book_id
        ORDER BY b.book_id ASC
      `)
    ]);

    const total = counts[0].total_books || 0;
    const available = counts[0].available_books || 0;
    const issued = counts[0].issued_books || 0;
    const tagged = rfidCount[0].rfid_tagged || 0;
    const missing = Math.max(0, total - tagged);

    return res.json({
      summary: [
        { label: "Total Books", count: total },
        { label: "Available Books", count: available },
        { label: "Issued Books", count: issued },
        { label: "RFID Tagged Books", count: tagged },
        { label: "Missing / Untagged", count: missing }
      ],
      metrics: { total, available, issued, tagged, missing },
      books
    });
  } catch (err) {
    console.error("GET /api/inventory error:", err);
    return res.status(500).json({
      message: "Failed to retrieve inventory and stock verification data from database.",
      error: err.message
    });
  }
});

module.exports = router;

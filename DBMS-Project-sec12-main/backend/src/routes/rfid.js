/**
 * RFID SOFTWARE SIMULATION ROUTES (routes/rfid.js)
 * Implements software-based RFID tag scanning and detection.
 * Translates digital RFID tag codes into physical book metadata in MySQL.
 */

const express = require("express");
const router = express.Router();
const pool = require("../config/db");


/**
 * GET /api/rfid/tags
 * Returns all active RFID simulation tags registered in the system.
 */
router.get("/tags", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        r.rfid_id,
        r.tag_code,
        r.status AS tag_status,
        b.book_id,
        b.title,
        b.status AS book_status
      FROM rfid_tags r
      JOIN books b ON r.book_id = b.book_id
      ORDER BY r.rfid_id ASC
    `);

    return res.json(rows);
  } catch (err) {
    console.error("GET /api/rfid/tags error:", err);
    return res.status(500).json({ message: "Failed to retrieve RFID tags from database", error: err.message });
  }
});

/**
 * POST /api/rfid/scan
 * Primary software simulation endpoint.
 * Input: { rfid_id: "RFID001" }
 * Output: Full book metadata and current circulation availability.
 */
router.post("/scan", async (req, res) => {
  const { rfid_id } = req.body;

  if (!rfid_id || rfid_id.trim() === "") {
    return res.status(400).json({ message: "Please provide an RFID tag code to scan." });
  }

  const queryTag = rfid_id.trim().toUpperCase();

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        b.book_id,
        b.title,
        b.author,
        b.category,
        b.isbn,
        b.status,
        COALESCE(r.rfid_id, b.rfid_id) AS rfid_id,
        COALESCE(r.tag_code, b.tag_code) AS tag_code,
        DATE_FORMAT(t.issue_date, '%Y-%m-%d') AS issue_date,
        DATE_FORMAT(t.due_date, '%Y-%m-%d') AS due_date,
        m.name AS borrower_name,
        m.member_id AS borrower_id
      FROM books b
      LEFT JOIN rfid_tags r ON b.book_id = r.book_id
      LEFT JOIN transactions t ON b.book_id = t.book_id AND t.status = 'Issued'
      LEFT JOIN members m ON t.member_id = m.member_id
      WHERE UPPER(COALESCE(r.rfid_id, b.rfid_id)) = ? OR UPPER(COALESCE(r.tag_code, b.tag_code)) = ?
    `,
      [queryTag, queryTag]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: `RFID tag not found. No registered book is linked with tag "${queryTag}".`
      });
    }

    const book = rows[0];
    return res.json({
      message: "Book identified successfully.",
      book
    });
  } catch (err) {
    console.error("POST /api/rfid/scan error:", err);
    return res.status(500).json({ message: "Failed to scan RFID tag from database", error: err.message });
  }
});

/**
 * GET /api/rfid/:tagCode
 * Alternate direct lookup endpoint by tag code path parameter.
 */
router.get("/:tagCode", async (req, res) => {
  const queryTag = req.params.tagCode.trim().toUpperCase();

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        b.book_id,
        b.title,
        b.author,
        b.category,
        b.isbn,
        b.status,
        COALESCE(r.rfid_id, b.rfid_id) AS rfid_id,
        COALESCE(r.tag_code, b.tag_code) AS tag_code,
        DATE_FORMAT(t.issue_date, '%Y-%m-%d') AS issue_date,
        DATE_FORMAT(t.due_date, '%Y-%m-%d') AS due_date,
        m.name AS borrower_name,
        m.member_id AS borrower_id
      FROM books b
      LEFT JOIN rfid_tags r ON b.book_id = r.book_id
      LEFT JOIN transactions t ON b.book_id = t.book_id AND t.status = 'Issued'
      LEFT JOIN members m ON t.member_id = m.member_id
      WHERE UPPER(COALESCE(r.rfid_id, b.rfid_id)) = ?
    `,
      [queryTag]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: `RFID tag "${queryTag}" not found.` });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("GET /api/rfid/:tagCode error:", err);
    return res.status(500).json({ message: `Failed to retrieve RFID tag "${queryTag}"`, error: err.message });
  }
});

module.exports = router;

/**
 * BOOK RECOMMENDATIONS ROUTE (routes/recommendations.js)
 * Implements transparent, rule-based recommendation logic derived from:
 * 1. Matching category/subject
 * 2. Shared author
 * 3. Member borrowing history affinity
 */

const express = require("express");
const router = express.Router();
const pool = require("../config/db");


/**
 * GET /api/recommendations
 */
router.get("/", async (req, res) => {
  const { book_id, member_id } = req.query;

  try {
    let targetCategory = null;
    let targetAuthor = null;
    let referenceTitle = null;

    if (book_id) {
      const [bookRows] = await pool.query(
        "SELECT book_id, title, author, category FROM books WHERE book_id = ?",
        [book_id]
      );
      if (bookRows.length > 0) {
        targetCategory = bookRows[0].category;
        targetAuthor = bookRows[0].author;
        referenceTitle = bookRows[0].title;
      }
    }

    if (!targetCategory && member_id) {
      const [histRows] = await pool.query(
        `SELECT b.category, b.author, b.title, b.book_id
         FROM transactions t
         JOIN books b ON t.book_id = b.book_id
         WHERE t.member_id = ?
         ORDER BY t.transaction_id DESC
         LIMIT 1`,
        [member_id]
      );

      if (histRows.length > 0) {
        targetCategory = histRows[0].category;
        targetAuthor = histRows[0].author;
        referenceTitle = histRows[0].title;
      }
    }

    if (!targetCategory) {
      targetCategory = "Database";
    }

    const [recommendations] = await pool.query(
      `SELECT b.book_id, b.title, b.author, b.category, b.isbn, b.status,
              COALESCE(r.rfid_id, '') AS rfid_id,
              CASE 
                WHEN b.author = ? THEN 'Shared Author'
                WHEN b.category = ? THEN 'Same Subject Category'
                ELSE 'Curriculum Affinity'
              END AS recommendation_reason
       FROM books b
       LEFT JOIN rfid_tags r ON b.book_id = r.book_id
       WHERE (b.category = ? OR b.author = ?)
         AND (? IS NULL OR b.book_id != ?)
       LIMIT 6`,
      [targetAuthor || "", targetCategory, targetCategory, targetAuthor || "", book_id || null, book_id || 0]
    );

    return res.json({
      reference: {
        book_id: book_id || null,
        title: referenceTitle || "Standard Engineering Curriculum",
        category: targetCategory
      },
      recommendations
    });
  } catch (err) {
    console.error("GET /api/recommendations error:", err);
    return res.status(500).json({
      message: "Failed to generate book recommendations from database.",
      error: err.message
    });
  }
});

module.exports = router;

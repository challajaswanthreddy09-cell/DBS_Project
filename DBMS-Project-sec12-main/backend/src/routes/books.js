/**
 * BOOK CATALOG & RFID TAGGING ROUTES (routes/books.js)
 * Implements CRUD operations for books and manages 1-to-1 mapping with rfid_tags table.
 */

const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticateToken, requireRole } = require("../middleware/auth");


/**
 * GET /api/books
 */
router.get("/", async (req, res) => {
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
        COALESCE(r.rfid_id, b.rfid_id, 'Unassigned') AS rfid_id,
        COALESCE(r.tag_code, b.tag_code) AS tag_code,
        DATE_FORMAT(t.issue_date, '%Y-%m-%d') AS issue_date,
        DATE_FORMAT(t.due_date, '%Y-%m-%d') AS due_date,
        m.name AS borrower_name,
        m.member_id AS borrower_id
      FROM books b
      LEFT JOIN rfid_tags r ON b.book_id = r.book_id
      LEFT JOIN transactions t ON b.book_id = t.book_id AND t.status = 'Issued'
      LEFT JOIN members m ON t.member_id = m.member_id
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim() !== "") {
      sql += ` AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ? OR r.rfid_id LIKE ? OR b.rfid_id LIKE ?)`;
      const q = `%${search.trim()}%`;
      params.push(q, q, q, q, q);
    }

    if (category && category !== "ALL") {
      sql += ` AND b.category = ?`;
      params.push(category);
    }

    if (status && status !== "ALL") {
      sql += ` AND b.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY b.book_id DESC`;

    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error("GET /api/books error:", err);
    return res.status(500).json({
      message: "Failed to retrieve books from database",
      error: err.message
    });
  }
});

/**
 * GET /api/books/:id
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

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
        COALESCE(r.rfid_id, b.rfid_id, '') AS rfid_id,
        COALESCE(r.tag_code, b.tag_code) AS tag_code,
        DATE_FORMAT(t.issue_date, '%Y-%m-%d') AS issue_date,
        DATE_FORMAT(t.due_date, '%Y-%m-%d') AS due_date,
        m.name AS borrower_name,
        m.member_id AS borrower_id
      FROM books b
      LEFT JOIN rfid_tags r ON b.book_id = r.book_id
      LEFT JOIN transactions t ON b.book_id = t.book_id AND t.status = 'Issued'
      LEFT JOIN members m ON t.member_id = m.member_id
      WHERE b.book_id = ?
    `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: `Book #${id} not found.` });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("GET /api/books/:id error:", err);
    return res.status(500).json({ message: `Failed to retrieve book #${id}`, error: err.message });
  }
});

/**
 * POST /api/books
 */
router.post("/", authenticateToken, requireRole(["admin", "librarian"]), async (req, res) => {
  const { title, author, category, isbn, rfid_id, status = "Available" } = req.body;

  if (!title || !author || !category || !isbn || !rfid_id) {
    return res.status(400).json({ message: "Please provide all required book metadata and RFID ID." });
  }

  try {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [bookResult] = await connection.query(
        "INSERT INTO books (title, author, category, isbn, status, rfid_id, tag_code) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [title.trim(), author.trim(), category.trim(), isbn.trim(), status, rfid_id.trim().toUpperCase(), `TAG_${rfid_id.trim().toUpperCase()}`]
      );

      const newBookId = bookResult.insertId;

      await connection.query(
        "INSERT INTO rfid_tags (rfid_id, book_id, tag_code, status) VALUES (?, ?, ?, 'Active') ON DUPLICATE KEY UPDATE book_id = VALUES(book_id), tag_code = VALUES(tag_code), status = 'Active'",
        [rfid_id.trim().toUpperCase(), newBookId, `TAG_${rfid_id.trim().toUpperCase()}`]
      );

      await connection.commit();
      return res.status(201).json({
        message: "Book registered and RFID tag mapped successfully.",
        book_id: newBookId,
        rfid_id: rfid_id.trim().toUpperCase()
      });
    } catch (innerErr) {
      await connection.rollback();
      throw innerErr;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("POST /api/books error:", err);
    return res.status(500).json({ message: "Failed to register book in database", error: err.message });
  }
});

/**
 * PUT /api/books/:id
 */
router.put("/:id", authenticateToken, requireRole(["admin", "librarian"]), async (req, res) => {
  const { id } = req.params;
  const { title, author, category, isbn, rfid_id, status } = req.body;

  try {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        "UPDATE books SET title = ?, author = ?, category = ?, isbn = ?, status = ?, rfid_id = ?, tag_code = ? WHERE book_id = ?",
        [title.trim(), author.trim(), category.trim(), isbn.trim(), status || "Available", rfid_id ? rfid_id.trim().toUpperCase() : null, rfid_id ? `TAG_${rfid_id.trim().toUpperCase()}` : null, id]
      );

      if (rfid_id) {
        await connection.query(
          `INSERT INTO rfid_tags (rfid_id, book_id, tag_code, status)
           VALUES (?, ?, ?, 'Active')
           ON DUPLICATE KEY UPDATE rfid_id = VALUES(rfid_id), tag_code = VALUES(tag_code), status = 'Active'`,
          [rfid_id.trim().toUpperCase(), id, `TAG_${rfid_id.trim().toUpperCase()}`]
        );
      }

      await connection.commit();
      return res.json({ message: "Book updated successfully." });
    } catch (inner) {
      await connection.rollback();
      throw inner;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("PUT /api/books/:id error:", err);
    return res.status(500).json({ message: "Failed to update book in database", error: err.message });
  }
});

/**
 * DELETE /api/books/:id
 */
router.delete("/:id", authenticateToken, requireRole(["admin", "librarian"]), async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM books WHERE book_id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: `Book #${id} not found.` });
    }
    return res.json({ message: "Book deleted successfully." });
  } catch (err) {
    console.error("DELETE /api/books/:id error:", err);
    return res.status(500).json({ message: "Failed to delete book from database", error: err.message });
  }
});

module.exports = router;

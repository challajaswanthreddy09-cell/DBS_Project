/**
 * CIRCULATION TRANSACTION ROUTES (routes/transactions.js)
 * Implements automated book issue and return workflows using RFID tags,
 * transaction logging, and overdue fine generation.
 */

const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authenticateToken, requireRole } = require("../middleware/auth");
require("dotenv").config();

// Protect circulation routes for Admin and Librarian
router.use(authenticateToken);
router.use(requireRole(["admin", "librarian"]));

const FINE_PER_DAY = Number(process.env.FINE_PER_DAY) || 5; // Default: ₹5 per day


/**
 * GET /api/transactions
 */
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        t.transaction_id,
        t.book_id,
        b.title AS book_title,
        t.member_id,
        m.name AS member_name,
        t.rfid_id,
        DATE_FORMAT(t.issue_date, '%Y-%m-%d') AS issue_date,
        DATE_FORMAT(t.due_date, '%Y-%m-%d') AS due_date,
        DATE_FORMAT(t.return_date, '%Y-%m-%d') AS return_date,
        t.status,
        COALESCE(f.fine_amount, 0) AS fine,
        COALESCE(f.fine_status, 'Paid') AS fine_status,
        f.fine_id
      FROM transactions t
      JOIN books b ON t.book_id = b.book_id
      JOIN members m ON t.member_id = m.member_id
      LEFT JOIN fines f ON t.transaction_id = f.transaction_id
      ORDER BY t.transaction_id DESC
    `);

    return res.json(rows);
  } catch (err) {
    console.error("GET /api/transactions error:", err);
    return res.status(500).json({
      message: "Failed to load circulation transactions from MySQL.",
      error: err.message
    });
  }
});

/**
 * POST /api/transactions/issue
 */
router.post("/issue", async (req, res) => {
  const { member_id, rfid_id, issue_date, due_date } = req.body;

  if (!member_id || !rfid_id) {
    return res.status(400).json({ message: "Member ID and RFID Tag are required to issue a book." });
  }

  const queryTag = rfid_id.trim().toUpperCase();

  try {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [bookRows] = await connection.query(
        `SELECT b.book_id, b.title, b.status 
         FROM books b 
         LEFT JOIN rfid_tags r ON b.book_id = r.book_id 
         WHERE UPPER(COALESCE(r.rfid_id, b.rfid_id)) = ? FOR UPDATE`,
        [queryTag]
      );

      if (bookRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: `No registered book found with RFID tag "${queryTag}".` });
      }

      const book = bookRows[0];
      if (book.status !== "Available") {
        await connection.rollback();
        return res.status(400).json({
          message: `Book "${book.title}" is currently marked as ${book.status} and cannot be issued.`
        });
      }

      const [memberRows] = await connection.query(
        "SELECT member_id, name, status FROM members WHERE member_id = ?",
        [member_id]
      );

      if (memberRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: "Member does not exist." });
      }

      const member = memberRows[0];
      if (member.status !== "Active") {
        await connection.rollback();
        return res.status(400).json({ message: "Member account is inactive. Lending is restricted." });
      }

      const actualIssueDate = issue_date || new Date().toISOString().split("T")[0];
      let actualDueDate = due_date;
      if (!actualDueDate) {
        const d = new Date();
        d.setDate(d.getDate() + 14);
        actualDueDate = d.toISOString().split("T")[0];
      }

      const [txResult] = await connection.query(
        `INSERT INTO transactions (book_id, member_id, rfid_id, issue_date, due_date, status)
         VALUES (?, ?, ?, ?, ?, 'Issued')`,
        [book.book_id, member.member_id, queryTag, actualIssueDate, actualDueDate]
      );

      await connection.query("UPDATE books SET status = 'Issued' WHERE book_id = ?", [book.book_id]);

      await connection.commit();

      return res.status(201).json({
        message: `Book "${book.title}" successfully issued to ${member.name}.`,
        transaction_id: txResult.insertId,
        book_title: book.title,
        member_name: member.name,
        due_date: actualDueDate
      });
    } catch (inner) {
      await connection.rollback();
      throw inner;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("POST /api/transactions/issue error:", err);
    return res.status(500).json({
      message: "Database transaction failed while issuing book.",
      error: err.message
    });
  }
});

/**
 * POST /api/transactions/return
 */
router.post("/return", async (req, res) => {
  const { rfid_id, return_date } = req.body;

  if (!rfid_id || rfid_id.trim() === "") {
    return res.status(400).json({ message: "Please provide an RFID tag code." });
  }

  const queryTag = rfid_id.trim().toUpperCase();
  const actualReturnDate = return_date || new Date().toISOString().split("T")[0];

  try {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [txRows] = await connection.query(
        `SELECT 
          t.transaction_id,
          t.book_id,
          b.title AS book_title,
          t.member_id,
          m.name AS member_name,
          COALESCE(t.rfid_id, b.rfid_id) AS rfid_id,
          DATE_FORMAT(t.due_date, '%Y-%m-%d') AS due_date
        FROM transactions t
        JOIN books b ON t.book_id = b.book_id
        JOIN members m ON t.member_id = m.member_id
        WHERE (UPPER(t.rfid_id) = ? OR UPPER(b.rfid_id) = ?) AND t.status = 'Issued'
        ORDER BY t.transaction_id DESC
        LIMIT 1
        FOR UPDATE`,
        [queryTag, queryTag]
      );

      if (txRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          message: `No active borrowing loan found for RFID tag "${queryTag}".`
        });
      }

      const tx = txRows[0];

      const dueTime = new Date(tx.due_date).getTime();
      const returnTime = new Date(actualReturnDate).getTime();
      const diffTime = returnTime - dueTime;
      const overdueDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const calculatedFine = overdueDays * FINE_PER_DAY;

      await connection.query(
        "UPDATE transactions SET status = 'Returned', return_date = ?, fine = ?, fine_status = ? WHERE transaction_id = ?",
        [actualReturnDate, calculatedFine, calculatedFine > 0 ? "Unpaid" : "Paid", tx.transaction_id]
      );

      await connection.query("UPDATE books SET status = 'Available' WHERE book_id = ?", [tx.book_id]);

      let fineId = null;
      if (calculatedFine > 0) {
        const [fineResult] = await connection.query(
          `INSERT INTO fines (transaction_id, overdue_days, fine_amount, fine_status)
           VALUES (?, ?, ?, 'Unpaid')
           ON DUPLICATE KEY UPDATE overdue_days = VALUES(overdue_days), fine_amount = VALUES(fine_amount), fine_status = 'Unpaid'`,
          [tx.transaction_id, overdueDays, calculatedFine]
        );
        fineId = fineResult.insertId;
      }

      await connection.commit();

      return res.json({
        message: `Book "${tx.book_title}" returned successfully.`,
        transaction_id: tx.transaction_id,
        book_title: tx.book_title,
        member_name: tx.member_name,
        return_date: actualReturnDate,
        overdueDays,
        fine: calculatedFine,
        fine_status: calculatedFine > 0 ? "Unpaid" : "Paid",
        fine_id: fineId
      });
    } catch (inner) {
      await connection.rollback();
      throw inner;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("POST /api/transactions/return error:", err);
    return res.status(500).json({
      message: "Failed to process book return",
      error: err.message
    });
  }
});

module.exports = router;

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowDownLeft,
  Tag,
  BookOpen,
  Calendar,
  Clock,
  CircleDollarSign,
  AlertCircle,
  CheckCircle2,
  Check,
  RefreshCw
} from "lucide-react";
import Button from "../components/Button";
import api from "../api/client";
import {
  INITIAL_BOOKS,
  INITIAL_MEMBERS,
  INITIAL_TRANSACTIONS,
  INITIAL_FINES,
  DEFAULT_FINE_RATE_PER_DAY
} from "../data/sampleData";

/**
 * Return Book Page (ReturnBook.jsx)
 * Connects to Express POST /api/transactions/return to record book return and compute fines.
 */
export default function ReturnBook() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [rfidTag, setRfidTag] = useState(searchParams.get("rfid") || "RFID003");
  const [activeLoan, setActiveLoan] = useState(null);
  const [returnDate, setReturnDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [overdueDays, setOverdueDays] = useState(0);
  const [calculatedFine, setCalculatedFine] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find active loan when RFID tag or return date changes
  useEffect(() => {
    if (!rfidTag.trim()) {
      setActiveLoan(null);
      return;
    }

    const loadActiveLoan = async () => {
      const tagQuery = rfidTag.trim().toUpperCase();

      try {
        // Try fetching latest transactions from API
        const res = await api.get("/transactions");
        if (res.data && Array.isArray(res.data)) {
          const loan = res.data.find(
            (t) => t.status === "Issued" && t.rfid_id && t.rfid_id.toUpperCase() === tagQuery
          );
          if (loan) {
            setActiveLoan(loan);
            setError("");
            calculateOverdue(loan.due_date, returnDate);
            return;
          }
        }
      } catch (err) {
        console.warn("API GET /transactions offline:", err.message);
      }

      // Local storage fallback
      const savedTx = localStorage.getItem("libraryTransactions");
      const transactions = savedTx ? JSON.parse(savedTx) : INITIAL_TRANSACTIONS;
      const loan = transactions.find(
        (t) => t.status === "Issued" && t.rfid_id && t.rfid_id.toUpperCase() === tagQuery
      );

      if (loan) {
        setActiveLoan(loan);
        setError("");
        calculateOverdue(loan.due_date, returnDate);
      } else {
        setActiveLoan(null);
        setError(`No active borrowing loan found for RFID tag "${tagQuery}".`);
      }
    };

    loadActiveLoan();
  }, [rfidTag, returnDate]);

  const calculateOverdue = (dueDateStr, returnDateStr) => {
    const dueTime = new Date(dueDateStr).getTime();
    const returnTime = new Date(returnDateStr).getTime();
    const diffDays = Math.ceil((returnTime - dueTime) / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      setOverdueDays(diffDays);
      setCalculatedFine(diffDays * DEFAULT_FINE_RATE_PER_DAY);
    } else {
      setOverdueDays(0);
      setCalculatedFine(0);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!activeLoan) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const tagQuery = rfidTag.trim().toUpperCase();

    try {
      // 1. Send return request to Express Backend -> MySQL
      const res = await api.post("/transactions/return", {
        rfid_id: tagQuery,
        return_date: returnDate
      });

      const data = res.data;
      setSuccess(
        `${data.message} Overdue: ${data.overdueDays || 0} days. Fine calculated: ₹${data.fine || 0}`
      );

      // Navigate to dashboard only on confirmed MySQL success
      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (err) {
      console.error("API POST /transactions/return error:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to record book return in MySQL database. Please verify active loan."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="circulation-page">
      <div className="circulation-header">
        <h2>Automated Book Return & Fine Computation</h2>
        <p className="text-muted text-sm">
          Scan the book's RFID tag to look up active loans, calculate overdue penalties, and replenish shelf stock.
        </p>
      </div>

      {error && (
        <div className="alert-box alert-warning">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert-box alert-success">
          <Check size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="circulation-grid">
        {/* Left Form: RFID Tag Input & Return Date */}
        <div className="card circulation-form-card">
          <div className="card-header-clean">
            <h3>Return Parameters</h3>
            <span className="badge-pill">Step 1 & 2</span>
          </div>

          <form onSubmit={handleReturnSubmit} className="standard-form">
            <div className="form-group">
              <label className="form-label" htmlFor="rfidInput">
                Scan / Enter RFID Tag ID *
              </label>
              <div className="input-with-icon">
                <Tag size={16} className="input-icon text-secondary" />
                <input
                  id="rfidInput"
                  type="text"
                  className="form-input font-mono"
                  value={rfidTag}
                  onChange={(e) => setRfidTag(e.target.value)}
                  placeholder="e.g. RFID002"
                  required
                />
              </div>
              <small className="form-hint">Tip: Try active demo loans like RFID003 or RFID006.</small>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="returnDate">
                Return Date (Actual Date of Return) *
              </label>
              <div className="input-with-icon">
                <Calendar size={16} className="input-icon text-muted" />
                <input
                  id="returnDate"
                  type="date"
                  className="form-input"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="warning"
              size="lg"
              className="w-full mt-4"
              disabled={isSubmitting || !activeLoan}
              icon={ArrowDownLeft}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin mr-1" />
                  <span>Processing Return in MySQL...</span>
                </>
              ) : (
                "Complete Book Return"
              )}
            </Button>
          </form>
        </div>

        {/* Right Card: Active Loan Verification & Fine Engine */}
        <div className="card circulation-preview-card">
          <div className="card-header-clean">
            <h3>Active Circulation Record</h3>
            <span className="badge-pill">Step 3 & 4</span>
          </div>

          {activeLoan ? (
            <div className="identified-details">
              <div className="book-banner-preview">
                <BookOpen size={32} className="text-secondary" />
                <div>
                  <h4>{activeLoan.book_title}</h4>
                  <p className="text-muted">
                    Transaction ID: <span className="font-mono">TR-{activeLoan.transaction_id}</span>
                  </p>
                </div>
              </div>

              <div className="preview-meta-list">
                <div className="meta-row">
                  <span className="meta-lbl">Borrowing Member:</span>
                  <span className="meta-val font-medium">{activeLoan.member_name}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-lbl">Date of Issue:</span>
                  <span className="meta-val">{activeLoan.issue_date}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-lbl">Due Date:</span>
                  <span className="meta-val font-mono text-warning">{activeLoan.due_date}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-lbl">Return Date:</span>
                  <span className="meta-val font-mono">{returnDate}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-lbl">Overdue Days:</span>
                  <span className={`meta-val font-bold ${overdueDays > 0 ? "text-danger" : "text-success"}`}>
                    {overdueDays} Days
                  </span>
                </div>
              </div>

              {/* Fine Engine Box */}
              <div className={`fine-calculation-box ${overdueDays > 0 ? "fine-active" : "fine-zero"}`}>
                <div className="fine-box-header">
                  <CircleDollarSign size={20} />
                  <strong>Fine Calculation Engine (₹{DEFAULT_FINE_RATE_PER_DAY}/day):</strong>
                </div>
                <div className="fine-formula-text">
                  Fine = {overdueDays} Overdue Days × ₹{DEFAULT_FINE_RATE_PER_DAY} ={" "}
                  <span className="fine-total-amount">₹{calculatedFine}</span>
                </div>
                {overdueDays > 0 ? (
                  <p className="text-xs text-danger mt-1">
                    * Overdue penalty will be assigned to member account upon return.
                  </p>
                ) : (
                  <p className="text-xs text-success mt-1">
                    * Book returned within scheduled lending period. No fine charged.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-preview">
              <Clock size={36} className="text-muted" />
              <p>Enter an RFID Tag currently on loan to inspect loan dates and fine computation.</p>
              <span className="text-xs text-muted">Example: RFID003, RFID006</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

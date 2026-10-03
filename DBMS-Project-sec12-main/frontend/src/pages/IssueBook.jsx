import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  User,
  Tag,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Check,
  RefreshCw
} from "lucide-react";
import Button from "../components/Button";
import api from "../api/client";
import {
  INITIAL_BOOKS,
  INITIAL_MEMBERS,
  INITIAL_TRANSACTIONS
} from "../data/sampleData";

/**
 * Issue Book Page (IssueBook.jsx)
 * Connects to Express POST /api/transactions/issue, GET /api/members, and POST /api/rfid/scan.
 */
export default function IssueBook() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const getTodayDate = () => new Date().toISOString().split("T")[0];
  const getDueDate = (days = 14) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [rfidTag, setRfidTag] = useState(searchParams.get("rfid") || "RFID001");
  const [issueDate, setIssueDate] = useState(getTodayDate());
  const [dueDate, setDueDate] = useState(getDueDate(14));

  const [identifiedBook, setIdentifiedBook] = useState(null);
  const [membersList, setMembersList] = useState(INITIAL_MEMBERS);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch patrons from API
  useEffect(() => {
    const fetchPatrons = async () => {
      try {
        const res = await api.get("/members");
        if (res.data && Array.isArray(res.data)) {
          setMembersList(res.data);
        }
      } catch (err) {
        console.warn("API GET /members offline, using local state:", err.message);
        const saved = localStorage.getItem("libraryMembers");
        if (saved) setMembersList(JSON.parse(saved));
      }
    };
    fetchPatrons();
  }, []);

  // Lookup book via RFID scan API
  useEffect(() => {
    if (!rfidTag.trim()) {
      setIdentifiedBook(null);
      return;
    }

    const checkTag = async () => {
      try {
        const res = await api.post("/rfid/scan", { rfid_id: rfidTag.trim().toUpperCase() });
        if (res.data && res.data.book) {
          setIdentifiedBook(res.data.book);
          setError("");
          return;
        }
      } catch {
        // Fallback local lookup
        const saved = localStorage.getItem("libraryBooks");
        const books = saved ? JSON.parse(saved) : INITIAL_BOOKS;
        const found = books.find(
          (b) => b.rfid_id && b.rfid_id.toUpperCase() === rfidTag.trim().toUpperCase()
        );
        setIdentifiedBook(found || null);
      }
    };

    checkTag();
  }, [rfidTag]);

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedMemberId) {
      setError("Please select a registered library member.");
      return;
    }

    if (!identifiedBook) {
      setError(`No book registered with RFID tag "${rfidTag}".`);
      return;
    }

    if (identifiedBook.status !== "Available") {
      setError(`Cannot issue "${identifiedBook.title}". Book is currently marked as ${identifiedBook.status}.`);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Post to Express Backend -> MySQL
      const res = await api.post("/transactions/issue", {
        member_id: selectedMemberId,
        rfid_id: rfidTag.trim().toUpperCase(),
        issue_date: issueDate,
        due_date: dueDate
      });

      setSuccess(res.data.message || `Book successfully issued in MySQL!`);
      setIdentifiedBook({ ...identifiedBook, status: "Issued" });

      // Navigate to dashboard only on confirmed MySQL success
      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (err) {
      console.error("API POST /transactions/issue error:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to record book issue in MySQL database. Please verify connection and member status."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="circulation-page">
      <div className="circulation-header">
        <h2>Automated Book Issue</h2>
        <p className="text-muted text-sm">
          Map an active library member with a digitally scanned book RFID tag to record circulation.
        </p>
      </div>

      {error && (
        <div className="alert-box alert-error">
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
        {/* Left Form: Member & RFID Details */}
        <div className="card circulation-form-card">
          <div className="card-header-clean">
            <h3>Issue Parameters</h3>
            <span className="badge-pill">Step 1 & 2</span>
          </div>

          <form onSubmit={handleIssueSubmit} className="standard-form">
            {/* Member Selection */}
            <div className="form-group">
              <label className="form-label" htmlFor="memberSelect">
                Select Member *
              </label>
              <div className="input-with-icon">
                <User size={16} className="input-icon text-muted" />
                <select
                  id="memberSelect"
                  className="form-select"
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Member --</option>
                  {membersList.map((m) => (
                    <option key={m.member_id} value={m.member_id}>
                      {m.name} ({m.email}) - {m.status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* RFID Tag Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="rfidTag">
                RFID Tag ID *
              </label>
              <div className="input-with-icon">
                <Tag size={16} className="input-icon text-secondary" />
                <input
                  id="rfidTag"
                  type="text"
                  className="form-input font-mono"
                  value={rfidTag}
                  onChange={(e) => setRfidTag(e.target.value)}
                  placeholder="e.g. RFID001"
                  required
                />
              </div>
              <small className="form-hint">Enter or simulate scan of RFID tag attached to book.</small>
            </div>

            {/* Issue Date & Due Date */}
            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label" htmlFor="issueDate">
                  Issue Date *
                </label>
                <div className="input-with-icon">
                  <Calendar size={16} className="input-icon text-muted" />
                  <input
                    id="issueDate"
                    type="date"
                    className="form-input"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group flex-1">
                <label className="form-label" htmlFor="dueDate">
                  Due Date (14 Days) *
                </label>
                <div className="input-with-icon">
                  <Calendar size={16} className="input-icon text-muted" />
                  <input
                    id="dueDate"
                    type="date"
                    className="form-input"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-3"
              disabled={isSubmitting || !identifiedBook || identifiedBook.status !== "Available"}
              icon={ArrowUpRight}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin mr-1" />
                  <span>Recording Loan in MySQL...</span>
                </>
              ) : (
                "Issue Book to Member"
              )}
            </Button>
          </form>
        </div>

        {/* Right Card: Book Identification & Availability Check */}
        <div className="card circulation-preview-card">
          <div className="card-header-clean">
            <h3>Scanned Book Identification</h3>
            <span className="badge-pill">Step 3 & 4</span>
          </div>

          {identifiedBook ? (
            <div className="identified-details">
              <div className="book-banner-preview">
                <BookOpen size={32} className="text-secondary" />
                <div>
                  <h4>{identifiedBook.title}</h4>
                  <p className="text-muted">By {identifiedBook.author}</p>
                </div>
              </div>

              <div className="preview-meta-list">
                <div className="meta-row">
                  <span className="meta-lbl">Category:</span>
                  <span className="meta-val badge-category">{identifiedBook.category}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-lbl">ISBN:</span>
                  <span className="meta-val font-mono">{identifiedBook.isbn}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-lbl">RFID Tag:</span>
                  <span className="meta-val font-mono badge-rfid">
                    <Tag size={12} className="mr-1" />
                    {identifiedBook.rfid_id}
                  </span>
                </div>
                <div className="meta-row">
                  <span className="meta-lbl">Shelf Status:</span>
                  <span
                    className={`status-pill ${
                      identifiedBook.status === "Available" ? "status-available" : "status-issued"
                    }`}
                  >
                    {identifiedBook.status === "Available" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {identifiedBook.status}
                  </span>
                </div>
              </div>

              {identifiedBook.status !== "Available" && (
                <div className="alert-box alert-warning mt-4">
                  <AlertCircle size={16} />
                  <span>This title is already checked out! Return it first before re-issuing.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-preview">
              <Tag size={36} className="text-muted" />
              <p>Type or scan a valid RFID Tag ID on the left to identify the book.</p>
              <span className="text-xs text-muted">Example: RFID001, RFID003, RFID005</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

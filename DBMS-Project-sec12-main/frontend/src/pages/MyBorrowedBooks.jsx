import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Tag,
  Search,
  RefreshCw,
  ArrowLeft,
  CircleDollarSign
} from "lucide-react";
import api from "../api/client";

/**
 * My Borrowed Books Page (MyBorrowedBooks.jsx)
 * Displays circulation history and active loans strictly for the logged-in student.
 */
export default function MyBorrowedBooks() {
  const [loans, setLoans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBorrowedBooks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get("/student/borrowed-books");
      if (res.data && Array.isArray(res.data)) {
        setLoans(res.data);
      } else {
        setLoans([]);
      }
    } catch (err) {
      console.error("Failed to load borrowed books:", err);
      setError(err.response?.data?.message || err.message || "Failed to load borrowed books.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  // Filtered loans list
  const filteredLoans = loans.filter((loan) => {
    const matchesSearch =
      loan.book_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (loan.author && loan.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (loan.rfid_id && loan.rfid_id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" ? true : loan.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalLoansCount = loans.length;
  const activeLoansCount = loans.filter((l) => l.status === "Issued").length;
  const overdueCount = loans.filter((l) => Boolean(l.is_overdue)).length;
  const returnedCount = loans.filter((l) => l.status === "Returned").length;

  return (
    <div className="circulation-page-container">
      <div className="page-header-actions-row">
        <div>
          <h2>My Borrowed Books</h2>
          <p className="text-muted text-sm">
            View your complete personal book borrowing and return history.
          </p>
        </div>
        <button
          onClick={fetchBorrowedBooks}
          className="btn-custom btn-outline flex-center-gap"
          title="Refresh Loan Records"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="alert-box alert-error mb-4">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Mini KPI summary */}
      <div className="stat-cards-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: "20px" }}>
        <div className="card" style={{ padding: "16px" }}>
          <span className="text-muted text-xs uppercase" style={{ fontWeight: 600 }}>Total Borrowed</span>
          <h3 style={{ fontSize: "1.6rem", margin: "4px 0" }}>{totalLoansCount}</h3>
          <span className="text-muted text-xs">Lifetime library transactions</span>
        </div>
        <div className="card" style={{ padding: "16px" }}>
          <span className="text-muted text-xs uppercase" style={{ fontWeight: 600 }}>Currently Issued</span>
          <h3 style={{ fontSize: "1.6rem", margin: "4px 0", color: "var(--primary)" }}>{activeLoansCount}</h3>
          <span className="text-muted text-xs">In your active custody</span>
        </div>
        <div className="card" style={{ padding: "16px" }}>
          <span className="text-muted text-xs uppercase" style={{ fontWeight: 600 }}>Overdue Titles</span>
          <h3 style={{ fontSize: "1.6rem", margin: "4px 0", color: overdueCount > 0 ? "var(--danger)" : "var(--success)" }}>
            {overdueCount}
          </h3>
          <span className="text-muted text-xs">{overdueCount > 0 ? "Requires immediate return" : "All books on schedule"}</span>
        </div>
        <div className="card" style={{ padding: "16px" }}>
          <span className="text-muted text-xs uppercase" style={{ fontWeight: 600 }}>Returned</span>
          <h3 style={{ fontSize: "1.6rem", margin: "4px 0", color: "var(--success)" }}>{returnedCount}</h3>
          <span className="text-muted text-xs">Completed circulations</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="filter-panel card" style={{ marginBottom: "20px" }}>
        <div className="filter-grid" style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <div className="input-with-icon" style={{ flex: 1, minWidth: "240px" }}>
            <Search size={18} className="input-icon" />
            <input
              type="text"
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by book title, author, or RFID tag..."
            />
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className={`btn-custom ${statusFilter === "ALL" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setStatusFilter("ALL")}
            >
              All Records
            </button>
            <button
              className={`btn-custom ${statusFilter === "Issued" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setStatusFilter("Issued")}
            >
              Currently Issued
            </button>
            <button
              className={`btn-custom ${statusFilter === "Returned" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setStatusFilter("Returned")}
            >
              Returned
            </button>
          </div>
        </div>
      </div>

      {/* Borrowings Table */}
      {isLoading ? (
        <div className="card empty-state">
          <RefreshCw size={28} className="animate-spin text-muted" />
          <p className="empty-title mt-2">Loading your circulation records...</p>
        </div>
      ) : filteredLoans.length === 0 ? (
        <div className="card empty-state">
          <BookOpen size={40} className="text-muted" />
          <p className="empty-title mt-2">No matching borrowing records found</p>
          <p className="empty-sub">
            {searchTerm || statusFilter !== "ALL"
              ? "Try adjusting your search filters."
              : "You have no book transactions recorded yet."}
          </p>
        </div>
      ) : (
        <div className="table-responsive card">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Tx ID</th>
                <th>Book Title</th>
                <th>Category</th>
                <th>RFID Tag</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Fine Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map((loan) => {
                const isIssued = loan.status === "Issued";
                const isOverdue = Boolean(loan.is_overdue);
                const fine = parseFloat(loan.fine) || 0;

                return (
                  <tr key={loan.transaction_id}>
                    <td className="font-mono text-muted">TR-{loan.transaction_id}</td>
                    <td>
                      <div className="table-item-title">{loan.book_title}</div>
                      <span className="text-muted text-xs">{loan.author}</span>
                    </td>
                    <td>
                      <span className="badge-category">{loan.category || "General"}</span>
                    </td>
                    <td>
                      <span className="badge-rfid">
                        <Tag size={11} className="mr-1" />
                        {loan.rfid_id || "Unassigned"}
                      </span>
                    </td>
                    <td className="text-muted text-xs">
                      <span className="flex-center-gap">
                        <Calendar size={12} />
                        {loan.issue_date}
                      </span>
                    </td>
                    <td className="text-muted text-xs">
                      <span className="flex-center-gap">
                        <Calendar size={12} />
                        {loan.due_date}
                      </span>
                    </td>
                    <td className="text-muted text-xs">
                      {loan.return_date ? (
                        <span className="flex-center-gap text-success">
                          <CheckCircle2 size={12} />
                          {loan.return_date}
                        </span>
                      ) : (
                        <span className="text-muted font-italic">Not Returned</span>
                      )}
                    </td>
                    <td>
                      {isIssued ? (
                        isOverdue ? (
                          <div>
                            <span className="status-pill status-danger">
                              <AlertTriangle size={12} />
                              Overdue ({loan.overdue_days} days)
                            </span>
                          </div>
                        ) : (
                          <span className="status-pill status-issued">
                            <Clock size={12} />
                            Active Loan
                          </span>
                        )
                      ) : (
                        <span className="status-pill status-available">
                          <CheckCircle2 size={12} />
                          Returned
                        </span>
                      )}
                    </td>
                    <td>
                      {fine > 0 ? (
                        <div>
                          <span className={`badge-pill ${loan.fine_status === "Unpaid" ? "badge-danger" : "badge-success"}`}>
                            ₹{fine} ({loan.fine_status})
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted text-xs">None</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

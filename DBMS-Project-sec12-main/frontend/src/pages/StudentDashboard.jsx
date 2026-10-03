import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CircleDollarSign,
  ArrowRight,
  BookMarked,
  UserCheck,
  RefreshCw,
  Calendar,
  Tag
} from "lucide-react";
import StatCard from "../components/StatCard";
import api from "../api/client";

/**
 * Student Dashboard (StudentDashboard.jsx)
 * Displays student-specific borrowing metrics, active loans, and overdue dues.
 */
export default function StudentDashboard({ user }) {
  const [data, setData] = useState({
    student: null,
    stats: {
      availableBooks: 0,
      myBorrowedBooks: 0,
      myActiveFines: 0
    },
    recentLoans: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudentDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get("/student/dashboard");
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load student dashboard:", err);
      setError(err.response?.data?.message || err.message || "Failed to connect to backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDashboard();
  }, []);

  const studentName = data.student?.name || user?.full_name || user?.username || "Student";
  const { availableBooks, myBorrowedBooks, myActiveFines } = data.stats;

  return (
    <div className="dashboard-content">
      {/* Student Welcome Banner */}
      <div className="dashboard-welcome-banner card">
        <div className="welcome-text">
          <h2>Welcome, {studentName}! 🎓</h2>
          <p>
            Welcome to the SmartLib Student Portal. Track your borrowed titles, due dates, and explore the catalog.
          </p>
        </div>
        <div className="welcome-actions">
          <Link to="/student/books" className="btn-custom btn-primary">
            <BookMarked size={16} className="mr-1" />
            <span>Browse Catalog</span>
          </Link>
          <Link to="/student/borrowed-books" className="btn-custom btn-secondary">
            <Clock size={16} className="mr-1" />
            <span>My Borrowings</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert-box alert-error mb-4">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 3 Student KPI Stat Cards */}
      <div className="stat-cards-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <StatCard
          title="Available Books"
          value={isLoading ? "..." : availableBooks}
          icon={CheckCircle2}
          badge="In Library"
          variant="success"
          helperText="Titles on shelf ready for issue"
        />
        <StatCard
          title="My Borrowed Books"
          value={isLoading ? "..." : myBorrowedBooks}
          icon={BookOpen}
          badge="Active Loans"
          variant="primary"
          helperText="Titles currently in your possession"
        />
        <StatCard
          title="My Active Fines"
          value={isLoading ? "..." : `₹${myActiveFines}`}
          icon={CircleDollarSign}
          badge={myActiveFines > 0 ? "Action Required" : "No Dues"}
          variant={myActiveFines > 0 ? "danger" : "info"}
          helperText="Pending overdue penalty charges"
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="dashboard-analytics-row">
        <div className="card" style={{ flex: 1 }}>
          <div className="card-header-clean">
            <h3>Student Shortcuts</h3>
            <span className="badge-pill">Quick Access</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginTop: "12px" }}>
            <Link to="/student/books" className="demo-chip" style={{ padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="icon-badge-round" style={{ background: "#EEF2FF", color: "#4F46E5", padding: "8px", borderRadius: "8px" }}>
                <BookMarked size={20} />
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "0.92rem" }}>Browse Catalog</strong>
                <span className="text-muted text-xs">Search available books</span>
              </div>
            </Link>

            <Link to="/student/borrowed-books" className="demo-chip" style={{ padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="icon-badge-round" style={{ background: "#F0FDF4", color: "#16A34A", padding: "8px", borderRadius: "8px" }}>
                <Clock size={20} />
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "0.92rem" }}>My Borrowings</strong>
                <span className="text-muted text-xs">View loan return deadlines</span>
              </div>
            </Link>

            <Link to="/student/fines" className="demo-chip" style={{ padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="icon-badge-round" style={{ background: "#FEF2F2", color: "#DC2626", padding: "8px", borderRadius: "8px" }}>
                <CircleDollarSign size={20} />
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "0.92rem" }}>My Fines & Dues</strong>
                <span className="text-muted text-xs">Check penalty history</span>
              </div>
            </Link>

            <Link to="/student/profile" className="demo-chip" style={{ padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="icon-badge-round" style={{ background: "#F8FAFC", color: "#475569", padding: "8px", borderRadius: "8px" }}>
                <UserCheck size={20} />
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "0.92rem" }}>My Profile</strong>
                <span className="text-muted text-xs">View library member info</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Borrowings Table */}
      <div className="card mt-6">
        <div className="card-header-clean">
          <div>
            <h3>Recent Borrowings</h3>
            <p className="text-muted text-xs">Your latest circulation and book issue history</p>
          </div>
          <Link to="/student/borrowed-books" className="text-link-sm flex-center-gap">
            <span>View All Records</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <RefreshCw size={24} className="animate-spin text-muted" />
            <p className="text-muted text-sm mt-2">Loading circulation records...</p>
          </div>
        ) : data.recentLoans.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={36} className="text-muted" />
            <p className="empty-title mt-2">No active borrowings found</p>
            <p className="empty-sub">You have not borrowed any books yet or all books have been returned.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Author</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Fine Dues</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLoans.map((loan) => {
                  const isIssued = loan.status === "Issued";
                  const isOverdue = Boolean(loan.is_overdue);
                  const fine = parseFloat(loan.fine) || 0;

                  return (
                    <tr key={loan.transaction_id}>
                      <td>
                        <div className="table-item-title">{loan.book_title}</div>
                        {loan.rfid_id && (
                          <span className="badge-rfid-inline">
                            <Tag size={11} /> {loan.rfid_id}
                          </span>
                        )}
                      </td>
                      <td className="text-muted">{loan.author}</td>
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
                      <td>
                        {isIssued ? (
                          isOverdue ? (
                            <span className="status-pill status-danger">
                              <AlertTriangle size={12} />
                              Overdue
                            </span>
                          ) : (
                            <span className="status-pill status-issued">
                              <Clock size={12} />
                              Issued
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
                          <span className={`badge-pill ${loan.fine_status === "Unpaid" ? "badge-danger" : "badge-success"}`}>
                            ₹{fine} ({loan.fine_status})
                          </span>
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
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Users,
  AlertTriangle,
  CircleDollarSign,
  ScanLine,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  PieChart as PieIcon,
  RefreshCw
} from "lucide-react";
import StatCard from "../components/StatCard";
import TransactionTable from "../components/TransactionTable";
import api from "../api/client";
import { INITIAL_BOOKS, INITIAL_MEMBERS, INITIAL_TRANSACTIONS, INITIAL_FINES } from "../data/sampleData";

/**
 * Main Dashboard (Dashboard.jsx)
 * Connects to GET /api/dashboard/stats for real-time KPI metrics and transaction logs.
 */
export default function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    issuedBooks: 0,
    members: 0,
    overdueBooks: 0,
    totalFine: 0,
    unpaidFine: 0,
    recentTransactions: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real-time metrics from Express Backend
  const fetchDashboardStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get("/dashboard/stats");
      if (res.data) {
        setStats((prev) => ({
          ...prev,
          ...res.data,
          recentTransactions: Array.isArray(res.data.recentTransactions)
            ? res.data.recentTransactions
            : prev.recentTransactions
        }));
      }
    } catch (err) {
      console.error("API GET /dashboard/stats error:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Could not connect to backend server at http://localhost:5000."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const { totalBooks, availableBooks, issuedBooks, members, overdueBooks, totalFine, unpaidFine, recentTransactions } =
    stats;

  // Percentage calculations
  const availablePct = Math.round((availableBooks / (totalBooks || 1)) * 100);
  const issuedPct = Math.round((issuedBooks / (totalBooks || 1)) * 100);

  return (
    <div className="dashboard-content">
      {/* Top Banner with greeting and RFID simulation alert */}
      <div className="dashboard-welcome-banner card">
        <div className="welcome-text">
          <h2>Welcome back, {user?.full_name || user?.username || "Librarian"}! 👋</h2>
          <p>Here is your daily library circulation, RFID tag activity, and member overview.</p>
        </div>
        <div className="welcome-actions">
          <button
            type="button"
            className="btn-custom btn-outline"
            onClick={fetchDashboardStats}
            title="Refresh Dashboard Statistics"
            disabled={isLoading}
          >
            <RefreshCw size={15} className={`mr-1 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link to="/rfid" className="btn-custom btn-primary">
            <ScanLine size={16} className="mr-1" />
            <span>RFID Simulator</span>
          </Link>
          <Link to="/issue" className="btn-custom btn-secondary">
            <ArrowUpRight size={16} className="mr-1" />
            <span>Issue Book</span>
          </Link>
          <Link to="/return" className="btn-custom btn-outline">
            <ArrowDownLeft size={16} className="mr-1" />
            <span>Return Book</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert-box alert-error mb-4">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 6 Key Stat Cards */}
      <div className="stat-cards-grid">
        <StatCard
          title="Total Books"
          value={isLoading ? "..." : totalBooks}
          icon={BookOpen}
          badge="In Catalog"
          variant="primary"
          helperText="Computer Science & Engineering titles"
        />
        <StatCard
          title="Available Books"
          value={isLoading ? "..." : availableBooks}
          icon={CheckCircle2}
          badge={`${availablePct}% Shelf`}
          variant="success"
          helperText="Ready for immediate circulation"
        />
        <StatCard
          title="Issued Books"
          value={isLoading ? "..." : issuedBooks}
          icon={Clock}
          badge={`${issuedPct}% Borrowed`}
          variant="warning"
          helperText="Active member loans"
        />
        <StatCard
          title="Total Members"
          value={isLoading ? "..." : members}
          icon={Users}
          badge="Registered"
          variant="info"
          helperText="Students & Faculty patrons"
        />
        <StatCard
          title="Overdue Books"
          value={isLoading ? "..." : overdueBooks}
          icon={AlertTriangle}
          badge="Requires Action"
          variant="danger"
          helperText="Past loan return deadline"
        />
        <StatCard
          title="Total Fine Dues"
          value={isLoading ? "..." : `₹${totalFine}`}
          icon={CircleDollarSign}
          badge={`₹${unpaidFine} Pending`}
          variant="purple"
          helperText="Accumulated overdue charges"
        />
      </div>

      {/* Charts & Analytics Visual Summary */}
      <div className="dashboard-analytics-row">
        {/* Book Availability Ratio */}
        <div className="card analytics-card">
          <div className="card-header-clean">
            <div className="flex-center-gap">
              <PieIcon size={18} className="text-secondary" />
              <h3>Book Availability Distribution</h3>
            </div>
            <span className="badge-pill">RFID Tracked</span>
          </div>

          <div className="ratio-bar-wrapper">
            <div className="ratio-bar">
              <div className="ratio-segment segment-available" style={{ width: `${availablePct}%` }}></div>
              <div className="ratio-segment segment-issued" style={{ width: `${issuedPct}%` }}></div>
            </div>
            <div className="ratio-legend">
              <div className="legend-item">
                <span className="legend-dot bg-success"></span>
                <span>Available ({availableBooks} titles - {availablePct}%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot bg-warning"></span>
                <span>Issued ({issuedBooks} titles - {issuedPct}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Circulation Summary */}
        <div className="card analytics-card">
          <div className="card-header-clean">
            <div className="flex-center-gap">
              <TrendingUp size={18} className="text-secondary" />
              <h3>Monthly Circulation Activity</h3>
            </div>
            <span className="badge-pill">Recent Months</span>
          </div>

          <div className="activity-bars-list">
            <div className="activity-row">
              <span className="activity-month">July 2026</span>
              <div className="activity-track">
                <div className="activity-fill fill-july" style={{ width: "65%" }}></div>
              </div>
              <span className="activity-count">65 Issues</span>
            </div>
            <div className="activity-row">
              <span className="activity-month">August 2026</span>
              <div className="activity-track">
                <div className="activity-fill fill-august" style={{ width: "88%" }}></div>
              </div>
              <span className="activity-count">88 Issues</span>
            </div>
            <div className="activity-row">
              <span className="activity-month">September 2026</span>
              <div className="activity-track">
                <div className="activity-fill fill-september" style={{ width: "42%" }}></div>
              </div>
              <span className="activity-count">42 Issues (Ongoing)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Circulation Transactions Table */}
      <div className="recent-transactions-section">
        <div className="section-header-row">
          <div>
            <h3>Recent Circulation Transactions</h3>
            <p className="text-muted text-sm">Showing the latest automated issue, return, and overdue records.</p>
          </div>
          <Link to="/reports" className="btn-sm btn-outline">
            View Full Report
          </Link>
        </div>

        <TransactionTable transactions={recentTransactions} />
      </div>
    </div>
  );
}

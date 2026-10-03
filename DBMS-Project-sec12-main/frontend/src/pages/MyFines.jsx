import React, { useState, useEffect } from "react";
import {
  CircleDollarSign,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Clock,
  ShieldCheck,
  FileText
} from "lucide-react";
import StatCard from "../components/StatCard";
import api from "../api/client";

/**
 * My Fines & Overdue Dues Page (MyFines.jsx)
 * Displays overdue penalties and payment clearance strictly for the logged-in student.
 */
export default function MyFines() {
  const [data, setData] = useState({
    summary: {
      totalFine: 0,
      unpaidFine: 0,
      paidFine: 0,
      recordsCount: 0
    },
    fines: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFines = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get("/student/fines");
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load student fines:", err);
      setError(err.response?.data?.message || err.message || "Failed to load fine records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const { totalFine, unpaidFine, paidFine } = data.summary;

  return (
    <div className="circulation-page-container">
      <div className="page-header-actions-row">
        <div>
          <h2>My Fines & Dues</h2>
          <p className="text-muted text-sm">
            Review overdue charges incurred and verified payment receipts.
          </p>
        </div>
        <button
          onClick={fetchFines}
          className="btn-custom btn-outline flex-center-gap"
          title="Refresh Fine Records"
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

      {/* 3 Summary Stat Cards */}
      <div className="stat-cards-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginBottom: "24px" }}>
        <StatCard
          title="Total Penalties Incurred"
          value={isLoading ? "..." : `₹${totalFine}`}
          icon={CircleDollarSign}
          badge="Lifetime Charges"
          variant="purple"
          helperText="Total overdue fines calculated"
        />
        <StatCard
          title="Unpaid Dues Pending"
          value={isLoading ? "..." : `₹${unpaidFine}`}
          icon={AlertTriangle}
          badge={unpaidFine > 0 ? "Pay at Circulation Desk" : "Zero Balance"}
          variant={unpaidFine > 0 ? "danger" : "success"}
          helperText="Clear dues at the library counter"
        />
        <StatCard
          title="Paid & Cleared"
          value={isLoading ? "..." : `₹${paidFine}`}
          icon={ShieldCheck}
          badge="Settled"
          variant="success"
          helperText="Receipts validated and cleared"
        />
      </div>

      {/* Fines Table */}
      <div className="card">
        <div className="card-header-clean">
          <div>
            <h3>Penalty Ledger Records</h3>
            <p className="text-muted text-xs">Line-item breakdown of overdue calculations</p>
          </div>
          <span className="badge-pill">Daily rate: ₹5/day</span>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <RefreshCw size={24} className="animate-spin text-muted" />
            <p className="text-muted text-sm mt-2">Loading fine records...</p>
          </div>
        ) : data.fines.length === 0 ? (
          <div className="empty-state">
            <CheckCircle2 size={44} className="text-success" />
            <p className="empty-title mt-2">No Fines On Record!</p>
            <p className="empty-sub">
              You have maintained an exemplary borrowing record with zero pending or past dues.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Fine ID</th>
                  <th>Transaction ID</th>
                  <th>Book Title</th>
                  <th>Loan Due Date</th>
                  <th>Overdue Days</th>
                  <th>Amount</th>
                  <th>Payment Status</th>
                  <th>Settlement Date</th>
                </tr>
              </thead>
              <tbody>
                {data.fines.map((f) => {
                  const isUnpaid = f.fine_status === "Unpaid";
                  return (
                    <tr key={f.fine_id}>
                      <td className="font-mono text-muted">FN-{f.fine_id}</td>
                      <td className="font-mono text-muted">TR-{f.transaction_id}</td>
                      <td>
                        <div className="table-item-title">{f.book_title}</div>
                      </td>
                      <td className="text-muted text-xs">
                        <span className="flex-center-gap">
                          <Calendar size={12} />
                          {f.due_date || "—"}
                        </span>
                      </td>
                      <td>
                        <span className="font-medium text-danger">{f.overdue_days} days</span>
                      </td>
                      <td>
                        <strong style={{ fontSize: "1rem" }}>₹{parseFloat(f.fine_amount || 0)}</strong>
                      </td>
                      <td>
                        <span className={`status-pill ${isUnpaid ? "status-danger" : "status-available"}`}>
                          {isUnpaid ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                          {f.fine_status}
                        </span>
                      </td>
                      <td className="text-muted text-xs">
                        {f.paid_date ? (
                          <span className="text-success font-medium">{f.paid_date}</span>
                        ) : (
                          <span className="text-muted font-italic">Unsettled</span>
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

      {/* College Viva Policy Notice */}
      <div className="alert-box alert-info mt-6" style={{ alignItems: "flex-start" }}>
        <FileText size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
        <div>
          <strong style={{ display: "block", marginBottom: "4px" }}>Library Fine Settlement Policy:</strong>
          <span style={{ fontSize: "0.85rem", lineHeight: "1.5" }}>
            Overdue fines accumulate automatically at ₹5.00 per day after the loan due date expires. Fines must be paid at the main circulation counter before subsequent book issues can be authorized.
          </span>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { CircleDollarSign, CheckCircle2, Clock, AlertTriangle, Check, RefreshCw } from "lucide-react";
import StatCard from "../components/StatCard";
import Button from "../components/Button";
import SearchBar from "../components/SearchBar";
import api from "../api/client";
import { INITIAL_FINES, DEFAULT_FINE_RATE_PER_DAY } from "../data/sampleData";

/**
 * Fine & Dues Engine Page (Fines.jsx)
 * Connects to Express GET /api/fines and PUT /api/fines/:id/pay.
 */
export default function Fines() {
  const [fines, setFines] = useState(() => {
    const saved = localStorage.getItem("libraryFines");
    return saved ? JSON.parse(saved) : INITIAL_FINES;
  });

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch fines from Express API
  const fetchFines = async () => {
    setIsLoading(true);
    try {
      const q = filterStatus !== "ALL" ? `?status=${filterStatus}` : "";
      const res = await api.get(`/fines${q}`);
      if (res.data && Array.isArray(res.data)) {
        setFines(res.data);
        localStorage.setItem("libraryFines", JSON.stringify(res.data));
      }
    } catch (err) {
      console.error("API GET /fines error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, [filterStatus]);

  // Calculate Aggregates
  const totalFineGenerated = fines.reduce((sum, f) => sum + Number(f.fine_amount || 0), 0);
  const paidFines = fines
    .filter((f) => f.fine_status === "Paid")
    .reduce((sum, f) => sum + Number(f.fine_amount || 0), 0);
  const unpaidFines = fines
    .filter((f) => f.fine_status === "Unpaid")
    .reduce((sum, f) => sum + Number(f.fine_amount || 0), 0);

  // Pay Fine Action
  const handlePayFine = async (fineId) => {
    try {
      await api.put(`/fines/${fineId}/pay`);
      const updated = fines.map((f) => {
        if (f.fine_id === fineId) {
          return { ...f, fine_status: "Paid" };
        }
        return f;
      });

      setFines(updated);
      localStorage.setItem("libraryFines", JSON.stringify(updated));
      showToast(`Fine #${fineId} marked as PAID. Receipt cleared.`);
    } catch (err) {
      console.error("API PUT /fines/:id/pay error:", err);
      showToast(err.response?.data?.message || "Failed to mark fine as paid.");
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const filteredFines = fines.filter((f) => {
    const matchesSearch =
      (f.member_name && f.member_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.book_title && f.book_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      String(f.transaction_id).includes(searchTerm);

    const matchesStatus = filterStatus === "ALL" || f.fine_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fines-page">
      <div className="page-header-actions-row">
        <div>
          <h2>Fine & Dues Management Engine</h2>
          <p className="text-muted text-sm">
            Overdue penalty rate: <strong>₹{DEFAULT_FINE_RATE_PER_DAY} per day</strong>. View and clear outstanding dues.
          </p>
        </div>
      </div>

      {toastMessage && <div className="toast-notification">{toastMessage}</div>}

      {/* 3 Summary Cards */}
      <div className="stat-cards-grid">
        <StatCard
          title="Total Fine Generated"
          value={`₹${totalFineGenerated}`}
          icon={CircleDollarSign}
          badge="Cumulative"
          variant="primary"
          helperText="All overdue charges logged"
        />
        <StatCard
          title="Paid Fines"
          value={`₹${paidFines}`}
          icon={CheckCircle2}
          badge="Collected"
          variant="success"
          helperText="Cleared through library desk"
        />
        <StatCard
          title="Outstanding / Unpaid"
          value={`₹${unpaidFines}`}
          icon={AlertTriangle}
          badge="Pending"
          variant="danger"
          helperText="Currently due from members"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-toolbar card">
        <div className="filter-search-box">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search fine by Member Name, Book Title, or Tx ID..."
          />
        </div>
        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="Unpaid">Unpaid Dues Only</option>
            <option value="Paid">Paid Fines Only</option>
          </select>
        </div>
      </div>

      {isLoading && <div className="text-center py-2 text-muted"><RefreshCw size={18} className="animate-spin inline mr-2" />Syncing fine balances from MySQL...</div>}

      {/* Fines Table */}
      {filteredFines.length === 0 ? (
        <div className="empty-state card">
          <p className="empty-title">No fine records found</p>
          <p className="empty-sub">No overdue penalties match your criteria.</p>
        </div>
      ) : (
        <div className="table-responsive card">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Fine ID</th>
                <th>Tx ID</th>
                <th>Member</th>
                <th>Book Title</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Overdue Days</th>
                <th>Fine Amount</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFines.map((item) => {
                const isUnpaid = item.fine_status === "Unpaid";
                return (
                  <tr key={item.fine_id}>
                    <td className="font-mono text-muted">FN-{item.fine_id}</td>
                    <td className="font-mono text-xs">TR-{item.transaction_id}</td>
                    <td className="font-medium">{item.member_name}</td>
                    <td>{item.book_title}</td>
                    <td className="text-muted text-xs font-mono">{item.due_date}</td>
                    <td className="text-muted text-xs font-mono">{item.return_date || "-"}</td>
                    <td>
                      <span className="font-bold text-danger">{item.overdue_days} Days</span>
                    </td>
                    <td>
                      <span className="font-bold">₹{item.fine_amount}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${isUnpaid ? "status-danger" : "status-available"}`}>
                        {isUnpaid ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                        {item.fine_status}
                      </span>
                    </td>
                    <td className="text-right">
                      {isUnpaid ? (
                        <Button
                          size="sm"
                          variant="success"
                          icon={Check}
                          onClick={() => handlePayFine(item.fine_id)}
                        >
                          Mark Paid
                        </Button>
                      ) : (
                        <span className="text-muted text-xs font-medium">Receipt Cleared</span>
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

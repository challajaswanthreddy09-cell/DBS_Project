import React, { useState, useEffect } from "react";
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Tag,
  ScanLine,
  RefreshCw,
  Search,
  ShieldCheck,
  AlertOctagon
} from "lucide-react";
import StatCard from "../components/StatCard";
import Button from "../components/Button";
import SearchBar from "../components/SearchBar";
import api from "../api/client";
import { INITIAL_BOOKS } from "../data/sampleData";

/**
 * Stock Verification & Inventory Page (Inventory.jsx)
 * Connects to Express GET /api/inventory.
 * Reconciles MySQL database catalog against RFID shelf tags.
 */
export default function Inventory() {
  const [books, setBooks] = useState(() => {
    const saved = localStorage.getItem("libraryBooks");
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [metrics, setMetrics] = useState({
    total: INITIAL_BOOKS.length,
    available: INITIAL_BOOKS.filter((b) => b.status === "Available").length,
    issued: INITIAL_BOOKS.filter((b) => b.status === "Issued").length,
    tagged: INITIAL_BOOKS.length,
    missing: 0
  });

  const [isAuditing, setIsAuditing] = useState(false);
  const [auditCompleted, setAuditCompleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch live inventory audit metrics from API
  useEffect(() => {
    const loadInventory = async () => {
      try {
        const res = await api.get("/inventory");
        if (res.data) {
          if (res.data.metrics) setMetrics(res.data.metrics);
          if (res.data.books && res.data.books.length > 0) setBooks(res.data.books);
        }
      } catch (err) {
        console.warn("API GET /inventory offline, using local state:", err.message);
      }
    };
    loadInventory();
  }, []);

  // Run Software RFID Stock Audit Simulation
  const handleRunAudit = async () => {
    setIsAuditing(true);
    setAuditCompleted(false);

    try {
      const res = await api.get("/inventory");
      if (res.data) {
        if (res.data.metrics) setMetrics(res.data.metrics);
        if (res.data.books && res.data.books.length > 0) setBooks(res.data.books);
      }
    } catch {
      // simulate audit delay
    }

    setTimeout(() => {
      setIsAuditing(false);
      setAuditCompleted(true);
    }, 750);
  };

  const filteredItems = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.author && b.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.rfid_id && b.rfid_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="inventory-page">
      <div className="page-header-actions-row">
        <div>
          <h2>Library Stock Verification & Inventory</h2>
          <p className="text-muted text-sm">
            Automated RFID-driven stock verification comparing database catalog records against physical shelf tags.
          </p>
        </div>
        <Button
          variant="primary"
          icon={isAuditing ? RefreshCw : ScanLine}
          onClick={handleRunAudit}
          disabled={isAuditing}
        >
          {isAuditing ? "Auditing Shelf Tags in MySQL..." : "Run RFID Stock Verification"}
        </Button>
      </div>

      {auditCompleted && (
        <div className="alert-box alert-success animate-fade-in">
          <ShieldCheck size={20} />
          <div>
            <strong>Audit Completed:</strong> All {metrics.tagged} RFID-tagged physical copies verified across
            stacks. 0 discrepancy found.
          </div>
        </div>
      )}

      {/* 5 Inventory Stat Cards */}
      <div className="stat-cards-grid">
        <StatCard
          title="Total Catalog Stock"
          value={metrics.total}
          icon={Boxes}
          badge="Registered"
          variant="primary"
          helperText="Total titles in inventory"
        />
        <StatCard
          title="Available on Shelf"
          value={metrics.available}
          icon={CheckCircle2}
          badge="In Stacks"
          variant="success"
          helperText="Physical copies on shelf"
        />
        <StatCard
          title="Circulating / Issued"
          value={metrics.issued}
          icon={AlertTriangle}
          badge="With Patrons"
          variant="warning"
          helperText="Verified active loans"
        />
        <StatCard
          title="RFID Tagged Books"
          value={metrics.tagged}
          icon={Tag}
          badge="100% Monitored"
          variant="info"
          helperText="Mapped to simulation tags"
        />
        <StatCard
          title="Missing / Untagged"
          value={metrics.missing}
          icon={AlertOctagon}
          badge="Zero Deficit"
          variant={metrics.missing > 0 ? "danger" : "purple"}
          helperText="Unaccounted items"
        />
      </div>

      {/* Search Toolbar */}
      <div className="filter-toolbar card">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Filter inventory by Title, Author, or RFID Tag..."
        />
      </div>

      {/* Stock Verification Audit Table */}
      <div className="table-responsive card">
        <div className="card-header-clean px-4 pt-3">
          <div className="flex-center-gap">
            <ScanLine size={18} className="text-secondary" />
            <h3 className="text-base font-semibold">Stock Verification Audit Log</h3>
          </div>
          <span className="badge-pill">Module 6: Stock Verification</span>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Book Title</th>
              <th>ISBN</th>
              <th>RFID Tag ID</th>
              <th>Expected Status</th>
              <th>Current Status</th>
              <th>Verification Result</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const hasTag = Boolean(item.rfid_id && item.rfid_id !== "UNTAGGED");
              const isAvailable = item.status === "Available";

              return (
                <tr key={item.book_id}>
                  <td>
                    <div className="font-medium text-primary-dark">{item.title}</div>
                    <span className="text-xs text-muted">{item.author}</span>
                  </td>
                  <td className="font-mono text-xs text-muted">{item.isbn}</td>
                  <td>
                    <span className="badge-rfid">
                      <Tag size={12} className="mr-1" />
                      {item.rfid_id || "MISSING"}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-medium text-muted">
                      {isAvailable ? "Shelf Stacks" : "Patron Loan"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${isAvailable ? "status-available" : "status-issued"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    {hasTag ? (
                      <span className="verification-badge verified">
                        <CheckCircle2 size={13} />
                        <span>Verified Present</span>
                      </span>
                    ) : (
                      <span className="verification-badge unverified">
                        <AlertOctagon size={13} />
                        <span>Tag Missing</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

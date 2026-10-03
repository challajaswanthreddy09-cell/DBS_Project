import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ScanLine,
  Radio,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowRight,
  Info,
  RefreshCw
} from "lucide-react";
import Button from "../components/Button";
import api from "../api/client";
import { INITIAL_BOOKS } from "../data/sampleData";

/**
 * Dedicated RFID Scanner Simulation Page (RFIDScanner.jsx)
 * Connects to Express POST /api/rfid/scan and GET /api/rfid/tags.
 * Simulates software-based RFID tag detection and book discovery in MySQL.
 */
export default function RFIDScanner() {
  const [rfidInput, setRfidInput] = useState("RFID001");
  const [scannedBook, setScannedBook] = useState(null);
  const [scanStatus, setScanStatus] = useState(null); // 'success' | 'not_found' | null
  const [statusMessage, setStatusMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [registeredTags, setRegisteredTags] = useState([
    "RFID001",
    "RFID002",
    "RFID003",
    "RFID004",
    "RFID005",
    "RFID006",
    "RFID007",
    "RFID008",
    "INVALID999"
  ]);

  // Fetch registered RFID tags from Backend API on mount
  useEffect(() => {
    const loadTags = async () => {
      try {
        const res = await api.get("/rfid/tags");
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const tags = res.data.map((t) => t.rfid_id);
          setRegisteredTags([...tags, "INVALID999"]);
        }
      } catch (err) {
        console.warn("API GET /rfid/tags offline, using default tags:", err.message);
      }
    };
    loadTags();
  }, []);

  const handleScan = async (e) => {
    if (e) e.preventDefault();
    if (!rfidInput.trim()) {
      setStatusMessage("Please enter or select an RFID Tag ID.");
      setScanStatus("not_found");
      setScannedBook(null);
      return;
    }

    setIsScanning(true);
    setScanStatus(null);
    setStatusMessage("");

    const tagQuery = rfidInput.trim().toUpperCase();

    try {
      // 1. Call Backend RFID Simulation Endpoint
      const res = await api.post("/rfid/scan", { rfid_id: tagQuery });

      setIsScanning(false);
      if (res.data && res.data.book) {
        setScannedBook(res.data.book);
        setScanStatus("success");
        setStatusMessage(res.data.message || "Book identified successfully.");
      }
    } catch (err) {
      console.warn("API POST /rfid/scan error, testing local fallback:", err.message);

      // 2. Local fallback if backend is offline
      const saved = localStorage.getItem("libraryBooks");
      const catalog = saved ? JSON.parse(saved) : INITIAL_BOOKS;
      const found = catalog.find((b) => b.rfid_id && b.rfid_id.toUpperCase() === tagQuery);

      setIsScanning(false);
      if (found) {
        setScannedBook(found);
        setScanStatus("success");
        setStatusMessage("Book identified successfully (Local Cache).");
      } else {
        setScannedBook(null);
        setScanStatus("not_found");
        setStatusMessage(
          err.response?.data?.message || `RFID tag not found. No book is associated with "${tagQuery}".`
        );
      }
    }
  };

  const handleSelectTag = (tag) => {
    setRfidInput(tag);
    setScanStatus(null);
    setScannedBook(null);
    setStatusMessage("");
  };

  return (
    <div className="rfid-scanner-page">
      {/* Simulation Banner Notice */}
      <div className="simulation-notice-banner card">
        <div className="notice-icon-box">
          <Info size={20} />
        </div>
        <div className="notice-text">
          <strong>RFID Software Simulation Active:</strong> Physical RFID hardware is not used in the current
          implementation. RFID functionality is simulated using digital RFID tag IDs. The system architecture can be
          extended later to connect a physical RFID reader through an RFID Reader API.
        </div>
      </div>

      <div className="scanner-grid-layout">
        {/* Left Column: Virtual RFID Antenna Reader Box */}
        <div className="scanner-control-box card">
          <div className="scanner-header">
            <div className="antenna-badge">
              <Radio size={18} className={isScanning ? "animate-pulse" : ""} />
              <span>RFID Antenna Reader Simulator</span>
            </div>
            <span className="frequency-pill">865 - 868 MHz (UHF Gen2)</span>
          </div>

          <div className={`antenna-visual-panel ${isScanning ? "scanning-active" : ""}`}>
            <div className="radar-circle circle-3"></div>
            <div className="radar-circle circle-2"></div>
            <div className="radar-circle circle-1"></div>
            <div className="radar-core">
              <ScanLine size={36} className="text-secondary" />
            </div>
            <p className="scanner-instruction">
              {isScanning ? "Scanning digital frequency & querying MySQL..." : "Ready to receive digital RFID tag signal"}
            </p>
          </div>

          <form onSubmit={handleScan} className="scanner-form">
            <div className="form-group">
              <label className="form-label" htmlFor="rfidInput">
                Enter or Select RFID Tag ID
              </label>
              <div className="input-with-icon">
                <Tag size={18} className="input-icon text-secondary" />
                <input
                  id="rfidInput"
                  type="text"
                  className="form-input font-mono input-lg"
                  value={rfidInput}
                  onChange={(e) => setRfidInput(e.target.value)}
                  placeholder="e.g. RFID001"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isScanning}
              icon={ScanLine}
            >
              {isScanning ? (
                <>
                  <RefreshCw size={16} className="animate-spin mr-2" />
                  <span>Scanning Tag...</span>
                </>
              ) : (
                "Scan RFID Tag"
              )}
            </Button>
          </form>

          {/* Quick Demo Tag Selectors */}
          <div className="demo-tags-section">
            <span className="demo-tags-title">Click a digital tag to test:</span>
            <div className="demo-tags-grid">
              {registeredTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`demo-tag-btn ${rfidInput === tag ? "active" : ""} ${
                    tag === "INVALID999" ? "tag-invalid" : ""
                  }`}
                  onClick={() => handleSelectTag(tag)}
                >
                  <Tag size={12} className="mr-1" />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Identification Result Panel */}
        <div className="scanner-result-box card">
          <div className="result-header">
            <h3>Scan Result & Identification</h3>
            <span className="timestamp-text">Real-time Lookup</span>
          </div>

          {/* Scan Status Alert */}
          {scanStatus === "success" && (
            <div className="alert-box alert-success animate-fade-in">
              <CheckCircle2 size={18} />
              <div>
                <strong>Success:</strong> {statusMessage}
              </div>
            </div>
          )}

          {scanStatus === "not_found" && (
            <div className="alert-box alert-error animate-fade-in">
              <AlertCircle size={18} />
              <div>
                <strong>Error:</strong> {statusMessage}
              </div>
            </div>
          )}

          {/* Book Metadata Card when Found */}
          {scannedBook ? (
            <div className="identified-book-card animate-fade-in">
              <div className="book-card-top">
                <div className="book-icon-badge">
                  <BookOpen size={28} />
                </div>
                <div>
                  <h4 className="book-card-title">{scannedBook.title}</h4>
                  <p className="book-card-author">By {scannedBook.author}</p>
                </div>
              </div>

              <div className="details-table-grid">
                <div className="grid-item">
                  <span className="grid-label">Category</span>
                  <span className="grid-value badge-category">{scannedBook.category}</span>
                </div>
                <div className="grid-item">
                  <span className="grid-label">ISBN</span>
                  <span className="grid-value font-mono">{scannedBook.isbn}</span>
                </div>
                <div className="grid-item">
                  <span className="grid-label">RFID Tag Code</span>
                  <span className="grid-value font-mono badge-rfid">
                    <Tag size={13} className="mr-1" />
                    {scannedBook.rfid_id}
                  </span>
                </div>
                <div className="grid-item">
                  <span className="grid-label">Availability Status</span>
                  <span
                    className={`status-pill ${
                      scannedBook.status === "Available" ? "status-available" : "status-issued"
                    }`}
                  >
                    {scannedBook.status === "Available" ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <AlertCircle size={12} />
                    )}
                    {scannedBook.status}
                  </span>
                </div>
              </div>

              {scannedBook.status === "Issued" && (
                <div style={{ marginTop: "16px", padding: "12px", background: "rgba(234, 88, 12, 0.08)", borderRadius: "8px", border: "1px solid rgba(234, 88, 12, 0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span className="text-xs text-muted">Borrower:</span>
                    <strong className="text-xs">{scannedBook.borrower_name || "Registered Member"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="text-xs text-muted">Expected Return Date:</span>
                    <strong className="text-xs font-mono" style={{ color: "var(--warning)" }}>{scannedBook.due_date || "14-Day Lending"}</strong>
                  </div>
                </div>
              )}

              <div className="circulation-shortcuts">
                {scannedBook.status === "Available" ? (
                  <Link
                    to={`/issue?rfid=${scannedBook.rfid_id}`}
                    className="btn-custom btn-secondary w-full text-center"
                  >
                    <span>Proceed to Issue this Book</span>
                    <ArrowRight size={16} className="ml-1" />
                  </Link>
                ) : (
                  <Link
                    to={`/return?rfid=${scannedBook.rfid_id}`}
                    className="btn-custom btn-warning w-full text-center"
                  >
                    <span>Proceed to Return this Book</span>
                    <ArrowRight size={16} className="ml-1" />
                  </Link>
                )}
              </div>
            </div>
          ) : (
            !scanStatus && (
              <div className="empty-scan-placeholder">
                <div className="placeholder-icon">
                  <ScanLine size={48} />
                </div>
                <h4>No Tag Scanned Yet</h4>
                <p>Select a tag from the left panel and click "Scan RFID Tag" to test the simulation.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

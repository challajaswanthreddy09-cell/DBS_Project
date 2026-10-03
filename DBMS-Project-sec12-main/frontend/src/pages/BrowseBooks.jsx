import React, { useState, useEffect } from "react";
import { BookOpen, Tag, CheckCircle2, AlertCircle, Filter, RefreshCw, Eye } from "lucide-react";
import BookTable from "../components/BookTable";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import Button from "../components/Button";
import api from "../api/client";

/**
 * Browse Books Catalog (BrowseBooks.jsx)
 * Read-only catalog view for students to search and check availability of titles.
 */
export default function BrowseBooks() {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBook, setSelectedBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append("search", searchTerm.trim());
      if (categoryFilter !== "ALL") params.append("category", categoryFilter);
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const queryString = params.toString();
      const endpoint = queryString ? `/student/books?${queryString}` : "/student/books";
      const res = await api.get(endpoint);

      if (res.data && Array.isArray(res.data)) {
        setBooks(res.data);
      } else {
        setBooks([]);
      }
    } catch (err) {
      console.error("Failed to load catalog for student:", err);
      setError(err.response?.data?.message || err.message || "Failed to load book catalog.");
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks();
    }, 150);
    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter, statusFilter]);

  const categories = [
    "ALL",
    "Database",
    "Operating Systems",
    "Networking",
    "Software Engineering",
    "Data Structures",
    "Programming",
    "Algorithms",
    "Computer Architecture",
    "Artificial Intelligence"
  ];

  const totalCount = books.length;
  const availableCount = books.filter((b) => b.status === "Available").length;
  const issuedCount = books.filter((b) => b.status === "Issued").length;

  return (
    <div className="books-page-container">
      {/* Header Bar */}
      <div className="page-header-actions-row">
        <div>
          <h2>Browse Library Catalog</h2>
          <p className="text-muted text-sm">
            Search physical titles, view shelf availability, and locate books in the college library.
          </p>
        </div>
        <div className="badge-pill" style={{ background: "#EEF2FF", color: "#4F46E5", fontWeight: 600, padding: "8px 14px" }}>
          Student View • Read-Only
        </div>
      </div>

      {error && (
        <div className="alert-box alert-error mb-4">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Availability Metrics Strip */}
      <div className="stat-cards-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginBottom: "20px" }}>
        <div className="card" style={{ padding: "14px" }}>
          <span className="text-muted text-xs uppercase" style={{ fontWeight: 600 }}>Total Books</span>
          <h3 style={{ fontSize: "1.5rem", margin: "2px 0" }}>{isLoading ? "..." : totalCount}</h3>
          <span className="text-muted text-xs">Catalog titles registered</span>
        </div>
        <div className="card" style={{ padding: "14px" }}>
          <span className="text-muted text-xs uppercase" style={{ fontWeight: 600 }}>Available on Shelf</span>
          <h3 style={{ fontSize: "1.5rem", margin: "2px 0", color: "var(--success)" }}>{isLoading ? "..." : availableCount}</h3>
          <span className="text-muted text-xs">Eligible for issue</span>
        </div>
        <div className="card" style={{ padding: "14px" }}>
          <span className="text-muted text-xs uppercase" style={{ fontWeight: 600 }}>Currently Issued</span>
          <h3 style={{ fontSize: "1.5rem", margin: "2px 0", color: "var(--warning)" }}>{isLoading ? "..." : issuedCount}</h3>
          <span className="text-muted text-xs">Borrowed by members</span>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="filter-panel card" style={{ marginBottom: "20px" }}>
        <div className="filter-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm("")}
            placeholder="Search by title, author, or ISBN..."
          />

          <div className="filter-group">
            <label className="filter-label">Filter by Category</label>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "ALL" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Shelf Status</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Available">Available Only</option>
              <option value="Issued">Issued Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Book Catalog Table (Read-Only: onView only, no onEdit, no onDelete) */}
      {isLoading ? (
        <div className="card empty-state">
          <RefreshCw size={28} className="animate-spin text-muted" />
          <p className="empty-title mt-2">Loading catalog titles...</p>
        </div>
      ) : (
        <BookTable
          books={books}
          onView={(book) => setSelectedBook(book)}
        />
      )}

      {/* View Book Details Modal */}
      {selectedBook && (
        <Modal
          isOpen={Boolean(selectedBook)}
          onClose={() => setSelectedBook(null)}
          title="Book Details & Availability"
          size="md"
        >
          <div className="book-detail-modal-body">
            <div className="detail-hero-box card">
              <div className="detail-icon-circle">
                <BookOpen size={32} className="text-secondary" />
              </div>
              <div className="detail-hero-text">
                <h3>{selectedBook.title}</h3>
                <p className="text-muted">By {selectedBook.author}</p>
                <div className="detail-tags-row mt-2">
                  <span className="badge-category">{selectedBook.category}</span>
                  <span
                    className={`status-pill ${
                      selectedBook.status === "Available" ? "status-available" : "status-issued"
                    }`}
                  >
                    {selectedBook.status === "Available" ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <AlertCircle size={12} />
                    )}
                    {selectedBook.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-meta-grid">
              <div className="meta-item">
                <span className="meta-label">ISBN Reference:</span>
                <span className="meta-value font-mono">{selectedBook.isbn}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Database Record ID:</span>
                <span className="meta-value font-mono">#{selectedBook.book_id}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Digital RFID Tag ID:</span>
                <span className="meta-value font-mono text-secondary font-bold">
                  {selectedBook.rfid_id || "Unassigned"}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Circulation Status:</span>
                <span className="meta-value">
                  {selectedBook.status === "Available" ? (
                    <span className="text-success font-medium">Ready for Issue at Desk</span>
                  ) : (
                    <span className="text-warning font-medium">Currently on Loan</span>
                  )}
                </span>
              </div>
            </div>

            <div className="alert-box alert-info mt-4">
              <span className="text-xs">
                To borrow this title, note the Book Title and present your Student ID at the Circulation Desk.
              </span>
            </div>

            <div className="modal-actions-right mt-6">
              <Button variant="primary" onClick={() => setSelectedBook(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

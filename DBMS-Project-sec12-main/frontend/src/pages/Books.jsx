import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, BookOpen, Tag, CheckCircle2, AlertCircle, Filter, RefreshCw } from "lucide-react";
import BookTable from "../components/BookTable";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import Button from "../components/Button";
import api from "../api/client";

/**
 * Books Catalog Page (Books.jsx)
 * Connected directly to Express backend GET /api/books querying MySQL database.
 * No hardcoded book records or sample data used.
 */
export default function Books() {
  const navigate = useNavigate();
  // State populated strictly from backend API
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBook, setSelectedBook] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch books directly from Express API -> MySQL
  const fetchBooks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append("search", searchTerm.trim());
      if (categoryFilter !== "ALL") params.append("category", categoryFilter);
      if (statusFilter !== "ALL") params.append("status", statusFilter);

      const queryString = params.toString();
      const endpoint = queryString ? `/books?${queryString}` : "/books";
      const res = await api.get(endpoint);

      if (res.data && Array.isArray(res.data)) {
        setBooks(res.data);
      } else {
        setBooks([]);
      }
    } catch (err) {
      console.error("Failed to load books from backend:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Could not connect to backend server at http://localhost:5000. Please ensure the backend is running."
      );
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

  // Categories list for filtering
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

  // Handle book deletion via API
  const handleDeleteBook = async (id) => {
    if (window.confirm("Are you sure you want to remove this book from the catalog?")) {
      try {
        await api.delete(`/books/${id}`);
        showToast("Book removed from catalog successfully.");
        // Re-fetch fresh books list from MySQL
        fetchBooks();
      } catch (err) {
        console.error("API DELETE /books/:id error:", err);
        showToast("Failed to delete book: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <div className="catalog-page">
      {/* Page Header Bar */}
      <div className="page-header-actions-row">
        <div>
          <h2>Book Catalog & RFID Tags</h2>
          <p className="text-muted text-sm">Browse, filter, and manage library titles and their mapped RFID tags.</p>
        </div>
        <Link to="/books/add" className="btn-custom btn-primary">
          <Plus size={16} className="mr-1" />
          <span>Add New Book</span>
        </Link>
      </div>

      {toastMessage && <div className="toast-notification">{toastMessage}</div>}

      {/* Search & Filter Toolbar */}
      <div className="filter-toolbar card">
        <div className="filter-search-box">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by Title, Author, ISBN, or RFID Tag..."
          />
        </div>

        <div className="filter-controls">
          <div className="select-with-label">
            <Filter size={14} className="text-muted" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "ALL" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div>

          <div className="select-with-label">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="Available">Available Only</option>
              <option value="Issued">Issued Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && books.length === 0 && (
        <div className="card text-center" style={{ padding: "48px 24px", textAlign: "center" }}>
          <RefreshCw size={28} className="animate-spin text-primary" style={{ margin: "0 auto 16px auto", display: "block" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-main)" }}>Loading Book Catalog...</h3>
          <p className="text-muted text-sm" style={{ marginTop: "4px" }}>Fetching real book records from MySQL database via Express API</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="card" style={{ padding: "32px 24px", textAlign: "center", borderLeft: "4px solid var(--danger)" }}>
          <AlertCircle size={32} className="text-danger" style={{ margin: "0 auto 12px auto", display: "block" }} />
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--danger)" }}>Failed to Load Books</h3>
          <p className="text-muted text-sm" style={{ marginTop: "6px", maxWidth: "520px", margin: "6px auto 16px auto" }}>{error}</p>
          <Button variant="primary" onClick={fetchBooks}>
            <RefreshCw size={14} className="mr-1" />
            <span>Retry Connection</span>
          </Button>
        </div>
      )}

      {/* Book Catalog Table or Empty State */}
      {!error && (books.length > 0 || !isLoading) && (
        <>
          {isLoading && books.length > 0 && (
            <div className="text-center py-2 text-muted text-sm" style={{ marginBottom: "8px" }}>
              <RefreshCw size={14} className="animate-spin inline mr-2" />
              Syncing with MySQL Database...
            </div>
          )}
          <BookTable
            books={books}
            onView={(book) => setSelectedBook(book)}
            onEdit={(book) => navigate(`/books/edit/${book.book_id}`)}
            onDelete={handleDeleteBook}
          />
        </>
      )}


      {/* Book Details Modal */}
      {selectedBook && (
        <Modal
          isOpen={Boolean(selectedBook)}
          onClose={() => setSelectedBook(null)}
          title="Book Details & RFID Information"
          footer={
            <Button variant="outline" onClick={() => setSelectedBook(null)}>
              Close
            </Button>
          }
        >
          <div className="book-modal-details">
            <div className="modal-item-highlight">
              <BookOpen size={24} className="text-primary" />
              <div>
                <h4>{selectedBook.title}</h4>
                <p className="text-muted">{selectedBook.author}</p>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="info-block">
                <span className="info-label">Category</span>
                <span className="info-val">{selectedBook.category}</span>
              </div>
              <div className="info-block">
                <span className="info-label">ISBN Number</span>
                <span className="info-val font-mono">{selectedBook.isbn}</span>
              </div>
              <div className="info-block">
                <span className="info-label">RFID Tag ID</span>
                <span className="info-val font-mono badge-rfid">
                  <Tag size={13} className="mr-1" />
                  {selectedBook.rfid_id}
                </span>
              </div>
              <div className="info-block">
                <span className="info-label">Current Status</span>
                <span
                  className={`status-pill ${
                    selectedBook.status === "Available" ? "status-available" : "status-issued"
                  }`}
                >
                  {selectedBook.status === "Available" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  {selectedBook.status}
                </span>
              </div>

              {selectedBook.status === "Issued" && (
                <div className="info-block" style={{ gridColumn: "1 / -1", background: "rgba(234, 88, 12, 0.08)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(234, 88, 12, 0.2)" }}>
                  <span className="info-label" style={{ color: "var(--warning)", fontWeight: 600, marginBottom: "6px", display: "block" }}>
                    Active Circulation / Loan Details:
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <div>
                      <span className="text-muted text-xs" style={{ display: "block" }}>Borrower:</span>
                      <strong className="text-sm">{selectedBook.borrower_name || "Registered Member"}</strong>
                    </div>
                    <div>
                      <span className="text-muted text-xs" style={{ display: "block" }}>Expected Return Date (Due Date):</span>
                      <strong className="text-sm font-mono" style={{ color: "var(--warning)" }}>{selectedBook.due_date || "14-Day Lending"}</strong>
                    </div>
                    <div>
                      <span className="text-muted text-xs" style={{ display: "block" }}>Issue Date:</span>
                      <span className="text-xs font-mono">{selectedBook.issue_date || "-"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

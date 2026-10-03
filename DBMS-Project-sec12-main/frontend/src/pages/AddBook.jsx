import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookPlus, ArrowLeft, Tag, Check, AlertCircle, RefreshCw } from "lucide-react";
import Button from "../components/Button";
import api from "../api/client";
import { INITIAL_BOOKS } from "../data/sampleData";

/**
 * Add Book Page (AddBook.jsx)
 * Connects to Express POST /api/books to insert book & link rfid_tags row in MySQL.
 */
export default function AddBook() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "Database",
    isbn: "",
    rfid_id: `RFID0${Math.floor(Math.random() * 90 + 10)}`,
    status: "Available"
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title.trim() || !form.author.trim() || !form.isbn.trim() || !form.rfid_id.trim()) {
      setError("Please complete all required book metadata fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Send to Express Backend API -> MySQL
      await api.post("/books", {
        title: form.title.trim(),
        author: form.author.trim(),
        category: form.category,
        isbn: form.isbn.trim(),
        rfid_id: form.rfid_id.trim().toUpperCase(),
        status: form.status
      });

      setSuccess("Book registered and RFID tag mapped successfully in MySQL!");
      setTimeout(() => {
        navigate("/books");
      }, 800);
    } catch (err) {
      console.error("API POST /books error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to register book in database.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-page-container">
      <div className="form-header-bar">
        <Link to="/books" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </Link>
        <h2>Register New Book & Map RFID</h2>
      </div>

      <div className="form-card-wrap card">
        <div className="form-card-intro">
          <div className="form-icon-badge">
            <BookPlus size={24} />
          </div>
          <div>
            <h3>Book Registration Form</h3>
            <p className="text-muted text-sm">Assign title, author, category, and link a digital RFID simulation tag.</p>
          </div>
        </div>

        {error && (
          <div className="alert-box alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert-box alert-success">
            <Check size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="standard-form">
          <div className="form-row">
            <div className="form-group flex-2">
              <label className="form-label" htmlFor="title">
                Book Title *
              </label>
              <input
                id="title"
                type="text"
                className="form-input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Distributed Systems: Concepts and Design"
                required
              />
            </div>

            <div className="form-group flex-1">
              <label className="form-label" htmlFor="category">
                Category *
              </label>
              <select
                id="category"
                className="form-select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label" htmlFor="author">
                Author(s) *
              </label>
              <input
                id="author"
                type="text"
                className="form-input"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="e.g. George Coulouris, Jean Dollimore"
                required
              />
            </div>

            <div className="form-group flex-1">
              <label className="form-label" htmlFor="isbn">
                ISBN Number *
              </label>
              <input
                id="isbn"
                type="text"
                className="form-input"
                value={form.isbn}
                onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                placeholder="e.g. 978-0132143011"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label" htmlFor="rfid_id">
                Assigned RFID Tag ID *
              </label>
              <div className="input-with-icon">
                <Tag size={16} className="input-icon text-secondary" />
                <input
                  id="rfid_id"
                  type="text"
                  className="form-input font-mono"
                  value={form.rfid_id}
                  onChange={(e) => setForm({ ...form, rfid_id: e.target.value })}
                  placeholder="e.g. RFID011"
                  required
                />
              </div>
              <small className="form-hint">Unique digital RFID simulation tag code.</small>
            </div>

            <div className="form-group flex-1">
              <label className="form-label" htmlFor="status">
                Initial Status
              </label>
              <select
                id="status"
                className="form-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Available">Available (On Shelf)</option>
                <option value="Issued">Issued (On Loan)</option>
              </select>
            </div>
          </div>

          <div className="form-actions-row">
            <Button type="button" variant="outline" onClick={() => navigate("/books")} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin mr-1" />
                  <span>Saving...</span>
                </>
              ) : (
                "Save Book & Tag"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

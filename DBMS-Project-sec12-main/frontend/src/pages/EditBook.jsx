import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Edit3, ArrowLeft, Tag, Check, AlertCircle } from "lucide-react";
import Button from "../components/Button";
import api from "../api/client";
import { INITIAL_BOOKS } from "../data/sampleData";

/**
 * Edit Book Page (EditBook.jsx)
 * Update existing book metadata and assigned RFID tag.
 * Connects to Express PUT /api/books/:id and GET /api/books/:id.
 */
export default function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    isbn: "",
    rfid_id: "",
    status: "Available"
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [notFound, setNotFound] = useState(false);

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

  useEffect(() => {
    const loadBook = async () => {
      try {
        const res = await api.get(`/books/${id}`);
        if (res.data) {
          const b = res.data;
          setForm({
            title: b.title || "",
            author: b.author || "",
            category: b.category || "Database",
            isbn: b.isbn || "",
            rfid_id: b.rfid_id || "",
            status: b.status || "Available"
          });
          return;
        }
      } catch (err) {
        console.warn("Backend GET /books/:id offline, reading local storage");
      }

      const saved = localStorage.getItem("libraryBooks");
      const existingBooks = saved ? JSON.parse(saved) : INITIAL_BOOKS;
      const bookToEdit = existingBooks.find((b) => String(b.book_id) === String(id));

      if (bookToEdit) {
        setForm({
          title: bookToEdit.title || "",
          author: bookToEdit.author || "",
          category: bookToEdit.category || "Database",
          isbn: bookToEdit.isbn || "",
          rfid_id: bookToEdit.rfid_id || "",
          status: bookToEdit.status || "Available"
        });
      } else {
        setNotFound(true);
      }
    };
    loadBook();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim() || !form.author.trim() || !form.isbn.trim() || !form.rfid_id.trim()) {
      setError("All fields are required.");
      return;
    }

    const saved = localStorage.getItem("libraryBooks");
    const existingBooks = saved ? JSON.parse(saved) : INITIAL_BOOKS;

    // Check duplicate ISBN on other books
    const duplicateIsbn = existingBooks.some(
      (b) => String(b.book_id) !== String(id) && b.isbn.trim() === form.isbn.trim()
    );
    if (duplicateIsbn) {
      setError(`Another book already uses ISBN ${form.isbn}.`);
      return;
    }

    // Check duplicate RFID on other books
    const duplicateRfid = existingBooks.some(
      (b) =>
        String(b.book_id) !== String(id) &&
        b.rfid_id &&
        b.rfid_id.toLowerCase() === form.rfid_id.trim().toLowerCase()
    );
    if (duplicateRfid) {
      setError(`RFID Tag ID ${form.rfid_id} is already mapped to another book.`);
      return;
    }

    try {
      await api.put(`/books/${id}`, {
        title: form.title.trim(),
        author: form.author.trim(),
        category: form.category,
        isbn: form.isbn.trim(),
        rfid_id: form.rfid_id.trim().toUpperCase(),
        status: form.status
      });

      setSuccess("Book information updated successfully in MySQL database!");
      setTimeout(() => {
        navigate("/books");
      }, 800);
    } catch (err) {
      console.error("Backend PUT /books/:id error:", err);
      setError(err.response?.data?.message || err.message || "Failed to update book in database.");
    }
  };

  if (notFound) {
    return (
      <div className="empty-state card">
        <h3>Book Not Found</h3>
        <p>No book exists with ID #{id}.</p>
        <Link to="/books" className="btn-custom btn-primary mt-3">
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="form-page-container">
      <div className="form-header-bar">
        <Link to="/books" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </Link>
        <h2>Edit Book #{id}</h2>
      </div>

      <div className="form-card-wrap card">
        <div className="form-card-intro">
          <div className="form-icon-badge">
            <Edit3 size={24} />
          </div>
          <div>
            <h3>Modify Book Metadata</h3>
            <p className="text-muted text-sm">Update title, author, category, or RFID mapping for this title.</p>
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
                  required
                />
              </div>
            </div>

            <div className="form-group flex-1">
              <label className="form-label" htmlFor="status">
                Availability Status
              </label>
              <select
                id="status"
                className="form-select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Available">Available</option>
                <option value="Issued">Issued</option>
              </select>
            </div>
          </div>

          <div className="form-actions-row">
            <Button type="button" variant="outline" onClick={() => navigate("/books")}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update Book
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

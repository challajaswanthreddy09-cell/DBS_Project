import React from "react";
import { Eye, Edit3, Trash2, Tag, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * Reusable Book Table Component
 * Displays book catalog records with RFID identifiers and action triggers.
 */
export default function BookTable({ books, onView, onEdit, onDelete }) {
  if (!books || books.length === 0) {
    return (
      <div className="empty-state card">
        <p className="empty-title">No books found</p>
        <p className="empty-sub">Try adjusting your search query or category filters.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive card">
      <table className="custom-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Book Title</th>
            <th>Author</th>
            <th>Category</th>
            <th>ISBN</th>
            <th>RFID Tag ID</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => {
            const isAvailable = book.status === "Available";
            return (
              <tr key={book.book_id}>
                <td className="font-mono text-muted">#{book.book_id}</td>
                <td>
                  <div className="table-item-title">{book.title}</div>
                </td>
                <td className="text-muted">{book.author}</td>
                <td>
                  <span className="badge-category">{book.category}</span>
                </td>
                <td className="font-mono text-xs">{book.isbn}</td>
                <td>
                  <span className="badge-rfid">
                    <Tag size={12} className="mr-1" />
                    {book.rfid_id || "Unassigned"}
                  </span>
                </td>
                <td>
                  <span className={`status-pill ${isAvailable ? "status-available" : "status-issued"}`}>
                    {isAvailable ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {book.status}
                  </span>
                  {!isAvailable && book.due_date && (
                    <span className="text-xs text-muted" style={{ display: "block", marginTop: "4px" }}>
                      Due: {book.due_date}
                    </span>
                  )}
                </td>
                <td className="text-right">
                  <div className="table-actions">
                    {onView && (
                      <button
                        onClick={() => onView(book)}
                        className="btn-action btn-action-view"
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(book)}
                        className="btn-action btn-action-edit"
                        title="Edit Book"
                      >
                        <Edit3 size={15} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(book.book_id)}
                        className="btn-action btn-action-delete"
                        title="Delete Book"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

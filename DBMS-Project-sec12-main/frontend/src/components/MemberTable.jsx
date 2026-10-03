import React from "react";
import { Eye, Edit3, Trash2, Mail, Phone, BookCheck } from "lucide-react";

/**
 * Reusable Member Table Component
 */
export default function MemberTable({ members, onView, onEdit, onDelete }) {
  if (!members || members.length === 0) {
    return (
      <div className="empty-state card">
        <p className="empty-title">No members found</p>
        <p className="empty-sub">Add a new library member using the Add Member button.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive card">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Member ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Books Issued</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            const isActive = member.status === "Active";
            return (
              <tr key={member.member_id}>
                <td className="font-mono text-muted">MEM-{String(member.member_id).padStart(3, "0")}</td>
                <td>
                  <div className="font-medium text-primary-dark">{member.name}</div>
                </td>
                <td className="text-muted">
                  <span className="flex-center-gap">
                    <Mail size={13} />
                    {member.email}
                  </span>
                </td>
                <td className="text-muted">
                  <span className="flex-center-gap">
                    <Phone size={13} />
                    {member.phone}
                  </span>
                </td>
                <td>
                  <span className="badge-count">
                    <BookCheck size={13} />
                    {member.books_issued || 0}
                  </span>
                </td>
                <td>
                  <span className={`status-pill ${isActive ? "status-available" : "status-danger"}`}>
                    {member.status}
                  </span>
                </td>
                <td className="text-right">
                  <div className="table-actions">
                    {onView && (
                      <button
                        onClick={() => onView(member)}
                        className="btn-action btn-action-view"
                        title="View Member"
                      >
                        <Eye size={15} />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(member)}
                        className="btn-action btn-action-edit"
                        title="Edit Member"
                      >
                        <Edit3 size={15} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(member.member_id)}
                        className="btn-action btn-action-delete"
                        title="Delete Member"
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

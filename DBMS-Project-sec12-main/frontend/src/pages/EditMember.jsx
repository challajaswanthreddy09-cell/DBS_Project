import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Edit3, ArrowLeft, Mail, Phone, User, Check, AlertCircle } from "lucide-react";
import Button from "../components/Button";
import api from "../api/client";
import { INITIAL_MEMBERS } from "../data/sampleData";

/**
 * Edit Member Page (EditMember.jsx)
 * Update existing patron contact details and membership status.
 * Connects to Express PUT /api/members/:id and GET /api/members/:id.
 */
export default function EditMember() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Active"
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadMember = async () => {
      try {
        const res = await api.get(`/members/${id}`);
        if (res.data) {
          const m = res.data;
          setForm({
            name: m.name || "",
            email: m.email || "",
            phone: m.phone || "",
            status: m.status || "Active"
          });
          return;
        }
      } catch (err) {
        console.warn("Backend GET /members/:id offline, checking local storage");
      }

      const saved = localStorage.getItem("libraryMembers");
      const existingMembers = saved ? JSON.parse(saved) : INITIAL_MEMBERS;
      const memberToEdit = existingMembers.find((m) => String(m.member_id) === String(id));

      if (memberToEdit) {
        setForm({
          name: memberToEdit.name || "",
          email: memberToEdit.email || "",
          phone: memberToEdit.phone || "",
          status: memberToEdit.status || "Active"
        });
      } else {
        setNotFound(true);
      }
    };
    loadMember();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Please fill in all member details.");
      return;
    }

    const saved = localStorage.getItem("libraryMembers");
    const existingMembers = saved ? JSON.parse(saved) : INITIAL_MEMBERS;

    // Check duplicate email for other members
    const duplicateEmail = existingMembers.some(
      (m) => String(m.member_id) !== String(id) && m.email.toLowerCase() === form.email.trim().toLowerCase()
    );
    if (duplicateEmail) {
      setError(`Another member already uses email ${form.email}.`);
      return;
    }

    try {
      await api.put(`/members/${id}`, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        status: form.status
      });

      setSuccess("Member profile updated successfully in MySQL database!");
      setTimeout(() => {
        navigate("/members");
      }, 700);
    } catch (err) {
      console.error("Backend PUT /members/:id error:", err);
      setError(err.response?.data?.message || err.message || "Failed to update member in database.");
    }
  };

  if (notFound) {
    return (
      <div className="empty-state card">
        <h3>Member Not Found</h3>
        <p>No member exists with ID #{id}.</p>
        <Link to="/members" className="btn-custom btn-primary mt-3">
          Back to Members
        </Link>
      </div>
    );
  }

  return (
    <div className="form-page-container">
      <div className="form-header-bar">
        <Link to="/members" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Members</span>
        </Link>
        <h2>Edit Member #{id}</h2>
      </div>

      <div className="form-card-wrap card">
        <div className="form-card-intro">
          <div className="form-icon-badge">
            <Edit3 size={24} />
          </div>
          <div>
            <h3>Update Member Profile</h3>
            <p className="text-muted text-sm">Modify name, contact info, or activate/suspend privileges.</p>
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
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name *
            </label>
            <div className="input-with-icon">
              <User size={16} className="input-icon text-muted" />
              <input
                id="name"
                type="text"
                className="form-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label" htmlFor="email">
                Email Address *
              </label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon text-muted" />
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group flex-1">
              <label className="form-label" htmlFor="phone">
                Phone Number *
              </label>
              <div className="input-with-icon">
                <Phone size={16} className="input-icon text-muted" />
                <input
                  id="phone"
                  type="text"
                  className="form-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="status">
              Membership Status
            </label>
            <select
              id="status"
              className="form-select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="form-actions-row">
            <Button type="button" variant="outline" onClick={() => navigate("/members")}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

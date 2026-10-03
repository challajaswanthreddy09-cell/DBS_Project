import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, ArrowLeft, Mail, Phone, User, Check, AlertCircle, RefreshCw, Lock, GraduationCap } from "lucide-react";
import Button from "../components/Button";
import api from "../api/client";
import { INITIAL_MEMBERS } from "../data/sampleData";

/**
 * Add Member Page (AddMember.jsx)
 * Connects to Express POST /api/members to register new library patrons in MySQL.
 * Optionally provisions a student portal login account linked to the new member.
 */
export default function AddMember() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Active"
  });

  const [createAccount, setCreateAccount] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Please fill out all member details.");
      return;
    }

    if (createAccount && (!username.trim() || !password.trim())) {
      setError("Please specify both username and password to create the student portal login account.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Post to Express backend API
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        status: form.status
      };

      if (createAccount) {
        payload.username = username.trim();
        payload.password = password.trim();
      }

      await api.post("/members", payload);

      setSuccess(
        createAccount
          ? "Member and student portal account created successfully!"
          : "Member registered successfully in MySQL database!"
      );
      setTimeout(() => {
        navigate("/members");
      }, 700);
    } catch (err) {
      console.error("API POST /members error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to register member in database.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-page-container">
      <div className="form-header-bar">
        <Link to="/members" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Members</span>
        </Link>
        <h2>Register New Library Member</h2>
      </div>

      <div className="form-card-wrap card">
        <div className="form-card-intro">
          <div className="form-icon-badge">
            <UserPlus size={24} />
          </div>
          <div>
            <h3>Member Registration Form</h3>
            <p className="text-muted text-sm">Add student or faculty details for book issue privileges.</p>
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
                placeholder="e.g. Ananya Sen"
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
                  placeholder="e.g. ananya.sen@college.edu"
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
                  placeholder="e.g. +91 98765 00000"
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
              <option value="Active">Active (Eligible to borrow)</option>
              <option value="Inactive">Inactive (Suspended)</option>
            </select>
          </div>

          {/* Optional Student Portal Credentials */}
          <div className="card" style={{ background: "#F8FAFC", border: "1px dashed var(--border-color)", padding: "16px", marginTop: "16px", marginBottom: "20px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={createAccount}
                onChange={(e) => setCreateAccount(e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <GraduationCap size={18} className="text-secondary" />
              <span>Create Student Portal Login Account</span>
            </label>
            <p className="text-muted text-xs" style={{ marginTop: "4px", marginLeft: "28px" }}>
              Provisions login credentials for the student to access their personal dashboard and loan status.
            </p>

            {createAccount && (
              <div className="form-row" style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #E2E8F0" }}>
                <div className="form-group flex-1">
                  <label className="form-label" htmlFor="portal-username">
                    Portal Username *
                  </label>
                  <div className="input-with-icon">
                    <User size={16} className="input-icon text-muted" />
                    <input
                      id="portal-username"
                      type="text"
                      className="form-input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. ananya2026"
                      required={createAccount}
                    />
                  </div>
                </div>

                <div className="form-group flex-1">
                  <label className="form-label" htmlFor="portal-password">
                    Portal Password *
                  </label>
                  <div className="input-with-icon">
                    <Lock size={16} className="input-icon text-muted" />
                    <input
                      id="portal-password"
                      type="password"
                      className="form-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="e.g. secret123"
                      required={createAccount}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-actions-row">
            <Button type="button" variant="outline" onClick={() => navigate("/members")} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin mr-1" />
                  <span>Registering...</span>
                </>
              ) : (
                "Register Member"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

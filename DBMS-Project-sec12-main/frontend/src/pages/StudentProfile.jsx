import React, { useState, useEffect } from "react";
import { User, Shield, Mail, Phone, Calendar, Info, Check, RefreshCw, AlertCircle, BookOpen } from "lucide-react";
import api from "../api/client";

/**
 * Student Profile Page (StudentProfile.jsx)
 * Displays student membership metadata, contact details, and borrowing privileges.
 */
export default function StudentProfile({ user }) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get("/student/profile");
      if (res.data) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error("Failed to load student profile:", err);
      setError(err.response?.data?.message || err.message || "Failed to load profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const name = profile?.name || user?.full_name || user?.username || "Student";
  const email = profile?.email || user?.email || "student@example.com";
  const phone = profile?.phone || "—";
  const memberId = profile?.member_id || user?.member_id || "1";
  const username = profile?.username || user?.username || "student";
  const status = profile?.membership_status || "Active";
  const memberSince = profile?.member_since || "2026-09-01";

  return (
    <div className="profile-page-container">
      <div className="page-header-actions-row">
        <div>
          <h2>Student Patron Profile</h2>
          <p className="text-muted text-sm">Review your library registration, member card ID, and portal privileges.</p>
        </div>
        <button
          onClick={fetchProfile}
          className="btn-custom btn-outline flex-center-gap"
          title="Refresh Profile"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="alert-box alert-error mb-4">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="card empty-state">
          <RefreshCw size={28} className="animate-spin text-muted" />
          <p className="empty-title mt-2">Loading profile information...</p>
        </div>
      ) : (
        <div className="profile-layout-grid">
          {/* Left Card: Account Card Overview */}
          <div className="card profile-card-overview">
            <div className="profile-avatar-large">
              <User size={48} className="text-secondary" />
            </div>
            <h3 className="profile-name-text">{name}</h3>
            <p className="profile-email-text">{email}</p>

            <div className="role-badge-large" style={{ backgroundColor: "#EEF2FF", color: "#4F46E5", borderColor: "#C7D2FE" }}>
              <Shield size={16} />
              <span>ROLE: STUDENT PATRON</span>
            </div>

            <div className="profile-privileges-box">
              <div className="privilege-header">
                <Info size={16} />
                <span>Student Privileges</span>
              </div>
              <ul className="privileges-list">
                <li>Search & Browse Entire Catalog</li>
                <li>Track Active Loans & Due Dates</li>
                <li>View Overdue Fine Calculations</li>
                <li>View Paid Penalty Receipts</li>
                <li>Real-Time Shelf Availability Check</li>
              </ul>
            </div>
          </div>

          {/* Right Card: Full Member Information */}
          <div className="card profile-edit-form-card">
            <div className="card-header-clean">
              <h3>Member Registration Details</h3>
              <span className={`status-pill ${status === "Active" ? "status-available" : "status-danger"}`}>
                <Check size={12} />
                {status} Member
              </span>
            </div>

            <div className="detail-meta-grid" style={{ marginTop: "16px" }}>
              <div className="meta-item">
                <span className="meta-label">Member ID:</span>
                <span className="meta-value font-mono font-bold text-secondary">
                  MEM-{memberId.toString().padStart(4, "0")}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Portal Username:</span>
                <span className="meta-value font-mono font-medium">@{username}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Full Name:</span>
                <span className="meta-value">{name}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Email Address:</span>
                <span className="meta-value font-mono">{email}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Registered Contact Phone:</span>
                <span className="meta-value font-mono">{phone}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Membership Status:</span>
                <span className="meta-value text-success font-medium">{status}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Registration Date:</span>
                <span className="meta-value text-muted">{memberSince}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Circulation Security:</span>
                <span className="meta-value text-muted">Role-Restricted (Student Portal)</span>
              </div>
            </div>

            <div className="alert-box alert-info mt-6">
              <span className="text-xs">
                To update your contact phone number or registered email address, please contact the library circulation desk with your student identification.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { User, Shield, Mail, Key, Check, Save, Info } from "lucide-react";
import Button from "../components/Button";

/**
 * Profile Management Page (Profile.jsx)
 * Displays user identity, permissions, and session credentials.
 */
export default function Profile({ user, setUser }) {
  const [name, setName] = useState(user?.full_name || "Chief Administrator");
  const [email, setEmail] = useState(user?.email || "admin@collegelibrary.edu");
  const [role] = useState(user?.role || "admin");
  const [success, setSuccess] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      full_name: name,
      email
    };
    localStorage.setItem("libraryUser", JSON.stringify(updatedUser));
    if (setUser) setUser(updatedUser);
    setSuccess("Profile settings saved successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div className="profile-page-container">
      <div className="page-header-actions-row">
        <div>
          <h2>User Profile & Security</h2>
          <p className="text-muted text-sm">Review your active credentials and session authorization level.</p>
        </div>
      </div>

      {success && (
        <div className="alert-box alert-success mb-4">
          <Check size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="profile-layout-grid">
        {/* Left Card: Account Overview */}
        <div className="card profile-card-overview">
          <div className="profile-avatar-large">
            <User size={48} className="text-secondary" />
          </div>
          <h3 className="profile-name-text">{name}</h3>
          <p className="profile-email-text">{email}</p>

          <div className="role-badge-large">
            <Shield size={16} />
            <span>ROLE: {role.toUpperCase()}</span>
          </div>

          <div className="profile-privileges-box">
            <div className="privilege-header">
              <Info size={16} />
              <span>Assigned Privileges</span>
            </div>
            <ul className="privileges-list">
              <li>Full Catalog & RFID Tag Assignment</li>
              <li>Issue & Return Automation Controls</li>
              <li>Fine Penalty Waiver & Settlement</li>
              <li>Inventory Stock Auditing & RFID Sync</li>
              <li>Analytical Reports & CSV Export</li>
            </ul>
          </div>
        </div>

        {/* Right Card: Edit Profile Form */}
        <div className="card profile-edit-form-card">
          <div className="card-header-clean">
            <h3>Update Profile Information</h3>
            <span className="badge-pill">Session Active</span>
          </div>

          <form onSubmit={handleSave} className="standard-form">
            <div className="form-group">
              <label className="form-label" htmlFor="profName">
                Full Display Name
              </label>
              <div className="input-with-icon">
                <User size={16} className="input-icon text-muted" />
                <input
                  id="profName"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profEmail">
                Email Address
              </label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon text-muted" />
                <input
                  id="profEmail"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Role</label>
              <div className="input-with-icon">
                <Shield size={16} className="input-icon text-muted" />
                <input type="text" className="form-input font-mono" value={role.toUpperCase()} disabled />
              </div>
              <small className="form-hint">Role is governed by system database authorization.</small>
            </div>

            <div className="form-actions-row mt-4">
              <Button type="submit" variant="primary" icon={Save}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

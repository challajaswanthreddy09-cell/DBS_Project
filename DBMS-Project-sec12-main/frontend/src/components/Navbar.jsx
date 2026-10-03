import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { BookOpen, Radio, LogIn, LogOut, UserCheck } from "lucide-react";

/**
 * Top Navigation Bar
 * Features brand logo, public navigation links, authenticated user status, and logout button.
 */
export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("libraryUser");
      localStorage.removeItem("libraryToken");
      navigate("/login");
    }
  };

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Brand Logo & Title */}
        <Link to="/" className="brand-logo">
          <div className="logo-icon-wrap">
            <Radio className="rfid-pulse-icon" size={22} />
            <BookOpen className="book-icon" size={18} />
          </div>
          <div className="brand-text">
            <span className="brand-title">SmartLib RFID</span>
            <span className="brand-sub">Library Management System</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="nav-menu">
          <NavLink to="/" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} end>
            Home
          </NavLink>
          <a href="/#features" className="nav-link">
            Features
          </a>
          <a href="/#about" className="nav-link">
            About
          </a>
          <a href="/#simulation" className="nav-link">
            RFID Workflow
          </a>

          {user && (
            <NavLink
              to={user.role === "student" ? "/student/dashboard" : "/dashboard"}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Dashboard
            </NavLink>
          )}
        </nav>

        {/* User Account / Auth Actions */}
        <div className="nav-actions">
          {user ? (
            <div className="user-profile-badge">
              <span className="user-role-pill">
                <UserCheck size={14} />
                {user.role ? user.role.toUpperCase() : "ADMIN"}
              </span>
              <span className="user-name">{user.username || "User"}</span>
              <button onClick={handleLogout} className="btn-logout" title="Sign Out">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-login">
              <LogIn size={16} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

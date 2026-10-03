import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, User, Shield, GraduationCap, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import Button from "../components/Button";
import api from "../api/client";

/**
 * Authentication Page (Login.jsx)
 * Authenticates users via Express POST /api/auth/login with bcrypt & JWT.
 * Features graceful offline demo fallback for viva demonstrations.
 */
export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [role, setRole] = useState("admin");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Quick fill demo accounts for viva presentation
  const handleQuickSelect = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === "admin") {
      setUsername("admin");
      setPassword("admin123");
    } else if (selectedRole === "librarian") {
      setUsername("librarian");
      setPassword("librarian123");
    } else if (selectedRole === "student") {
      setUsername("student");
      setPassword("student123");
    }
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please provide both username and password.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Attempt connection to Express backend API
      const res = await api.post("/auth/login", {
        username: username.trim(),
        password: password.trim(),
        role
      });

      const { token, user: userData } = res.data;
      localStorage.setItem("libraryToken", token);
      localStorage.setItem("libraryUser", JSON.stringify(userData));

      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }
      setIsLoading(false);
      
      // Navigate based on role
      if (userData.role === "student") {
        navigate("/student/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      // 2. If backend is offline or returned error, check demo credentials fallback
      console.warn("Backend login attempt:", err.message);

      const isValidAdmin = username === "admin" && password === "admin123" && role === "admin";
      const isValidLibrarian = username === "librarian" && password === "librarian123" && role === "librarian";
      const isValidStudent = username === "student" && password === "student123" && role === "student";

      if (isValidAdmin || isValidLibrarian || isValidStudent) {
        const fallbackUser = {
          user_id: role === "admin" ? 1 : role === "librarian" ? 2 : 5,
          member_id: role === "student" ? 1 : null,
          username,
          role,
          full_name: role === "admin" ? "Chief Administrator" : role === "librarian" ? "Assistant Librarian" : "Aarav Sharma",
          email: role === "student" ? "aarav.sharma@example.com" : `${username}@collegelibrary.edu`
        };

        localStorage.setItem("libraryUser", JSON.stringify(fallbackUser));
        localStorage.setItem("libraryToken", `simulated_jwt_token_${Date.now()}`);

        if (onLoginSuccess) {
          onLoginSuccess(fallbackUser);
        }
        setIsLoading(false);
        if (role === "student") {
          navigate("/student/dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        setIsLoading(false);
        setError(err.response?.data?.message || "Invalid credentials. Use demo accounts below for viva demo.");
      }
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-icon-wrap">
            <Lock size={28} className="auth-lock-icon" />
          </div>
          <h2 className="auth-title">System Sign In</h2>
          <p className="auth-subtitle">Select role and sign into the Library Management Console</p>
        </div>

        {error && (
          <div className="alert-box alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">Select Account Role</label>
            <div className="role-selector-pills">
              <button
                type="button"
                className={`role-pill ${role === "admin" ? "active" : ""}`}
                onClick={() => handleQuickSelect("admin")}
              >
                <Shield size={16} />
                <span>Admin</span>
              </button>
              <button
                type="button"
                className={`role-pill ${role === "librarian" ? "active" : ""}`}
                onClick={() => handleQuickSelect("librarian")}
              >
                <User size={16} />
                <span>Librarian</span>
              </button>
              <button
                type="button"
                className={`role-pill ${role === "student" ? "active" : ""}`}
                onClick={() => handleQuickSelect("student")}
              >
                <GraduationCap size={16} />
                <span>Student</span>
              </button>
            </div>
          </div>

          {/* Username Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                id="username"
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw size={16} className="animate-spin mr-2" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={18} className="ml-2" />
              </>
            )}
          </Button>
        </form>

        {/* Demo Credentials Quick-Select Banner for Viva */}
        <div className="demo-credentials-box">
          <p className="demo-box-title">College Viva Demo Credentials:</p>
          <div className="demo-chips">
            <button
              type="button"
              className="demo-chip"
              onClick={() => handleQuickSelect("admin")}
              title="Fill Admin credentials"
            >
              Admin: <code>admin / admin123</code>
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => handleQuickSelect("librarian")}
              title="Fill Librarian credentials"
            >
              Librarian: <code>librarian / librarian123</code>
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => handleQuickSelect("student")}
              title="Fill Student credentials"
            >
              Student: <code>student / student123</code>
            </button>
          </div>
        </div>

        <div className="auth-footer-links">
          <Link to="/" className="text-link-sm">
            ← Return to Public Home
          </Link>
        </div>
      </div>
    </div>
  );
}

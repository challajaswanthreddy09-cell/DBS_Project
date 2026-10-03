import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Protected Route Guard
 * Verifies if user session exists in state or localStorage.
 * Redirects unauthenticated users to the Login page.
 */
export default function ProtectedRoute({ user, allowedRoles, children }) {
  let currentUser = user;
  if (!currentUser) {
    try {
      const stored = localStorage.getItem("libraryUser");
      if (stored) {
        currentUser = JSON.parse(stored);
      }
    } catch {
      currentUser = null;
    }
  }

  const isAuthenticated = Boolean(currentUser);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (currentUser.role || "").toLowerCase();
    const isAllowed = allowedRoles.map((r) => r.toLowerCase()).includes(userRole);
    if (!isAllowed) {
      // Redirect student to student portal, and admin/librarian to main dashboard
      if (userRole === "student") {
        return <Navigate to="/student/dashboard" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

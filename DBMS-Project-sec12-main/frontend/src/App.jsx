import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layout & Route Protection
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import AddBook from "./pages/AddBook";
import EditBook from "./pages/EditBook";
import Members from "./pages/Members";
import AddMember from "./pages/AddMember";
import EditMember from "./pages/EditMember";
import RFIDScanner from "./pages/RFIDScanner";
import IssueBook from "./pages/IssueBook";
import ReturnBook from "./pages/ReturnBook";
import Fines from "./pages/Fines";
import Inventory from "./pages/Inventory";
import Recommendations from "./pages/Recommendations";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";

// Student Portal Pages
import StudentDashboard from "./pages/StudentDashboard";
import MyBorrowedBooks from "./pages/MyBorrowedBooks";
import MyFines from "./pages/MyFines";
import BrowseBooks from "./pages/BrowseBooks";
import StudentProfile from "./pages/StudentProfile";

/**
 * Main Application Routing Component (App.jsx)
 * Manages client-side routes, authentication state, and layout wrappers.
 */
export default function App() {
  // Authentication session state initialized from localStorage
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("libraryUser");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("libraryUser");
    localStorage.removeItem("libraryToken");
    setUser(null);
  };

  return (
    <Routes>
      {/* Public Landing Page */}
      <Route
        path="/"
        element={
          <Layout user={user} onLogout={handleLogout} showSidebar={false}>
            <Home user={user} />
          </Layout>
        }
      />

      {/* Public Login Page */}
      <Route
        path="/login"
        element={
          <Layout user={user} onLogout={handleLogout} showSidebar={false}>
            <Login onLoginSuccess={handleLoginSuccess} />
          </Layout>
        }
      />

      {/* Protected Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user} allowedRoles={["admin", "librarian"]}>
            <Layout user={user} onLogout={handleLogout} title="Circulation Dashboard" subtitle="Overview of library activities, circulation stats, and RFID status">
              <Dashboard user={user} />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Books Catalog & CRUD */}
      <Route
        path="/books"
        element={
          <ProtectedRoute user={user} allowedRoles={["admin", "librarian"]}>
            <Layout user={user} onLogout={handleLogout} title="Book Catalog & RFID Tags" subtitle="Manage registered titles and mapped software RFID identifiers">
              <Books />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/books/add"
        element={
          <ProtectedRoute user={user} allowedRoles={["admin", "librarian"]}>
            <Layout user={user} onLogout={handleLogout}>
              <AddBook />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-book"
        element={<Navigate to="/books/add" replace />}
      />
      <Route
        path="/books/edit/:id"
        element={
          <ProtectedRoute user={user} allowedRoles={["admin", "librarian"]}>
            <Layout user={user} onLogout={handleLogout}>
              <EditBook />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-book/:id"
        element={
          <ProtectedRoute user={user} allowedRoles={["admin", "librarian"]}>
            <Layout user={user} onLogout={handleLogout}>
              <EditBook />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Members Directory & CRUD */}
      <Route
        path="/members"
        element={
          <ProtectedRoute user={user} allowedRoles={["admin", "librarian"]}>
            <Layout user={user} onLogout={handleLogout} title="Member Management" subtitle="Registered students and faculty members">
              <Members />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/members/add"
        element={
          <ProtectedRoute user={user} allowedRoles={["admin", "librarian"]}>
            <Layout user={user} onLogout={handleLogout}>
              <AddMember />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-member"
        element={<Navigate to="/members/add" replace />}
      />
      <Route
        path="/members/edit/:id"
        element={
          <ProtectedRoute user={user} allowedRoles={["admin", "librarian"]}>
            <Layout user={user} onLogout={handleLogout}>
              <EditMember />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-member/:id"
        element={
          <ProtectedRoute user={user} allowedRoles={["admin", "librarian"]}>
            <Layout user={user} onLogout={handleLogout}>
              <EditMember />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* RFID Software Simulation Scanner */}
      <Route
        path="/rfid"
        element={
          <ProtectedRoute user={user} allowedRoles={["admin", "librarian"]}>
            <Layout user={user} onLogout={handleLogout} title="RFID Scanner Simulation" subtitle="Virtual RFID antenna reader detecting digital book tags">
              <RFIDScanner />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Circulation: Issue & Return */}
      <Route
        path="/issue"
        element={
          <ProtectedRoute user={user} allowedRoles={["admin", "librarian"]}>
            <Layout user={user} onLogout={handleLogout} title="Issue Book" subtitle="Automated lending workflow using RFID tags">
              <IssueBook />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/return"
        element={
          <ProtectedRoute user={user} allowedRoles={["admin", "librarian"]}>
            <Layout user={user} onLogout={handleLogout} title="Return Book" subtitle="Automated return verification and fine calculation">
              <ReturnBook />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Fine & Dues Engine */}
      <Route
        path="/fines"
        element={
          <ProtectedRoute user={user} allowedRoles={["admin", "librarian"]}>
            <Layout user={user} onLogout={handleLogout} title="Fine & Dues Engine" subtitle="Daily overdue charges and payment clearing">
              <Fines />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Inventory & Stock Verification */}
      <Route
        path="/inventory"
        element={
          <ProtectedRoute user={user} allowedRoles={["admin", "librarian"]}>
            <Layout user={user} onLogout={handleLogout} title="Stock Verification & Audit" subtitle="Shelf reconciliation against RFID registered assets">
              <Inventory />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Book Recommendations */}
      <Route
        path="/recommendations"
        element={
          <ProtectedRoute user={user} allowedRoles={["admin", "librarian"]}>
            <Layout user={user} onLogout={handleLogout} title="Book Recommendations" subtitle="Rule-based title discovery derived from subject affinity and lending patterns">
              <Recommendations />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Reports & Analytics */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute user={user} allowedRoles={["admin", "librarian"]}>
            <Layout user={user} onLogout={handleLogout} title="Reports & Analytics" subtitle="Official circulation reports, audit sheets, and CSV exports">
              <Reports />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Staff User Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute user={user} allowedRoles={["admin", "librarian"]}>
            <Layout user={user} onLogout={handleLogout} title="User Profile" subtitle="Account details and security privileges">
              <Profile user={user} setUser={setUser} />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* ============================================================== */}
      {/* STUDENT PORTAL ROUTES (Role: student)                          */}
      {/* ============================================================== */}

      {/* Student Dashboard */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute user={user} allowedRoles={["student"]}>
            <Layout user={user} onLogout={handleLogout} title="Student Portal Dashboard" subtitle="Overview of your library borrowings, catalog search, and fine status">
              <StudentDashboard user={user} />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Student Browse Books */}
      <Route
        path="/student/books"
        element={
          <ProtectedRoute user={user} allowedRoles={["student"]}>
            <Layout user={user} onLogout={handleLogout} title="Browse Books Catalog" subtitle="Search and explore available titles in the college library">
              <BrowseBooks />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Student Borrowed Books */}
      <Route
        path="/student/borrowed-books"
        element={
          <ProtectedRoute user={user} allowedRoles={["student"]}>
            <Layout user={user} onLogout={handleLogout} title="My Borrowed Books" subtitle="Track your active borrowings, due dates, and return history">
              <MyBorrowedBooks />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Student Fines & Dues */}
      <Route
        path="/student/fines"
        element={
          <ProtectedRoute user={user} allowedRoles={["student"]}>
            <Layout user={user} onLogout={handleLogout} title="My Fines & Dues" subtitle="Review overdue fine charges and settled payments">
              <MyFines />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Student Profile */}
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute user={user} allowedRoles={["student"]}>
            <Layout user={user} onLogout={handleLogout} title="Student Patron Profile" subtitle="Member card details and account privileges">
              <StudentProfile user={user} />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

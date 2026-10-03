import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookMarked,
  Users,
  ScanLine,
  ArrowUpRight,
  ArrowDownLeft,
  CircleDollarSign,
  Boxes,
  Sparkles,
  BarChart3,
  UserCircle
} from "lucide-react";

/**
 * Management Sidebar Component
 * Provides clean navigation to all primary modules in the Library Management System.
 */
export default function Sidebar({ user }) {
  let currentUser = user;
  if (!currentUser) {
    try {
      const stored = localStorage.getItem("libraryUser");
      if (stored) currentUser = JSON.parse(stored);
    } catch {
      currentUser = null;
    }
  }

  const isStudent = currentUser?.role === "student";

  const studentNavItems = [
    { label: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
    { label: "Browse Books", path: "/student/books", icon: BookMarked },
    { label: "My Borrowed Books", path: "/student/borrowed-books", icon: ArrowUpRight },
    { label: "My Fines", path: "/student/fines", icon: CircleDollarSign },
    { label: "My Profile", path: "/student/profile", icon: UserCircle }
  ];

  const staffNavItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Books Catalog", path: "/books", icon: BookMarked },
    { label: "Members", path: "/members", icon: Users },
    { label: "RFID Scanner", path: "/rfid", icon: ScanLine, highlight: true },
    { label: "Issue Book", path: "/issue", icon: ArrowUpRight },
    { label: "Return Book", path: "/return", icon: ArrowDownLeft },
    { label: "Fines & Dues", path: "/fines", icon: CircleDollarSign },
    { label: "Stock Verification", path: "/inventory", icon: Boxes },
    { label: "Recommendations", path: "/recommendations", icon: Sparkles },
    { label: "Reports & Analytics", path: "/reports", icon: BarChart3 },
    { label: "Profile", path: "/profile", icon: UserCircle }
  ];

  const navItems = isStudent ? studentNavItems : staffNavItems;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-section-title">
        {isStudent ? "STUDENT PORTAL" : "CIRCULATION MENU"}
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""} ${item.highlight ? "rfid-nav-item" : ""}`
              }
            >
              <Icon className="nav-icon" size={18} />
              <span className="nav-text">{item.label}</span>
              {item.highlight && <span className="sim-tag">SIM</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* College Project Viva Notice in Sidebar */}
      <div className="sidebar-footer-note">
        <div className="viva-badge">Academic Project</div>
        <p className="viva-text">
          {isStudent ? "Logged in as Student Patron" : "RFID Software Simulation Module Active"}
        </p>
      </div>
    </aside>
  );
}

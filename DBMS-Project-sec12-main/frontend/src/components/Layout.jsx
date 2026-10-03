import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

/**
 * Main Application Layout
 * Wraps content with the top Navbar, left Sidebar (for dashboard views), and system footer.
 */
export default function Layout({ children, user, onLogout, showSidebar = true, title = "", subtitle = "" }) {
  return (
    <div className="app-container">
      <Navbar user={user} onLogout={onLogout} />

      <div className={`main-layout-body ${showSidebar ? "with-sidebar" : "full-width"}`}>
        {showSidebar && <Sidebar user={user} />}

        <main className="content-workspace">
          {title && (
            <div className="page-header-banner">
              <div>
                <h1 className="page-heading">{title}</h1>
                {subtitle && <p className="page-subheading">{subtitle}</p>}
              </div>
            </div>
          )}

          <div className="page-content">{children}</div>
        </main>
      </div>

      <footer className="site-footer">
        <div className="footer-inner">
          <p>© 2026 Library Management System with RFID Integration | DBMS Academic Project</p>
          <p className="footer-sub">
            Built with React, Vite, Node.js, Express & MySQL. Software RFID Reader Simulation enabled.
          </p>
        </div>
      </footer>
    </div>
  );
}

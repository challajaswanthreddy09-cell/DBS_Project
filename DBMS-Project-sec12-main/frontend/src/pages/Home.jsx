import React from "react";
import { Link } from "react-router-dom";
import {
  Radio,
  ScanLine,
  BookOpen,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  FileSpreadsheet
} from "lucide-react";

/**
 * Public Landing Page (Home.jsx)
 * Showcases library circulation features, live RFID simulation workflow, statistics, and project overview.
 */
export default function Home({ user }) {
  return (
    <div className="home-page-wrapper">
      {/* Top Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="academic-tag">
            <span className="pulse-dot"></span>
            B.Tech Final Year Academic Project • DBMS & RFID Simulation
          </div>
          <h1 className="hero-heading">
            Smart Library Management with <span className="highlight-text">RFID Integration</span>
          </h1>
          <p className="hero-subtitle">
            Automate book circulation, manage members, track inventory, calculate fines and discover recommended titles
            through an integrated library management system.
          </p>

          <div className="hero-cta-group">
            <Link to={user ? "/dashboard" : "/login"} className="btn-hero-primary">
              <span>{user ? "Go to Dashboard" : "Explore Library"}</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/rfid" className="btn-hero-secondary">
              <ScanLine size={18} />
              <span>Launch RFID Simulator</span>
            </Link>
          </div>

          {/* Key Library Circulation Stats Banner */}
          <div className="hero-stats-banner">
            <div className="hero-stat-item">
              <span className="hero-stat-num">500+</span>
              <span className="hero-stat-lbl">Total Books</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat-item">
              <span className="hero-stat-num text-success">380</span>
              <span className="hero-stat-lbl">Available Books</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat-item">
              <span className="hero-stat-num text-warning">120</span>
              <span className="hero-stat-lbl">Issued Books</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat-item">
              <span className="hero-stat-num text-info">250+</span>
              <span className="hero-stat-lbl">Registered Members</span>
            </div>
          </div>
        </div>

        {/* Visual RFID Workflow Box */}
        <div className="hero-workflow-card card" id="simulation">
          <div className="workflow-card-header">
            <div className="badge-simulation-pill">
              <Radio size={14} className="animate-spin-slow" />
              RFID Software Simulation Architecture
            </div>
          </div>
          <p className="workflow-desc">
            Physical RFID hardware is not required. Digital tag IDs simulate the antenna-to-middleware communication
            layer.
          </p>

          <div className="workflow-steps-vertical">
            <div className="workflow-step">
              <div className="step-icon step-rfid">
                <Radio size={18} />
              </div>
              <div className="step-details">
                <strong>1. Digital RFID Tag</strong>
                <span>Unique Tag Code (e.g., RFID001) linked to physical book</span>
              </div>
            </div>

            <div className="step-connector">↓</div>

            <div className="workflow-step">
              <div className="step-icon step-scan">
                <ScanLine size={18} />
              </div>
              <div className="step-details">
                <strong>2. RFID Reader Simulation</strong>
                <span>Instant trigger scanning digital tag frequency</span>
              </div>
            </div>

            <div className="step-connector">↓</div>

            <div className="workflow-step">
              <div className="step-icon step-identify">
                <BookOpen size={18} />
              </div>
              <div className="step-details">
                <strong>3. Book Identification</strong>
                <span>Automated metadata lookup in MySQL database</span>
              </div>
            </div>

            <div className="step-connector">↓</div>

            <div className="workflow-step">
              <div className="step-icon step-system">
                <Cpu size={18} />
              </div>
              <div className="step-details">
                <strong>4. Library Management System</strong>
                <span>Auto Issue / Return / Fine engine update</span>
              </div>
            </div>
          </div>

          <div className="workflow-note">
            <ShieldCheck size={14} className="text-success" />
            <span>Ready for future hardware reader API connection (e.g., RC522 / UHF Reader).</span>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="section-container" id="features">
        <div className="section-heading-wrap">
          <h2 className="section-title">Comprehensive Circulation Modules</h2>
          <p className="section-subtitle">
            Engineered to streamline all academic library operations from book tagging to inventory auditing.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card card">
            <div className="feature-icon-box bg-blue">
              <ScanLine size={24} />
            </div>
            <h3 className="feature-title">1. RFID Book Identification</h3>
            <p className="feature-text">
              Zero-contact software tag scanning for high-speed book tracking, verification, and instant metadata lookup.
            </p>
          </div>

          <div className="feature-card card">
            <div className="feature-icon-box bg-green">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="feature-title">2. Automated Issue & Return</h3>
            <p className="feature-text">
              Seamless 2-click circulation: map member ID to scanned book RFID, auto-generate loan records, and update status.
            </p>
          </div>

          <div className="feature-card card">
            <div className="feature-icon-box bg-amber">
              <Sparkles size={24} />
            </div>
            <h3 className="feature-title">3. Fine & Dues Engine</h3>
            <p className="feature-text">
              Real-time daily overdue calculation (₹5/day), tracking of outstanding dues, and instant receipt clearance.
            </p>
          </div>

          <div className="feature-card card">
            <div className="feature-icon-box bg-purple">
              <Layers size={24} />
            </div>
            <h3 className="feature-title">4. Member Management</h3>
            <p className="feature-text">
              Directory of students and faculty members, tracking current loans, contact information, and membership status.
            </p>
          </div>

          <div className="feature-card card">
            <div className="feature-icon-box bg-teal">
              <Cpu size={24} />
            </div>
            <h3 className="feature-title">5. Inventory & Stock Audit</h3>
            <p className="feature-text">
              Verification dashboard comparing physical shelf presence against registered RFID tags to flag missing books.
            </p>
          </div>

          <div className="feature-card card">
            <div className="feature-icon-box bg-red">
              <FileSpreadsheet size={24} />
            </div>
            <h3 className="feature-title">6. Reports & Analytics</h3>
            <p className="feature-text">
              Actionable visual reports for book borrowing trends, fine collections, category distribution, and printable summaries.
            </p>
          </div>
        </div>
      </section>

      {/* About the Academic Project */}
      <section className="section-container about-section" id="about">
        <div className="card about-card">
          <div className="about-content">
            <span className="viva-badge">Viva Presentation Highlight</span>
            <h2>Why RFID Simulation in College Demonstration?</h2>
            <p>
              In practical engineering environments, high-frequency physical RFID readers (such as UHF or RC522) require
              specific serial or USB communication. In this academic system, we have designed a cleanly decoupled
              <strong> Software RFID Simulation Layer</strong>.
            </p>
            <p>
              The system simulates physical tags through registered alphanumeric identifiers (e.g. <code>RFID001</code>).
              When a tag is triggered, the simulation dispatches a scan event to the backend API, allowing the entire circulation,
              overdue calculation, and inventory audit pipeline to function identically to physical hardware.
            </p>
            <div className="tech-stack-row">
              <span className="tech-pill">React.js + Vite</span>
              <span className="tech-pill">Node.js + Express</span>
              <span className="tech-pill">MySQL (Relational 3NF)</span>
              <span className="tech-pill">JWT + Bcrypt</span>
              <span className="tech-pill">Simulated RFID Reader API</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

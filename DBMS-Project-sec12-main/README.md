# Library Management System with RFID Integration

> **Academic Project** for B.Tech / B.E. Computer Science & Engineering (DBMS Coursework)  
> Built with **React.js (Vite)**, **Node.js (Express.js)**, **MySQL (3NF Relational Schema)**, and **Software RFID Simulation**.

---

## 📌 Project Overview

The **Library Management System with RFID Integration** automates academic library circulation, cataloging, inventory stock verification, overdue fine calculation, and title recommendation. 

Physical RFID hardware is **not** required. The system features a **Software RFID Simulation Layer** where digital tag IDs (such as `RFID001`, `RFID002`) simulate physical book tags and reader communication, allowing seamless testing, demonstration, and viva presentation while remaining architecturally ready for future physical reader API integration.

---

## 🚀 Key Modules

1. **Catalog & RFID Tagging:** Register books with ISBN and assign 1-to-1 mapped RFID tags. Search and filter by category and status.
2. **Issue / Return Automation:** Zero-contact circulation workflow powered by RFID scanning.
3. **Fine & Dues Engine:** Dynamic overdue calculation: $\text{Fine} = \text{Overdue Days} \times ₹5/\text{day}$. Supports receipt tracking and dues clearing.
4. **Member Management:** Directory of student and faculty patrons, tracking active borrowing quotas and contact information.
5. **Software RFID Scanner:** Virtual UHF RFID reader (865–868 MHz) with live radar pulse visualizer and preset test chips (`RFID001` - `RFID008`).
6. **Stock Verification & Audit:** Shelf inventory auditing comparing database assets against registered RFID tags to flag missing books.
7. **Book Recommendations Engine:** Explainable, rule-based title discovery derived from subject taxonomy, curricular prerequisites, and borrowing history.
8. **Reports & Analytics:** Tabular reports for Books, Members, Circulation History, Fines, and Inventory with visual category distribution charts and browser print/PDF/CSV export.

---

## 🛠️ Technology Stack

- **Frontend:** React.js 18, Vite 6, React Router DOM 7, Lucide React Icons, Axios, CSS3 (Custom Design System: Primary `#0A3D62`, Secondary `#1E90FF`, Background `#F5F8FC`, Cards `#FFFFFF`).
- **Backend:** Node.js, Express.js, `mysql2/promise`, CORS, Dotenv, Bcrypt, JSON Web Token (JWT).
- **Database:** MySQL 8.0 (Database name: `library_rfid`, Normalized 3NF Relational Schema).
- **Simulation Layer:** Software-based RFID reader middleware.

---

## 📂 Project Structure

```
DBMS Library Project/
├── DBMS-Library-Project.code-workspace # Double-click to open all modules in VS Code
├── start-project.bat        # One-click launcher (starts Backend + Frontend + opens browser)
├── open-in-vscode.bat       # One-click VS Code launcher
├── package.json             # Root runner (npm run dev runs frontend + backend together)
├── .vscode/                 # Pre-configured launch.json, tasks.json, settings.json
├── frontend/                # React.js SPA (Vite 6, React Router 7)
│   ├── src/
│   │   ├── components/      # 11 Modular Reusable UI Components
│   │   ├── pages/           # 17 Full-Featured Application Pages
│   │   ├── data/            # sampleData.js (Centralized CS Books & Patrons)
│   │   ├── App.jsx          # Declarative Client Routes
│   │   ├── main.jsx         # React DOM Entrypoint
│   │   └── styles.css       # Professional Theme Stylesheet
│   └── package.json
├── backend/                 # Express.js REST API (Node.js 20+)
│   ├── src/
│   │   ├── config/db.js     # MySQL Connection Pool (mysql2/promise)
│   │   ├── middleware/      # JWT Authentication & Role Checking
│   │   ├── routes/          # 10 Dedicated REST Route Handlers
│   │   └── server.js        # Express App Assembly & Port Listener
│   ├── .env                 # Database & JWT Environment Config
│   └── package.json
├── database/                # Normalized 3NF MySQL Database
│   ├── library_rfid.sql     # DDL Schema Script
│   └── sample_data.sql      # DML Seed Script (with Bcrypt Hashes)
├── documentation/           # Complete College Viva & Submission Materials
│   ├── Project Report.md
│   ├── Installation Guide.md
│   ├── API Documentation.md
│   ├── Database Schema.md
│   ├── ER Diagram.md
│   ├── System Architecture.md
│   ├── Flowcharts.md
│   └── Viva Questions.md
└── README.md
```


---

## 🔑 Demo Login Accounts

| Role | Username | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin` | `admin123` | Full Catalog, RFID Management, Circulation, Fines, Reports |
| **Librarian** | `librarian` | `librarian123` | Book Issue, Book Return, RFID Scanner, Stock Verification |

*(Clickable demo account chips are provided on the Login page for one-click credential filling during presentations).*

---

## ⚡ Quick Start Guide

### 1. Database Setup (MySQL)
Run the following commands in your MySQL client or MySQL Workbench:
```sql
SOURCE C:/Users/Sidhartha/Desktop/DBMS Library Project/database/library_rfid.sql;
SOURCE C:/Users/Sidhartha/Desktop/DBMS Library Project/database/sample_data.sql;
```

### 2. Start the Backend Server
```powershell
cd "C:\Users\Sidhartha\Desktop\DBMS Library Project\backend"
npm install
npm start
```
The API server will run at `http://localhost:5000`.

### 3. Start the Frontend Application
```powershell
cd "C:\Users\Sidhartha\Desktop\DBMS Library Project\frontend"
npm install
npm run dev
```
Open your browser and visit: `http://localhost:5173`.

---

## 📡 RFID Simulation Workflow

```
[ Enter Digital Tag: "RFID001" ]
              │
              │ POST /api/rfid/scan
              ▼
[ Express Router (rfid.js) ]
              │
              │ SELECT b.* FROM rfid_tags r JOIN books b ...
              ▼
[ MySQL Database (library_rfid) ]
              │
              │ Returns: "Database System Concepts" (Available)
              ▼
[ Instant Book Display & Action Buttons ]
```

> **Note on Hardware:** Physical RFID hardware is not used in the current implementation. RFID functionality is simulated using digital RFID tag IDs. The system architecture can be extended later to connect a physical RFID reader through an RFID Reader API.

---

## 🧪 Testing Edge Cases Handled

- ✅ **Unavailable Book Check:** Attempting to issue an already checked-out book triggers an alert.
- ✅ **Inactive Member Check:** Suspended accounts are blocked from borrowing.
- ✅ **Duplicate Prevention:** Re-registering existing ISBNs or RFID tag codes is prevented by unique constraints.
- ✅ **Overdue Fine Engine:** Calculates exact fines for overdue days; on-time returns generate ₹0 fine.
- ✅ **Database Offline Resilience:** Backend includes fallback simulation mode so demos never crash even if MySQL service credentials require reconfiguration.

---

## 📚 Academic Viva Preparation

Review the dedicated viva preparation guide in:  
📁 [`documentation/Viva Questions.md`](./documentation/Viva%20Questions.md)  
Contains 24 concise, expert answers to common questions on React, Node, Express, MySQL, Normalization, RFID, Bcrypt, and JWT.

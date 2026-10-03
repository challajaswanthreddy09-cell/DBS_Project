# Installation & Setup Guide: Library Management System with RFID Integration

This guide walks you step-by-step through setting up, configuring, and executing both the Frontend and Backend of the project on a local Windows machine.

---

## 1. PREREQUISITES
Ensure the following software packages are installed on your workstation:
1. **Node.js** (v18.x or higher, v24+ recommended) — Includes `npm`.
2. **MySQL Server** (v8.0 or higher, or XAMPP / WAMP).
3. **Web Browser** (Google Chrome, Microsoft Edge, or Mozilla Firefox).

---

## 2. PROJECT FOLDER STRUCTURE
```
Desktop/
└── DBMS Library Project/
    ├── frontend/          # React.js + Vite User Interface
    ├── backend/           # Node.js + Express.js REST API
    ├── database/          # MySQL DDL and DML Seed Scripts
    ├── documentation/     # Project Reports, ER Diagrams, Viva Guides
    └── README.md          # Project Quickstart Reference
```

---

## 3. DATABASE SETUP (MySQL)

### Option A: Using MySQL Command Line Client
1. Open your terminal or PowerShell and log into MySQL:
   ```powershell
   mysql -u root -p
   ```
   *(Enter your MySQL root password when prompted)*

2. Execute the schema script:
   ```sql
   source C:/Users/Sidhartha/Desktop/DBMS Library Project/database/library_rfid.sql;
   ```

3. Execute the sample data seed script:
   ```sql
   source C:/Users/Sidhartha/Desktop/DBMS Library Project/database/sample_data.sql;
   ```

4. Verify table creation:
   ```sql
   USE library_rfid;
   SHOW TABLES;
   ```
   *(You should see: `books`, `fines`, `members`, `rfid_tags`, `transactions`, `users`)*

### Option B: Using MySQL Workbench
1. Open **MySQL Workbench** and connect to your local MySQL instance.
2. Click **File → Open SQL Script...** and select `database/library_rfid.sql`. Click the **Lightning Bolt** icon to execute.
3. Open `database/sample_data.sql` and execute it to populate seed records.

---

## 4. BACKEND SETUP & CONFIGURATION

1. Open a terminal and navigate to the `backend` folder:
   ```powershell
   cd "C:\Users\Sidhartha\Desktop\DBMS Library Project\backend"
   ```

2. Review or update your `backend/.env` file:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password_here
   DB_NAME=library_rfid
   JWT_SECRET=dbms_library_project_demo_secret
   FINE_PER_DAY=5
   CLIENT_URL=http://localhost:5173
   ```
   > **Note:** Set `DB_PASSWORD` to your local MySQL root password. (If left blank, the backend automatically runs in resilient offline simulation mode).

3. Install dependencies (if not already installed):
   ```powershell
   npm install
   ```

4. Start the Express API server:
   ```powershell
   npm start
   ```
   *Expected Output:*
   ```
   ==================================================
    Library Management API Server running on port 5000
    Base URL: http://localhost:5000
    API Healthcheck: http://localhost:5000/
   ==================================================
    [MySQL] Successfully connected to database: library_rfid
   ```

---

## 5. FRONTEND SETUP & EXECUTION

1. Open a **second** terminal and navigate to the `frontend` folder:
   ```powershell
   cd "C:\Users\Sidhartha\Desktop\DBMS Library Project\frontend"
   ```

2. Verify `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. Install dependencies:
   ```powershell
   npm install
   ```

4. Start the Vite development server:
   ```powershell
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:5173/
   ```

---

## 6. DEFAULT DEMO LOGIN CREDENTIALS

| Account Type | Username | Password | Role | Permissions |
|---|---|---|---|---|
| **Administrator** | `admin` | `admin123` | `admin` | Full Catalog, RFID Management, Circulation, Fines, Reports |
| **Librarian** | `librarian` | `librarian123` | `librarian` | Issue, Return, RFID Scanner, Stock Verification |

*(On the Login page, click the quick-fill buttons to populate credentials automatically).*

---

## 7. TROUBLESHOOTING & FAQ

### Issue: "Access denied for user 'root'@'localhost'"
- **Cause:** Your MySQL server has a root password set, but `backend/.env` has `DB_PASSWORD` empty.
- **Fix:** Open `backend/.env`, set `DB_PASSWORD=your_actual_password`, and restart the backend server.
- **Backup:** The backend contains a built-in simulation fallback so the system remains fully interactive even during offline demonstrations.

### Issue: Port 5000 or 5173 Already in Use
- Change `PORT=5001` in `backend/.env` and update `VITE_API_URL=http://localhost:5001/api` in `frontend/.env`.

# System Architecture: Library Management System with RFID Integration

This document describes the 3-Tier software architecture, communication protocols, security layers, and future hardware interface integration.

---

## 1. 3-Tier Layered Architecture

The system is organized into three strictly decoupled layers:

```
+-------------------------------------------------------------+
|               PRESENTATION TIER (Frontend)                 |
|  - React.js 18 + Vite (SPA)                                 |
|  - React Router DOM for Client-Side Routing                 |
|  - Lucide React Iconography                                 |
|  - Virtual RFID Reader Radar Visualizer                     |
|  - State Management: React useState / localStorage         |
+-------------------------------------------------------------+
                              │
                              │ HTTP/HTTPS (REST JSON)
                              │ Authorization: Bearer <JWT>
                              ▼
+-------------------------------------------------------------+
|               APPLICATION TIER (Backend API)                |
|  - Node.js Runtime + Express.js Web Framework               |
|  - Security: Bcrypt Password Hashing & JWT Validation       |
|  - Circulation Engine (Issue, Return, Overdue Calculation)  |
|  - Rule-Based Recommendation Algorithm                      |
|  - RFID Software Simulation Middleware                      |
+-------------------------------------------------------------+
                              │
                              │ TCP/IP Port 3306
                              │ mysql2/promise Connection Pool
                              ▼
+-------------------------------------------------------------+
|                  DATA TIER (Database)                       |
|  - MySQL 8.0 Relational Database Engine                     |
|  - Database: library_rfid                                   |
|  - Tables: users, books, rfid_tags, members,                |
|            transactions, fines                              |
|  - ACID Transaction Enforcement & Foreign Key Cascades      |
+-------------------------------------------------------------+
```

---

## 2. RFID Simulation Architecture vs. Physical Hardware

In a real-world deployed scenario with physical hardware, an RFID Reader Controller interacts with the backend over serial/UART or WebSocket:

```
[ Physical Book with UHF RFID Tag ]
              ) ) )  Radio Waves (865-868 MHz)
[ Physical RFID Antenna + Reader (e.g. RC522 / UHF) ]
              │
              │ Serial / USB COM Port / TCP
              ▼
[ RFID Reader API (Node.js SerialPort / Middleware) ]
              │
              │ POST /api/rfid/scan { rfid_id }
              ▼
[ Current Software System Controller ]
```

**In this academic project:**
- The physical hardware is emulated via the **Software RFID Simulation Layer**.
- The frontend provides digital tag triggers (e.g., `RFID001`, `RFID002`).
- The Express backend handles the request **identically** to how it would receive data from a hardware controller.
- Therefore, if physical RFID hardware is attached in the future, **zero changes** to the circulation database or frontend logic are needed.

---

## 3. Data Flow Diagram (Level 0 Context Diagram)

```
[ Librarian / Admin ]
        │
        │ 1. Login / Scans RFID / Issues Book
        ▼
[ LMS System Interface ]
        │
        │ 2. Dispatches REST Request
        ▼
[ Express Circulation Controller ]
        │
        │ 3. Executes SQL Transactions
        ▼
[ MySQL Database (library_rfid) ]
        │
        │ 4. Returns Records & Dues
        ▼
[ LMS System Interface ]
        │
        │ 5. Displays Real-time Identification & Receipts
        ▼
[ Patron / Librarian ]
```

---

## 4. Security Architecture

1. **Password Security:** All user credentials are encrypted using `bcrypt` with salt rounds set to 10. Raw passwords are never transmitted or stored in the database.
2. **Stateless Authentication:** JSON Web Tokens (JWT) signed with HMAC-SHA256 allow stateless, secure API communication.
3. **CORS Policy:** Express restricts cross-origin resource requests to authorized frontend origins (`http://localhost:5173`).
4. **SQL Injection Prevention:** All SQL queries in `mysql2/promise` use parameterized placeholders (`?`) preventing SQL injection exploits.

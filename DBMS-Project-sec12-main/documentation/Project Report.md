# ACADEMIC PROJECT REPORT

## PROJECT TITLE:
**Library Management System with RFID Integration**

**Degree:** Bachelor of Technology (B.Tech) / Bachelor of Engineering (B.E.)  
**Department:** Computer Science and Engineering / Information Technology  
**Subject:** Database Management Systems (DBMS) Laboratory Project  

---

## 1. ABSTRACT
Traditional library management systems rely on manual register entries or optical barcode scanning, both of which require line-of-sight and individual physical handling, leading to bottlenecks during peak circulation hours and inaccurate inventory reconciliation. This project introduces a modern, web-based **Library Management System with RFID Integration** developed using the MERN/PERN-adjacent relational stack: **React.js**, **Node.js**, **Express.js**, and **MySQL**, supplemented by a **Software RFID Simulation Layer**.

The system automates the core library lifecycle, including catalog registration, 1-to-1 RFID tag mapping, contactless issue and return workflows, an automated overdue fine calculation engine, patron membership tracking, explainable curricular book recommendations, and RFID shelf stock verification. Because physical high-frequency RFID hardware is cost-prohibitive and tethered to specific serial drivers, the project features a decoupled digital RFID simulation layer that emulates RFID reader frequency transmissions and tag detections. This guarantees complete academic demonstration capabilities and viva evaluability while maintaining a clean, modular architecture ready for future hardware reader integration.

---

## 2. INTRODUCTION
Libraries are central knowledge repositories in educational institutions. Managing hundreds of titles and patrons manually introduces human errors, overdue loan discrepancies, and lost inventory. By leveraging Radio Frequency Identification (RFID) technology, book circulation can be automated at high speeds. 

In this project, a full-stack, 3-tier architecture is designed:
- **Presentation Tier:** A responsive Single-Page Application (SPA) created with React.js, Vite, and modern CSS conforming to institutional accessibility standards.
- **Application Tier:** A RESTful API built on Node.js and Express.js providing business logic, authentication via bcrypt and JSON Web Tokens (JWT), circulation automation, and fine calculation.
- **Data Tier:** A normalized 3NF relational database implemented in MySQL (`library_rfid`) enforcing strict relational integrity through primary and foreign keys.

---

## 3. PROBLEM STATEMENT
Conventional barcode or manual library setups suffer from:
1. **Line-of-Sight Limitations:** Barcode readers require direct visual alignment with stickers, slowing down checkouts.
2. **Manual Overdue Book Tracking:** Calculating overdue days and fines manually introduces delays and accounting mistakes.
3. **Inventory Misplacement:** Locating misplaced books on vast shelf stacks is labour-intensive.
4. **Hardware Bottlenecks for Student Projects:** Physical RFID readers require proprietary drivers, USB-to-UART bridges, and microcontrollers that make demonstration fragile and hardware-dependent.

---

## 4. OBJECTIVES
1. **Catalog & RFID Tagging:** Register books and assign unique digital RFID identifiers (`RFID001`, `RFID002`, etc.) in a normalized relational database.
2. **Automated Circulation:** Automate book check-out (issue) and check-in (return) triggered by RFID scans.
3. **Fine & Dues Engine:** Compute overdue penalties dynamically based on lending duration and configurable daily rates (₹5/day).
4. **Member Management:** Maintain complete records of student and faculty patrons and their active book loan quotas.
5. **Rule-Based Recommendations:** Suggest synergistic titles using explainable curricular and category affinities.
6. **Stock Verification:** Audit shelf availability against digital RFID tags to identify verified stock and missing items.
7. **Comprehensive Reporting:** Generate visual distribution analytics and printable audit reports for institutional records.

---

## 5. SYSTEM MODULES

### Module 1: Catalog & RFID Tagging
- Manages book metadata: Title, Author(s), Subject Category, ISBN, and availability status (`Available`, `Issued`).
- Associates each book record with a 1-to-1 foreign key link to the `rfid_tags` table.
- Enforces unique constraints on ISBN and RFID Tag Codes to prevent duplication.

### Module 2: Issue & Return Automation
- **Issue Workflow:** Select patron → Enter/Scan RFID → Auto-identify book → Check shelf status → Record loan in `transactions` → Update book to `Issued`.
- **Return Workflow:** Scan RFID → Retrieve active loan → Compare due date with return date → Calculate overdue days → Compute fine → Update loan to `Returned` → Replenish book status to `Available`.

### Module 3: Fine & Dues Engine
- Automatically checks if Return Date $>$ Due Date.
- Formula: $\text{Fine} = \text{Overdue Days} \times \text{Daily Fine Rate}$.
- Maintains separate ledger records in the `fines` table with payment tracking (`Unpaid` / `Paid`).

### Module 4: Member Management
- Maintains directory of library patrons (students and professors).
- Tracks active loan counters and membership status (`Active` / `Inactive`).

### Module 5: Software RFID Simulation
- Emulates a physical RFID antenna and receiver operating in the UHF 865–868 MHz band.
- Interactive virtual radar visualizer.
- Preset demo digital tag chips (`RFID001` through `RFID008`) for instant, one-click demonstration.

### Module 6: Stock Verification & Inventory Audit
- Compares expected shelf items against RFID tag scan responses.
- Generates a real-time reconciliation table marking physical copies as "Verified Present" or "Tag Missing".

### Module 7: Book Recommendations Engine
- Transparent, explainable heuristic engine.
- Recommends related readings based on:
  1. Direct Subject Match (Same Category)
  2. Curricular Pairing (e.g. Database Systems ↔ Data Structures)
  3. Patron reading history co-occurrences.

### Module 8: Audit Reports & Analytics
- Multi-dimensional analytics: Books, Members, Circulation History, Fines, and Inventory.
- Includes visual distribution charts and browser print/PDF export features.

---

## 6. TECHNOLOGY STACK

| Component | Technology | Version / Specification | Justification |
|---|---|---|---|
| **Frontend UI** | React.js | v18.3.1 (Vite v6) | High performance Virtual DOM, component reusability, single-page navigation |
| **Routing** | React Router DOM | v7.1.1 | Client-side declarative routing and protected routes |
| **Styling** | Vanilla CSS3 | Custom Design System | High contrast (#0A3D62, #1E90FF), responsive cards, zero heavy UI framework overhead |
| **Icons** | Lucide React | v0.469.0 | Crisp, professional SVG iconography |
| **Backend API** | Node.js + Express.js | v24.15 / Express v4.21 | Asynchronous non-blocking event-driven RESTful architecture |
| **Database** | MySQL | v8.0+ | ACID-compliant relational storage, foreign key constraints, 3NF normalization |
| **DB Driver** | mysql2/promise | v3.11.5 | High-speed connection pooling and async/await query execution |
| **Security** | Bcrypt & JWT | bcrypt v5.1 / jsonwebtoken v9.0 | Password hashing with adaptive salt rounds, stateless token authorization |
| **HTTP Client** | Axios | v1.7.9 | Request/response interceptors with automatic Bearer token injection |

---

## 7. SOFTWARE RFID SIMULATION ARCHITECTURE
```
[ Virtual RFID Scanner UI ]
           │
           │ (Digital Tag Code: "RFID001")
           ▼
[ Express API: POST /api/rfid/scan ]
           │
           │ (SQL Query: JOIN rfid_tags ON books)
           ▼
[ MySQL Database: library_rfid ]
           │
           │ (Returns: Title, Author, Status)
           ▼
[ Auto-Fill Issue / Return Workflows ]
```

> **Viva Note:** Physical RFID hardware is not used in the current implementation. RFID functionality is simulated using digital RFID tag IDs. The system architecture can be extended later to connect a physical RFID reader through an RFID Reader API without modifying the database or business logic.

---

## 8. CONCLUSION & FUTURE SCOPE
The **Library Management System with RFID Integration** successfully demonstrates how relational database design and radio frequency identification principles can eliminate circulation bottlenecks, automate overdue penalty accounting, and guarantee catalog auditing. The application is completely functional, verified against edge cases, and provides academic viva clarity.

**Future Enhancements:**
1. Integration with physical USB/UART UHF RFID readers (e.g., Impinj Speedway or RC522) via Node.js `serialport`.
2. Smart RFID security gate simulation triggering audible alerts for unissued books exiting the facility.
3. Automated patron SMS/Email notifications for upcoming due dates via Twilio/Nodemailer.
4. Self-checkout kiosk touch interface for student self-service.

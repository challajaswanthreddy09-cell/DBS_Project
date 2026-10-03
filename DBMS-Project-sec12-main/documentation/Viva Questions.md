# Viva Questions & Answers: Library Management System with RFID Integration

This guide provides crisp, concise, and academically sound answers to all common technical and conceptual questions asked during university B.Tech / B.E. project vivas and lab exams.

---

### 1. What is React?
**Answer:**
React is an open-source, component-based front-end JavaScript library developed by Meta (Facebook). It is used for building fast, declarative user interfaces and single-page web applications (SPAs) by managing application state and updating the DOM efficiently.

---

### 2. Why React?
**Answer:**
- **Component Reusability:** Code is divided into modular, independent UI components (like `Navbar`, `BookTable`, `StatCard`).
- **Virtual DOM:** React updates only the changed parts of the user interface rather than re-rendering the entire webpage, making it extremely fast.
- **Declarative UI:** State changes automatically drive UI updates.
- **Rich Ecosystem:** Broad support for routing (`react-router-dom`), icons (`lucide-react`), and build tools like Vite.

---

### 3. What is Node.js?
**Answer:**
Node.js is an open-source, cross-platform JavaScript runtime environment built on Google Chrome’s V8 JavaScript engine. It allows developers to execute JavaScript code outside the browser on the server side. It is asynchronous and event-driven.

---

### 4. What is Express.js?
**Answer:**
Express.js is a minimal, fast, and flexible web application framework for Node.js. It simplifies building backend web servers and RESTful APIs by providing robust routing, HTTP request handling, and middleware integration.

---

### 5. What is a REST API?
**Answer:**
REST stands for **REpresentational State Transfer**. A REST API is an architectural style for network communication where clients and servers exchange data (usually in JSON format) over standard HTTP methods:
- `GET`: Retrieve data (e.g. `GET /api/books`)
- `POST`: Create new data (e.g. `POST /api/transactions/issue`)
- `PUT`: Update existing data (e.g. `PUT /api/fines/:id/pay`)
- `DELETE`: Remove data (e.g. `DELETE /api/books/:id`)

---

### 6. What is MySQL?
**Answer:**
MySQL is an open-source **Relational Database Management System (RDBMS)** that stores structured data in tables consisting of rows and columns. It uses Structured Query Language (SQL) and supports ACID transactions (Atomicity, Consistency, Isolation, Durability) to ensure data integrity.

---

### 7. What is a Primary Key?
**Answer:**
A Primary Key is a column (or set of columns) in a relational table that uniquely identifies each record/row. It cannot contain `NULL` values and each value must be unique (e.g., `book_id` in the `books` table, `rfid_id` in the `rfid_tags` table).

---

### 8. What is a Foreign Key?
**Answer:**
A Foreign Key is a field in one table that points to the Primary Key of another table, creating a relational link between them. It enforces **referential integrity** (e.g., `book_id` in `rfid_tags` referencing `books.book_id`). If a book is deleted, the foreign key ensures mapped RFID tags or transactions are handled properly (`ON DELETE CASCADE`).

---

### 9. Why MySQL instead of MongoDB?
**Answer:**
- **Relational Structure:** Library circulation data is strictly relational (Books ↔ RFID Tags ↔ Members ↔ Transactions ↔ Fines).
- **ACID Transactions:** When a book is issued, we must simultaneously create a transaction and update the book's status. MySQL transactions ensure that either both operations succeed or both roll back, preventing ghost loans.
- **Normalization:** Relational schema eliminates data redundancy and anomalies through 1NF, 2NF, and 3NF.
- **Academic Standard:** Relational DBMS aligns with the university academic database syllabus.

---

### 10. What is RFID?
**Answer:**
RFID stands for **Radio Frequency Identification**. It is an automated identification technology that uses wireless radio electromagnetic waves to uniquely identify and track tags attached to physical objects without requiring direct line-of-sight (unlike optical barcodes).

---

### 11. How does RFID work in this project?
**Answer:**
In this project, each physical library book is mapped to a unique digital RFID tag identifier (e.g., `RFID001`). 
1. The librarian scans or enters the tag code on the RFID Scanner page.
2. The frontend sends a request to `POST /api/rfid/scan`.
3. The backend queries the `rfid_tags` and `books` tables in MySQL.
4. The system immediately identifies the book title, author, category, and shelf availability status.
5. In the issue/return workflows, reading the tag auto-fills circulation parameters without manual keyboard entry.

---

### 12. Why is physical RFID hardware not used?
**Answer:**
Physical RFID readers (such as UHF Long-Range readers or RC522 modules) require physical hardware antennas, serial COM ports, microcontrollers (Arduino/Raspberry Pi), and physical RFID sticker tags. For academic college software project demonstrations and evaluation, software simulation provides complete functional verification, portability, and zero hardware dependency while retaining the exact same software architecture.

---

### 13. What is RFID Software Simulation?
**Answer:**
RFID Simulation is a software design pattern where the data payloads that would ordinarily be transmitted by an RFID reader's serial driver (like EPC tag hex values and ID codes) are emulated digitally in software. The application architecture treats the tag code as if it arrived from a hardware reader API, allowing full circulation testing.

---

### 14. What is JWT (JSON Web Token)?
**Answer:**
JWT is a compact, URL-safe standard (RFC 7519) for securely transmitting information between client and server as a signed JSON object. It consists of three parts separated by dots:
1. **Header:** Algorithm & token type (`HS256`, `JWT`)
2. **Payload:** User claims (`user_id`, `username`, `role`)
3. **Signature:** Encrypted hash of header + payload using a secret key
The client sends this token in the `Authorization: Bearer <token>` header with every protected request.

---

### 15. Why use bcrypt?
**Answer:**
Bcrypt is a cryptographic hash function designed specifically for secure password hashing. It includes:
- **Salt Generation:** A random string is added to every password before hashing to prevent rainbow table attacks.
- **Adaptive Cost Factor:** The calculation can be slowed down intentionally, making brute-force cracking computationally impractical.
- Plaintext passwords are never stored in the database.

---

### 16. What is Middleware?
**Answer:**
Middleware is a function in Express.js that has access to the Request object (`req`), Response object (`res`), and the `next` function in the application's request-response cycle. It is used for tasks like parsing incoming JSON bodies (`express.json()`), handling CORS headers (`cors()`), and validating authorization tokens (`authenticateToken`).

---

### 17. What is CRUD?
**Answer:**
CRUD represents the four fundamental operations of persistent data storage:
- **Create:** Insert new records (`POST /api/books`)
- **Read:** Retrieve records (`GET /api/books`)
- **Update:** Modify existing records (`PUT /api/books/:id`)
- **Delete:** Remove records (`DELETE /api/books/:id`)

---

### 18. What is Database Normalization?
**Answer:**
Normalization is the process of organizing database tables to reduce data redundancy and eliminate insertion, update, and deletion anomalies.
- **1NF (First Normal Form):** Every column contains atomic (indivisible) values and each record is unique.
- **2NF (Second Normal Form):** Meets 1NF, and all non-key attributes are fully functionally dependent on the entire primary key (no partial dependency).
- **3NF (Third Normal Form):** Meets 2NF, and no non-key attribute is transitively dependent on the primary key (no transitive dependency). In this project, RFID tag mapping is split into `rfid_tags` and fines into `fines` to achieve 3NF.

---

### 19. How is Fine calculated?
**Answer:**
The system uses the formula:
$$\text{Fine Amount} = \text{Overdue Days} \times \text{Fine Rate Per Day}$$
- If Return Date $\le$ Due Date: Overdue Days $= 0$, Fine $= ₹0$.
- If Return Date $>$ Due Date: Overdue Days $= \lceil(\text{Return Date} - \text{Due Date}) / 1 \text{ day}\rceil$.
- At default ₹5 per day, a 7-day overdue book generates: $7 \times 5 = ₹35$.

---

### 20. How does the Issue Book workflow work?
**Answer:**
1. Select a registered patron from the `members` table.
2. Scan/enter the digital RFID tag attached to the book.
3. Verify book status is `Available` and member status is `Active`.
4. Enter issue date and due date (default: 14 days loan).
5. Execute database transaction:
   - Insert new row into `transactions` with status `'Issued'`.
   - Update `books.status = 'Issued'`.

---

### 21. How does the Return Book workflow work?
**Answer:**
1. Scan the book's RFID tag on the Return page.
2. The system queries `transactions` to locate the active loan record (`status = 'Issued'`).
3. It compares `due_date` against `return_date` to calculate overdue days and fine amount.
4. Updates `transactions`: sets `status = 'Returned'`, `return_date = today`, `fine`, `fine_status`.
5. Updates `books`: sets `status = 'Available'`.
6. If fine $> 0$, an overdue invoice is recorded in the `fines` table.

---

### 22. How does Frontend communicate with Backend?
**Answer:**
The React frontend uses **Axios** (configured in `src/api/client.js`) to make asynchronous HTTP requests to `http://localhost:5000/api`. The requests include:
- `Content-Type: application/json` for request bodies.
- `Authorization: Bearer <token>` header containing the user's JWT.
- Responses are received as JSON objects and rendered using React state (`useState`, `useEffect`).

---

### 23. How does Backend communicate with MySQL?
**Answer:**
The Express backend uses the `mysql2/promise` library to connect to the MySQL server via a connection pool (`createPool`). Using parameterized SQL queries (`pool.query(sql, [param1, param2])`), it prevents SQL injection and returns structured rows as JavaScript arrays.

---

### 24. What happens when RFID001 is scanned?
**Answer:**
1. User enters or clicks `RFID001` on the RFID Scanner page.
2. React dispatches `POST /api/rfid/scan` with payload `{"rfid_id": "RFID001"}`.
3. Express matches the route in `src/routes/rfid.js`.
4. SQL executes:
   ```sql
   SELECT b.*, r.rfid_id FROM rfid_tags r 
   JOIN books b ON r.book_id = b.book_id 
   WHERE r.rfid_id = 'RFID001';
   ```
5. MySQL returns: *Database System Concepts*, Abraham Silberschatz, ISBN: 978-0078022159, Status: Available.
6. React receives the JSON response, plays the radar identification animation, and renders the book details card with shortcut buttons to issue or return the book.

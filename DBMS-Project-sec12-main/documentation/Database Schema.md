# Database Schema & Relational Design

**Database Name:** `library_rfid`  
**RDBMS:** MySQL 8.0  
**Normalization Level:** 3NF (Third Normal Form)

---

## 1. Table Specifications

### 1. `users` Table
Stores authenticated library administrators and staff.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `user_id` | `INT` | `PRIMARY KEY, AUTO_INCREMENT` | Unique user identifier |
| `username` | `VARCHAR(60)` | `NOT NULL, UNIQUE` | Unique login username |
| `password` | `VARCHAR(255)` | `NOT NULL` | Bcrypt hashed secret password |
| `role` | `ENUM('admin', 'librarian')` | `NOT NULL DEFAULT 'librarian'` | Authorization role |
| `full_name` | `VARCHAR(120)` | `NOT NULL` | Full display name |
| `email` | `VARCHAR(120)` | `NOT NULL, UNIQUE` | Official email address |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Registration timestamp |

---

### 2. `books` Table
Stores catalog records of registered library volumes.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `book_id` | `INT` | `PRIMARY KEY, AUTO_INCREMENT` | Unique book identifier |
| `title` | `VARCHAR(200)` | `NOT NULL` | Book title |
| `author` | `VARCHAR(160)` | `NOT NULL` | Author(s) |
| `category` | `VARCHAR(80)` | `NOT NULL` | Subject domain (e.g. Database) |
| `isbn` | `VARCHAR(50)` | `NOT NULL, UNIQUE` | International Standard Book Number |
| `status` | `ENUM('Available', 'Issued')` | `DEFAULT 'Available'` | Shelf presence status |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Catalog entry timestamp |

---

### 3. `rfid_tags` Table
Maintains 1-to-1 software RFID simulation mappings to books.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `rfid_id` | `VARCHAR(50)` | `PRIMARY KEY` | Digital tag ID (e.g., `RFID001`) |
| `book_id` | `INT` | `NOT NULL, UNIQUE, FOREIGN KEY` | References `books(book_id)` |
| `tag_code` | `VARCHAR(60)` | `NOT NULL, UNIQUE` | Hexadecimal Electronic Product Code |
| `status` | `ENUM('Active', 'Inactive', 'Damaged')` | `DEFAULT 'Active'` | Operational tag state |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Tag encoding timestamp |

> **Referential Action:** `FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE`

---

### 4. `members` Table
Stores student and faculty patrons.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `member_id` | `INT` | `PRIMARY KEY, AUTO_INCREMENT` | Unique member identifier |
| `name` | `VARCHAR(120)` | `NOT NULL` | Full name of patron |
| `email` | `VARCHAR(120)` | `NOT NULL, UNIQUE` | Institutional email |
| `phone` | `VARCHAR(25)` | `NOT NULL` | Mobile phone number |
| `status` | `ENUM('Active', 'Inactive')` | `DEFAULT 'Active'` | Borrowing eligibility |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Account creation date |

---

### 5. `transactions` Table
Logs all circulation check-out and check-in events.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `transaction_id` | `INT` | `PRIMARY KEY, AUTO_INCREMENT` | Unique transaction ID |
| `book_id` | `INT` | `NOT NULL, FOREIGN KEY` | References `books(book_id)` |
| `member_id` | `INT` | `NOT NULL, FOREIGN KEY` | References `members(member_id)` |
| `rfid_id` | `VARCHAR(50)` | `NOT NULL, FOREIGN KEY` | References `rfid_tags(rfid_id)` |
| `issue_date` | `DATE` | `NOT NULL` | Date when book was borrowed |
| `due_date` | `DATE` | `NOT NULL` | Scheduled deadline for return |
| `return_date` | `DATE` | `NULL` | Actual return date (NULL if out) |
| `status` | `ENUM('Issued', 'Returned')` | `DEFAULT 'Issued'` | Current loan status |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Record timestamp |

> **Referential Action:** Cascades delete on `book_id`, `member_id`, and `rfid_id`.

---

### 6. `fines` Table
Dedicated ledger for overdue penalty charges.

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `fine_id` | `INT` | `PRIMARY KEY, AUTO_INCREMENT` | Unique fine receipt ID |
| `transaction_id` | `INT` | `NOT NULL, UNIQUE, FOREIGN KEY` | References `transactions(transaction_id)` |
| `overdue_days` | `INT` | `NOT NULL DEFAULT 0` | Days elapsed past due date |
| `fine_amount` | `DECIMAL(10, 2)` | `NOT NULL DEFAULT 0.00` | Calculated penalty |
| `fine_status` | `ENUM('Paid', 'Unpaid')` | `DEFAULT 'Unpaid'` | Settlement status |
| `paid_date` | `DATE` | `NULL` | Date when dues were cleared |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Invoiced timestamp |

---

## 2. Relational Integrity & Normalization Justification

### 1NF (First Normal Form)
- Every column contains atomic (scalar) values. There are no repeating groups or comma-separated lists (e.g., member phones or multiple book loans).

### 2NF (Second Normal Form)
- All tables are in 1NF and all non-key attributes are fully functionally dependent on the entire primary key. There are no composite keys with partial dependencies.

### 3NF (Third Normal Form)
- Every non-key column is directly dependent on the primary key, with zero transitive dependencies:
  - RFID tags are separated into `rfid_tags` rather than being stored redundantly in `transactions`.
  - Fine accounting is separated into `fines`, depending strictly on `transaction_id`.

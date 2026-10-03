# REST API Documentation

**Base URL:** `http://localhost:5000/api`  
**Content-Type:** `application/json`  
**Authorization:** `Bearer <JWT_TOKEN>` (Required for protected endpoints)

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
Authenticates a user and returns a signed JWT.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123",
  "role": "admin"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "username": "admin",
    "role": "admin",
    "full_name": "Chief Administrator",
    "email": "admin@collegelibrary.edu"
  }
}
```

---

## 2. Book Catalog Endpoints

### `GET /api/books`
Retrieves book records joined with mapped RFID tag information.

**Query Parameters:**
- `search` *(optional)*: Search string matching title, author, isbn, or rfid.
- `category` *(optional)*: Filter by subject category (e.g., `Database`).
- `status` *(optional)*: Filter by availability (`Available` or `Issued`).

**Success Response (200 OK):**
```json
[
  {
    "book_id": 1,
    "title": "Database System Concepts",
    "author": "Abraham Silberschatz, Henry Korth",
    "category": "Database",
    "isbn": "978-0078022159",
    "status": "Available",
    "rfid_id": "RFID001",
    "tag_code": "EPC_9876543201"
  }
]
```

### `GET /api/books/:id`
Retrieves a specific book by ID.

### `POST /api/books`
Registers a new book and maps its RFID tag code.

**Request Body:**
```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "category": "Software Engineering",
  "isbn": "978-0132350884",
  "rfid_id": "RFID005",
  "status": "Available"
}
```

### `PUT /api/books/:id`
Updates book metadata and re-links RFID tag.

### `DELETE /api/books/:id`
Removes a book and cascades deletion to `rfid_tags`.

---

## 3. Member Management Endpoints

### `GET /api/members`
Retrieves patron directory with current active loan counts.

**Query Parameters:**
- `search` *(optional)*: Search string matching name, email, or phone.

### `POST /api/members`
Registers a new student or faculty member.

**Request Body:**
```json
{
  "name": "Ananya Sen",
  "email": "ananya.sen@college.edu",
  "phone": "+91 98765 00000",
  "status": "Active"
}
```

### `PUT /api/members/:id`
Updates member contact info or changes status to Inactive.

### `DELETE /api/members/:id`
Deletes a member record.

---

## 4. RFID Software Simulation Endpoints

### `GET /api/rfid/tags`
Returns all registered RFID tag mappings with current shelf statuses.

### `POST /api/rfid/scan`
Simulates scanning an RFID tag.

**Request Body:**
```json
{
  "rfid_id": "RFID001"
}
```

**Success Response (200 OK):**
```json
{
  "message": "Book identified successfully.",
  "book": {
    "book_id": 1,
    "title": "Database System Concepts",
    "author": "Abraham Silberschatz, Henry Korth",
    "category": "Database",
    "isbn": "978-0078022159",
    "status": "Available",
    "rfid_id": "RFID001"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "RFID tag not found. No registered book is linked with tag 'INVALID999'."
}
```

---

## 5. Circulation & Transaction Endpoints

### `POST /api/transactions/issue`
Issues a book to a member using RFID tag identification.

**Request Body:**
```json
{
  "member_id": 1,
  "rfid_id": "RFID001",
  "issue_date": "2026-09-14",
  "due_date": "2026-09-28"
}
```

**Workflow:**
1. Verifies book shelf status is `Available`.
2. Verifies member status is `Active`.
3. Creates a transaction row with status `Issued`.
4. Updates `books.status = 'Issued'`.

### `POST /api/transactions/return`
Processes book return and automatically calculates overdue penalties.

**Request Body:**
```json
{
  "rfid_id": "RFID002",
  "return_date": "2026-09-14"
}
```

**Workflow:**
1. Locates active loan for this RFID tag.
2. Compares `return_date` against `due_date`.
3. Computes: $\text{Fine} = \text{Overdue Days} \times ₹5$.
4. Updates loan to `Returned` and book to `Available`.
5. If fine $> 0$, records overdue debt in `fines` table.

---

## 6. Fines & Dues Endpoints

### `GET /api/fines`
Returns overdue fines.  
*Query:* `?status=Unpaid` or `?status=Paid`.

### `PUT /api/fines/:id/pay`
Marks fine invoice as Paid and sets `paid_date = CURDATE()`.

---

## 7. Inventory & Stock Verification Endpoints

### `GET /api/inventory`
Returns total stock metrics and full verification table with RFID presence status.

---

## 8. Recommendations Endpoints

### `GET /api/recommendations`
Returns rule-based recommended titles based on `?book_id=` or `?member_id=`.

---

## 9. Dashboard Analytics Endpoints

### `GET /api/dashboard/stats`
Returns total books, available count, issued count, patrons count, overdue loans, and fine aggregates.

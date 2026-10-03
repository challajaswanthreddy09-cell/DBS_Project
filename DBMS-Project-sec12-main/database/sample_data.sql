-- =============================================================================
-- SMART LIBRARY MANAGEMENT SYSTEM WITH RFID INTEGRATION
-- Seed Data Script (sample_data.sql)
-- Realistic Computer Science Books, Mapped RFID Tags, Members, Loans & Fines
-- =============================================================================

USE library_rfid;

-- Clear previous records safely
DELETE FROM fines;
DELETE FROM transactions;
DELETE FROM rfid_tags;
DELETE FROM books;
DELETE FROM members;
DELETE FROM users;

-- =============================================================================
-- 1. SEED USERS (Bcrypt Hashes for admin123 and librarian123)
-- =============================================================================
INSERT INTO users (user_id, username, password, role, full_name, email) VALUES
(1, 'admin', '$2b$10$N2dwG/OBApeHPhag0VzLOOMN1Ev2Iuw3ZHDa4qjXV2WYGC9bLZiBm', 'admin', 'Chief Administrator', 'admin@collegelibrary.edu'),
(2, 'librarian', '$2b$10$PGunBMh1F.VOtcZ/bFO9zuspVUiaPOEr2D26vrcX4sXTOmWY/qRUW', 'librarian', 'Assistant Librarian', 'librarian@collegelibrary.edu');

-- =============================================================================
-- 2. SEED BOOKS (8 Core Computer Science / Engineering Catalog Titles)
-- =============================================================================
INSERT INTO books (book_id, title, author, category, isbn, status) VALUES
(1, 'Database System Concepts', 'Abraham Silberschatz, Henry Korth', 'Database', '978-0078022159', 'Available'),
(2, 'Fundamentals of Database Systems', 'Ramez Elmasri, Shamkant Navathe', 'Database', '978-0133970777', 'Issued'),
(3, 'Operating System Concepts', 'Abraham Silberschatz, Peter Galvin', 'Operating Systems', '978-1118063330', 'Available'),
(4, 'Computer Networks', 'Andrew S. Tanenbaum, David Wetherall', 'Networking', '978-0132126953', 'Issued'),
(5, 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', 'Software Engineering', '978-0132350884', 'Available'),
(6, 'Data Structures and Algorithms Made Easy', 'Narasimha Karumanchi', 'Data Structures', '978-8193245279', 'Available'),
(7, 'Java: The Complete Reference', 'Herbert Schildt', 'Programming', '978-1260440232', 'Available'),
(8, 'Software Engineering: A Practitioner''s Approach', 'Roger S. Pressman, Bruce Maxim', 'Software Engineering', '978-0078022128', 'Issued');

-- =============================================================================
-- 3. SEED RFID TAGS (Software RFID Simulation Tag Mapping)
-- =============================================================================
INSERT INTO rfid_tags (rfid_id, book_id, tag_code, status) VALUES
('RFID001', 1, 'EPC_9876543201', 'Active'),
('RFID002', 2, 'EPC_9876543202', 'Active'),
('RFID003', 3, 'EPC_9876543203', 'Active'),
('RFID004', 4, 'EPC_9876543204', 'Active'),
('RFID005', 5, 'EPC_9876543205', 'Active'),
('RFID006', 6, 'EPC_9876543206', 'Active'),
('RFID007', 7, 'EPC_9876543207', 'Active'),
('RFID008', 8, 'EPC_9876543208', 'Active');

-- =============================================================================
-- 4. SEED MEMBERS (Student and Faculty Patrons)
-- =============================================================================
INSERT INTO members (member_id, name, email, phone, status) VALUES
(1, 'Rahul Sharma', 'rahul.sharma@college.edu', '+91 98765 43210', 'Active'),
(2, 'Priya Patel', 'priya.patel@college.edu', '+91 98765 43211', 'Active'),
(3, 'Amit Kumar', 'amit.kumar@college.edu', '+91 98765 43212', 'Active'),
(4, 'Sneha Reddy', 'sneha.reddy@college.edu', '+91 98765 43213', 'Active'),
(5, 'Vikram Singh', 'vikram.singh@college.edu', '+91 98765 43214', 'Inactive');

-- =============================================================================
-- 5. SEED CIRCULATION TRANSACTIONS (Active Loans & Historical Returns)
-- =============================================================================
INSERT INTO transactions (transaction_id, book_id, member_id, rfid_id, issue_date, due_date, return_date, status) VALUES
(1001, 2, 1, 'RFID002', '2026-08-15', '2026-08-29', NULL, 'Issued'),
(1002, 4, 2, 'RFID004', '2026-08-10', '2026-08-24', NULL, 'Issued'),
(1003, 8, 4, 'RFID008', '2026-09-08', '2026-09-22', NULL, 'Issued'),
(1004, 1, 3, 'RFID001', '2026-08-01', '2026-08-15', '2026-08-17', 'Returned'),
(1005, 3, 5, 'RFID003', '2026-07-20', '2026-08-03', '2026-08-03', 'Returned');

-- =============================================================================
-- 6. SEED FINES (Overdue Fines at ₹5 / Day Rate)
-- =============================================================================
INSERT INTO fines (fine_id, transaction_id, overdue_days, fine_amount, fine_status, paid_date) VALUES
(1, 1001, 7, 35.00, 'Unpaid', NULL),
(2, 1002, 10, 50.00, 'Unpaid', NULL),
(3, 1004, 2, 10.00, 'Paid', '2026-08-17');

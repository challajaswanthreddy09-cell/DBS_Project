-- =============================================================================
-- SMART LIBRARY MANAGEMENT SYSTEM WITH RFID INTEGRATION
-- Database Name: library_rfid
-- 3NF Normalized Relational Schema for B.Tech/B.E. DBMS Academic Project
-- =============================================================================

CREATE DATABASE IF NOT EXISTS library_rfid;
USE library_rfid;

-- Drop dependent tables in reverse order of foreign keys
DROP TABLE IF EXISTS fines;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS rfid_tags;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS members;

-- =============================================================================
-- 1. MEMBERS TABLE (Student and Faculty Patrons)
-- =============================================================================
CREATE TABLE members (
  member_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  phone VARCHAR(25) NOT NULL,
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_members_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 2. USERS TABLE (System Administrators, Librarians & Students)
-- =============================================================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(60) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL COMMENT 'Bcrypt encrypted password hash',
  role ENUM('admin', 'librarian', 'student') NOT NULL DEFAULT 'student',
  member_id INT NULL UNIQUE COMMENT 'Links student accounts to members table',
  full_name VARCHAR(120) NULL,
  email VARCHAR(120) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_member FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 3. BOOKS TABLE (Catalog Titles)
-- =============================================================================
CREATE TABLE books (
  book_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  author VARCHAR(120) NOT NULL,
  category VARCHAR(80) NOT NULL,
  isbn VARCHAR(40) NOT NULL UNIQUE,
  status ENUM('Available', 'Issued') NOT NULL DEFAULT 'Available',
  rfid_id VARCHAR(50) NOT NULL UNIQUE,
  tag_code VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_books_category (category),
  INDEX idx_books_status (status),
  INDEX idx_books_rfid (rfid_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 4. RFID_TAGS TABLE (Software RFID Tag Simulation Mapping)
-- 1-to-1 relationship with books table
-- =============================================================================
CREATE TABLE rfid_tags (
  rfid_id VARCHAR(50) PRIMARY KEY COMMENT 'Digital RFID Tag Code e.g. RFID001',
  book_id INT NOT NULL UNIQUE COMMENT 'Foreign key to books table',
  tag_code VARCHAR(60) NOT NULL UNIQUE COMMENT 'Electronic Product Code / Hex Simulation',
  status ENUM('Active', 'Inactive', 'Damaged') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rfid_book FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 5. TRANSACTIONS TABLE (Issue & Return Circulation History)
-- =============================================================================
CREATE TABLE transactions (
  transaction_id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  member_id INT NOT NULL,
  rfid_id VARCHAR(50) NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE NULL,
  status ENUM('Issued', 'Returned') NOT NULL DEFAULT 'Issued',
  fine DECIMAL(10, 2) DEFAULT 0.00,
  fine_status ENUM('Paid', 'Unpaid') DEFAULT 'Paid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transactions_book FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
  CONSTRAINT fk_transactions_member FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
  INDEX idx_transactions_status (status),
  INDEX idx_transactions_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 6. FINES TABLE (Overdue Penalty Engine)
-- =============================================================================
CREATE TABLE fines (
  fine_id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT NOT NULL UNIQUE,
  overdue_days INT NOT NULL DEFAULT 0,
  fine_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Calculated: Overdue Days * Fine Per Day',
  fine_status ENUM('Paid', 'Unpaid') NOT NULL DEFAULT 'Unpaid',
  paid_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fines_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
  INDEX idx_fines_status (fine_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

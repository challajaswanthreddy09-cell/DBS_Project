-- =============================================================================
-- SMART LIBRARY MANAGEMENT SYSTEM - STUDENT ROLE MIGRATION
-- Database Name: library_rfid
-- Adds 'student' role to users table and links users to members table
-- =============================================================================

USE library_rfid;

-- 1. Extend role ENUM to include 'student'
ALTER TABLE users 
MODIFY COLUMN role ENUM('admin', 'librarian', 'student') NOT NULL DEFAULT 'student';

-- 2. Add member_id column to users table if not exists
SET @exist_col := (
  SELECT COUNT(*) FROM information_schema.columns 
  WHERE table_schema = 'library_rfid' 
    AND table_name = 'users' 
    AND column_name = 'member_id'
);
SET @sql_col := IF(@exist_col = 0, 
  'ALTER TABLE users ADD COLUMN member_id INT NULL UNIQUE AFTER role;', 
  'SELECT "Column member_id already exists";'
);
PREPARE stmt FROM @sql_col;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Add foreign key from users.member_id to members.member_id if not exists
SET @exist_fk := (
  SELECT COUNT(*) FROM information_schema.table_constraints 
  WHERE table_schema = 'library_rfid' 
    AND table_name = 'users' 
    AND constraint_name = 'fk_users_member'
);
SET @sql_fk := IF(@exist_fk = 0, 
  'ALTER TABLE users ADD CONSTRAINT fk_users_member FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE SET NULL;', 
  'SELECT "Foreign key fk_users_member already exists";'
);
PREPARE stmt_fk FROM @sql_fk;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk;

-- 4. Add full_name and email columns to users table for compatibility if not exists
SET @exist_name := (
  SELECT COUNT(*) FROM information_schema.columns 
  WHERE table_schema = 'library_rfid' 
    AND table_name = 'users' 
    AND column_name = 'full_name'
);
SET @sql_name := IF(@exist_name = 0, 
  'ALTER TABLE users ADD COLUMN full_name VARCHAR(120) NULL AFTER member_id;', 
  'SELECT "Column full_name already exists";'
);
PREPARE stmt_name FROM @sql_name;
EXECUTE stmt_name;
DEALLOCATE PREPARE stmt_name;

SET @exist_email := (
  SELECT COUNT(*) FROM information_schema.columns 
  WHERE table_schema = 'library_rfid' 
    AND table_name = 'users' 
    AND column_name = 'email'
);
SET @sql_email := IF(@exist_email = 0, 
  'ALTER TABLE users ADD COLUMN email VARCHAR(120) NULL AFTER full_name;', 
  'SELECT "Column email already exists";'
);
PREPARE stmt_email FROM @sql_email;
EXECUTE stmt_email;
DEALLOCATE PREPARE stmt_email;

-- 5. Seed default student login account linked to Member #1 (Aarav Sharma)
-- Password for demo student is 'student123' (bcrypt hash)
INSERT INTO users (username, password, role, member_id, full_name, email)
VALUES (
  'student',
  '$2b$10$T89xM16KqPuhyA.e9u1u4eqtJqZ8Z3wMh7x7zFkO0c2fKkZc4i5zG',
  'student',
  1,
  'Aarav Sharma',
  'aarav.sharma@example.com'
)
ON DUPLICATE KEY UPDATE 
  role = 'student',
  member_id = 1,
  full_name = 'Aarav Sharma',
  email = 'aarav.sharma@example.com';

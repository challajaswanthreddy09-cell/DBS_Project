/**
 * CENTRALIZED SAMPLE DATA
 * Used for Frontend standalone simulation (Stage 1) and test fallbacks.
 * All books are based on standard Computer Science / Engineering university syllabus.
 */

export const INITIAL_BOOKS = [
  {
    book_id: 1,
    title: "Database System Concepts",
    author: "Abraham Silberschatz, Henry Korth",
    category: "Database",
    isbn: "978-0078022159",
    rfid_id: "RFID001",
    status: "Available"
  },
  {
    book_id: 2,
    title: "Fundamentals of Database Systems",
    author: "Ramez Elmasri, Shamkant Navathe",
    category: "Database",
    isbn: "978-0133970777",
    rfid_id: "RFID002",
    status: "Issued"
  },
  {
    book_id: 3,
    title: "Operating System Concepts",
    author: "Abraham Silberschatz, Peter Galvin",
    category: "Operating Systems",
    isbn: "978-1118063330",
    rfid_id: "RFID003",
    status: "Available"
  },
  {
    book_id: 4,
    title: "Computer Networks",
    author: "Andrew S. Tanenbaum, David Wetherall",
    category: "Networking",
    isbn: "978-0132126953",
    rfid_id: "RFID004",
    status: "Issued"
  },
  {
    book_id: 5,
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    category: "Software Engineering",
    isbn: "978-0132350884",
    rfid_id: "RFID005",
    status: "Available"
  },
  {
    book_id: 6,
    title: "Data Structures and Algorithms Made Easy",
    author: "Narasimha Karumanchi",
    category: "Data Structures",
    isbn: "978-8193245279",
    rfid_id: "RFID006",
    status: "Available"
  },
  {
    book_id: 7,
    title: "Java: The Complete Reference",
    author: "Herbert Schildt",
    category: "Programming",
    isbn: "978-1260440232",
    rfid_id: "RFID007",
    status: "Available"
  },
  {
    book_id: 8,
    title: "Software Engineering: A Practitioner's Approach",
    author: "Roger S. Pressman, Bruce Maxim",
    category: "Software Engineering",
    isbn: "978-0078022128",
    rfid_id: "RFID008",
    status: "Issued"
  },
  {
    book_id: 9,
    title: "Introduction to Algorithms (CLRS)",
    author: "Thomas Cormen, Charles Leiserson",
    category: "Algorithms",
    isbn: "978-0262033848",
    rfid_id: "RFID009",
    status: "Available"
  },
  {
    book_id: 10,
    title: "Modern Operating Systems",
    author: "Andrew S. Tanenbaum",
    category: "Operating Systems",
    isbn: "978-0133591620",
    rfid_id: "RFID010",
    status: "Available"
  }
];

export const INITIAL_MEMBERS = [
  {
    member_id: 1,
    name: "Rahul Sharma",
    email: "rahul.sharma@college.edu",
    phone: "+91 98765 43210",
    status: "Active",
    books_issued: 1
  },
  {
    member_id: 2,
    name: "Priya Patel",
    email: "priya.patel@college.edu",
    phone: "+91 98765 43211",
    status: "Active",
    books_issued: 1
  },
  {
    member_id: 3,
    name: "Amit Kumar",
    email: "amit.kumar@college.edu",
    phone: "+91 98765 43212",
    status: "Active",
    books_issued: 0
  },
  {
    member_id: 4,
    name: "Sneha Reddy",
    email: "sneha.reddy@college.edu",
    phone: "+91 98765 43213",
    status: "Active",
    books_issued: 1
  },
  {
    member_id: 5,
    name: "Vikram Singh",
    email: "vikram.singh@college.edu",
    phone: "+91 98765 43214",
    status: "Inactive",
    books_issued: 0
  }
];

export const INITIAL_RFID_TAGS = [
  { rfid_id: "RFID001", book_id: 1, tag_code: "E200001001", status: "Active" },
  { rfid_id: "RFID002", book_id: 2, tag_code: "E200001002", status: "Active" },
  { rfid_id: "RFID003", book_id: 3, tag_code: "E200001003", status: "Active" },
  { rfid_id: "RFID004", book_id: 4, tag_code: "E200001004", status: "Active" },
  { rfid_id: "RFID005", book_id: 5, tag_code: "E200001005", status: "Active" },
  { rfid_id: "RFID006", book_id: 6, tag_code: "E200001006", status: "Active" },
  { rfid_id: "RFID007", book_id: 7, tag_code: "E200001007", status: "Active" },
  { rfid_id: "RFID008", book_id: 8, tag_code: "E200001008", status: "Active" },
  { rfid_id: "RFID009", book_id: 9, tag_code: "E200001009", status: "Active" },
  { rfid_id: "RFID010", book_id: 10, tag_code: "E200001010", status: "Active" }
];

export const INITIAL_TRANSACTIONS = [
  {
    transaction_id: 1001,
    book_id: 2,
    book_title: "Fundamentals of Database Systems",
    member_id: 1,
    member_name: "Rahul Sharma",
    rfid_id: "RFID002",
    issue_date: "2026-08-15",
    due_date: "2026-08-29",
    return_date: null,
    status: "Issued",
    fine: 35,
    fine_status: "Unpaid"
  },
  {
    transaction_id: 1002,
    book_id: 4,
    book_title: "Computer Networks",
    member_id: 2,
    member_name: "Priya Patel",
    rfid_id: "RFID004",
    issue_date: "2026-08-10",
    due_date: "2026-08-24",
    return_date: null,
    status: "Issued",
    fine: 50,
    fine_status: "Unpaid"
  },
  {
    transaction_id: 1003,
    book_id: 8,
    book_title: "Software Engineering: A Practitioner's Approach",
    member_id: 4,
    member_name: "Sneha Reddy",
    rfid_id: "RFID008",
    issue_date: "2026-09-08",
    due_date: "2026-09-22",
    return_date: null,
    status: "Issued",
    fine: 0,
    fine_status: "Paid"
  },
  {
    transaction_id: 1004,
    book_id: 1,
    book_title: "Database System Concepts",
    member_id: 3,
    member_name: "Amit Kumar",
    rfid_id: "RFID001",
    issue_date: "2026-08-01",
    due_date: "2026-08-15",
    return_date: "2026-08-17",
    status: "Returned",
    fine: 10,
    fine_status: "Paid"
  },
  {
    transaction_id: 1005,
    book_id: 3,
    book_title: "Operating System Concepts",
    member_id: 5,
    member_name: "Vikram Singh",
    rfid_id: "RFID003",
    issue_date: "2026-07-20",
    due_date: "2026-08-03",
    return_date: "2026-08-03",
    status: "Returned",
    fine: 0,
    fine_status: "Paid"
  }
];

export const INITIAL_FINES = [
  {
    fine_id: 1,
    transaction_id: 1001,
    member_name: "Rahul Sharma",
    book_title: "Fundamentals of Database Systems",
    due_date: "2026-08-29",
    return_date: "-",
    overdue_days: 7,
    fine_amount: 35,
    fine_status: "Unpaid"
  },
  {
    fine_id: 2,
    transaction_id: 1002,
    member_name: "Priya Patel",
    book_title: "Computer Networks",
    due_date: "2026-08-24",
    return_date: "-",
    overdue_days: 10,
    fine_amount: 50,
    fine_status: "Unpaid"
  },
  {
    fine_id: 3,
    transaction_id: 1004,
    member_name: "Amit Kumar",
    book_title: "Database System Concepts",
    due_date: "2026-08-15",
    return_date: "2026-08-17",
    overdue_days: 2,
    fine_amount: 10,
    fine_status: "Paid"
  }
];

export const DEFAULT_FINE_RATE_PER_DAY = 5; // Rs. 5 per overdue day

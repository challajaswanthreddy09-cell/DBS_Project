import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Printer,
  Download,
  BookOpen,
  Users,
  Clock,
  CircleDollarSign,
  Boxes,
  Filter
} from "lucide-react";
import Button from "../components/Button";
import api from "../api/client";
import {
  INITIAL_BOOKS,
  INITIAL_MEMBERS,
  INITIAL_TRANSACTIONS,
  INITIAL_FINES
} from "../data/sampleData";

/**
 * Reports & Analytics Page (Reports.jsx)
 * Connects to Express GET /api/reports/:type (books, members, transactions, fines).
 * Includes visual distribution charts, status filters, and instant browser print/download capability.
 */
export default function Reports() {
  const [reportType, setReportType] = useState("books");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [books, setBooks] = useState(() => {
    const saved = localStorage.getItem("libraryBooks");
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem("libraryMembers");
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("libraryTransactions");
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });
  const [fines, setFines] = useState(() => {
    const saved = localStorage.getItem("libraryFines");
    return saved ? JSON.parse(saved) : INITIAL_FINES;
  });

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const res = await api.get(`/reports/${reportType}`);
        if (res.data && Array.isArray(res.data)) {
          if (reportType === "books") setBooks(res.data);
          else if (reportType === "members") setMembers(res.data);
          else if (reportType === "transactions") setTransactions(res.data);
          else if (reportType === "fines") setFines(res.data);
        }
      } catch (err) {
        console.warn(`API GET /reports/${reportType} offline, using cached/local data:`, err.message);
      }
    };
    fetchReportData();
  }, [reportType]);

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = `Library_${reportType}_report.csv`;

    if (reportType === "books") {
      csvContent += "ID,Title,Author,Category,ISBN,RFID,Status\n";
      books.forEach((b) => {
        csvContent += `"${b.book_id}","${b.title}","${b.author}","${b.category}","${b.isbn}","${b.rfid_id}","${b.status}"\n`;
      });
    } else if (reportType === "members") {
      csvContent += "ID,Name,Email,Phone,BooksIssued,Status\n";
      members.forEach((m) => {
        csvContent += `"${m.member_id}","${m.name}","${m.email}","${m.phone}","${m.books_issued}","${m.status}"\n`;
      });
    } else if (reportType === "transactions") {
      csvContent += "TxID,BookTitle,MemberName,IssueDate,DueDate,ReturnDate,Status,Fine\n";
      transactions.forEach((t) => {
        csvContent += `"${t.transaction_id}","${t.book_title}","${t.member_name}","${t.issue_date}","${t.due_date}","${t.return_date || "-"}","${t.status}","${t.fine}"\n`;
      });
    } else if (reportType === "fines") {
      csvContent += "FineID,TxID,MemberName,BookTitle,DueDate,OverdueDays,FineAmount,Status\n";
      fines.forEach((f) => {
        csvContent += `"${f.fine_id}","${f.transaction_id}","${f.member_name}","${f.book_title}","${f.due_date}","${f.overdue_days}","${f.fine_amount}","${f.fine_status}"\n`;
      });
    } else {
      csvContent += "BookID,Title,RFID,Status,Verification\n";
      books.forEach((b) => {
        csvContent += `"${b.book_id}","${b.title}","${b.rfid_id}","${b.status}","Verified"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Category distribution calculation for visual chart
  const categoryCounts = books.reduce((acc, b) => {
    acc[b.category] = (acc[b.category] || 0) + 1;
    return acc;
  }, {});

  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);

  return (
    <div className="reports-page">
      {/* Top Header Row with Export Actions */}
      <div className="page-header-actions-row no-print">
        <div>
          <h2>Circulation Reports & Analytics</h2>
          <p className="text-muted text-sm">
            Generate and export official library audit reports, circulation summaries, and overdue dues.
          </p>
        </div>
        <div className="flex-center-gap">
          <Button variant="outline" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="primary" icon={Printer} onClick={handlePrint}>
            Print Report / Save PDF
          </Button>
        </div>
      </div>

      {/* Report Module Tabs */}
      <div className="report-tabs-row card no-print">
        <button
          className={`report-tab-btn ${reportType === "books" ? "active" : ""}`}
          onClick={() => setReportType("books")}
        >
          <BookOpen size={16} />
          <span>Book Catalog Report</span>
        </button>
        <button
          className={`report-tab-btn ${reportType === "members" ? "active" : ""}`}
          onClick={() => setReportType("members")}
        >
          <Users size={16} />
          <span>Member Directory Report</span>
        </button>
        <button
          className={`report-tab-btn ${reportType === "transactions" ? "active" : ""}`}
          onClick={() => setReportType("transactions")}
        >
          <Clock size={16} />
          <span>Issue / Return Report</span>
        </button>
        <button
          className={`report-tab-btn ${reportType === "fines" ? "active" : ""}`}
          onClick={() => setReportType("fines")}
        >
          <CircleDollarSign size={16} />
          <span>Fine & Dues Report</span>
        </button>
        <button
          className={`report-tab-btn ${reportType === "inventory" ? "active" : ""}`}
          onClick={() => setReportType("inventory")}
        >
          <Boxes size={16} />
          <span>Stock Audit Report</span>
        </button>
      </div>

      {/* Visual Bar Chart for Subject Category Distribution */}
      <div className="card mb-4 no-print">
        <div className="card-header-clean">
          <div className="flex-center-gap">
            <BarChart3 size={18} className="text-secondary" />
            <h3 className="text-base font-semibold">Subject Category Distribution</h3>
          </div>
          <span className="badge-pill">Collection Analytics</span>
        </div>

        <div className="chart-bars-horizontal">
          {Object.entries(categoryCounts).map(([cat, count]) => {
            const widthPct = Math.round((count / maxCategoryCount) * 100);
            return (
              <div key={cat} className="chart-bar-row">
                <span className="chart-bar-label">{cat}</span>
                <div className="chart-bar-track">
                  <div className="chart-bar-fill" style={{ width: `${widthPct}%` }}></div>
                </div>
                <span className="chart-bar-val">{count} Books</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="printable-report-sheet card">
        <div className="report-doc-header">
          <div>
            <h3 className="report-doc-title">SMART LIBRARY MANAGEMENT SYSTEM</h3>
            <p className="report-doc-sub">OFFICIAL {reportType.toUpperCase()} AUDIT REPORT</p>
          </div>
          <div className="report-doc-meta">
            <span>Date: {new Date().toLocaleDateString()}</span>
            <span>Generated By: Library Administrator</span>
            <span className="font-mono text-xs">RFID Middleware Sim v1.0</span>
          </div>
        </div>

        {/* Dynamic Report Table */}
        {reportType === "books" && (
          <table className="report-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>ISBN</th>
                <th>RFID Tag</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.book_id}>
                  <td>#{b.book_id}</td>
                  <td><strong>{b.title}</strong></td>
                  <td>{b.author}</td>
                  <td>{b.category}</td>
                  <td className="font-mono">{b.isbn}</td>
                  <td className="font-mono">{b.rfid_id}</td>
                  <td>{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {reportType === "members" && (
          <table className="report-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Member Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Books Issued</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.member_id}>
                  <td>MEM-{String(m.member_id).padStart(3, "0")}</td>
                  <td><strong>{m.name}</strong></td>
                  <td>{m.email}</td>
                  <td>{m.phone}</td>
                  <td>{m.books_issued || 0}</td>
                  <td>{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {reportType === "transactions" && (
          <table className="report-table">
            <thead>
              <tr>
                <th>Tx ID</th>
                <th>Book Title</th>
                <th>Member Name</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Fine</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.transaction_id}>
                  <td>TR-{t.transaction_id}</td>
                  <td><strong>{t.book_title}</strong></td>
                  <td>{t.member_name}</td>
                  <td>{t.issue_date}</td>
                  <td>{t.due_date}</td>
                  <td>{t.return_date || "Pending"}</td>
                  <td>{t.status}</td>
                  <td>₹{t.fine || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {reportType === "fines" && (
          <table className="report-table">
            <thead>
              <tr>
                <th>Fine ID</th>
                <th>Tx ID</th>
                <th>Member</th>
                <th>Book Title</th>
                <th>Due Date</th>
                <th>Overdue Days</th>
                <th>Fine Amount</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {fines.map((f) => (
                <tr key={f.fine_id}>
                  <td>FN-{f.fine_id}</td>
                  <td>TR-{f.transaction_id}</td>
                  <td>{f.member_name}</td>
                  <td>{f.book_title}</td>
                  <td>{f.due_date}</td>
                  <td>{f.overdue_days} Days</td>
                  <td><strong>₹{f.fine_amount}</strong></td>
                  <td>{f.fine_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {reportType === "inventory" && (
          <table className="report-table">
            <thead>
              <tr>
                <th>Book ID</th>
                <th>Title</th>
                <th>RFID Tag ID</th>
                <th>Shelf Status</th>
                <th>Verification State</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.book_id}>
                  <td>#{b.book_id}</td>
                  <td><strong>{b.title}</strong></td>
                  <td className="font-mono">{b.rfid_id}</td>
                  <td>{b.status}</td>
                  <td>Verified Present</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="report-doc-footer">
          <p>This report is generated for academic and administrative demonstration of the DBMS Library Management System.</p>
        </div>
      </div>
    </div>
  );
}

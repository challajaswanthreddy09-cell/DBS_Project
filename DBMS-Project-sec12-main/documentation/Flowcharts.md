# System Flowcharts

This document models the core operational processes of the Library Management System with RFID Integration using standard workflow flowcharts.

---

## 1. Automated Book Issue Workflow

```mermaid
flowchart TD
    Start([Start: Issue Request]) --> SelectMember[Select Library Patron from Directory]
    SelectMember --> CheckMemberStatus{Is Member Active?}
    CheckMemberStatus -- No --> MemberError[Show Alert: Patron Account Inactive / Suspended] --> EndIssue([End])
    CheckMemberStatus -- Yes --> ScanRFID[Enter or Scan Digital RFID Tag]
    ScanRFID --> QueryBook[Query MySQL: Find Book by RFID Tag]
    QueryBook --> BookFound{Is Book Registered?}
    BookFound -- No --> RFIDNotFound[Show Alert: RFID Tag Not Found] --> EndIssue
    BookFound -- Yes --> CheckShelfStatus{Is Book Available?}
    CheckShelfStatus -- No --> BookUnavailable[Show Alert: Book Already Issued] --> EndIssue
    CheckShelfStatus -- Yes --> SetDates[Set Issue Date & Due Date +14 Days]
    SetDates --> BeginTx[Begin Database Transaction]
    BeginTx --> InsertTx[Insert Record into transactions Table]
    InsertTx --> UpdateBook[Update books SET status = 'Issued']
    UpdateBook --> CommitTx[Commit Transaction]
    CommitTx --> SuccessMsg[Display Success Receipt & Transaction ID]
    SuccessMsg --> EndIssue
```

---

## 2. Automated Book Return & Fine Engine Workflow

```mermaid
flowchart TD
    Start([Start: Return Request]) --> ScanReturnRFID[Scan / Enter Digital Book RFID Tag]
    ScanReturnRFID --> QueryActiveLoan[Query transactions WHERE status = 'Issued' AND rfid_id = Tag]
    QueryActiveLoan --> LoanFound{Active Loan Found?}
    LoanFound -- No --> AlertNoLoan[Show Alert: No Active Loan Found] --> EndReturn([End])
    LoanFound -- Yes --> CompareDates[Compare Return Date with Due Date]
    CompareDates --> IsOverdue{Is Return Date > Due Date?}
    IsOverdue -- No --> ZeroFine[Set Overdue Days = 0, Fine = ₹0]
    IsOverdue -- Yes --> CalcOverdue[Overdue Days = Return Date - Due Date<br/>Fine = Overdue Days * ₹5/day]
    ZeroFine --> UpdateTx[Update transactions: status='Returned', return_date=today, fine=0]
    CalcOverdue --> RecordFineTx[Update transactions: status='Returned', return_date=today, fine=calcFine]
    RecordFineTx --> InsertFineTable[Insert Overdue Record into fines Table: status='Unpaid']
    InsertFineTable --> ReplenishBook[Update books SET status = 'Available']
    UpdateTx --> ReplenishBook
    ReplenishBook --> ReturnSuccess[Display Return Confirmation & Generated Fine Details]
    ReturnSuccess --> EndReturn
```

---

## 3. RFID Software Simulation Scanner Workflow

```mermaid
flowchart TD
    Start([User Triggers RFID Scan]) --> ReceiveInput[Receive Tag Input e.g. RFID001]
    ReceiveInput --> PostAPI[Frontend dispatches POST /api/rfid/scan]
    PostAPI --> AnimateRadar[Play Antenna UHF Frequency Radar Pulse]
    AnimateRadar --> BackendSearch[Backend searches rfid_tags table in MySQL]
    BackendSearch --> CheckTag{Tag Exists in Database?}
    CheckTag -- No --> Return404[Return HTTP 404: RFID Tag Not Found]
    Return404 --> ShowErrorUI[Render Error Banner: No Book Associated]
    CheckTag -- Yes --> JoinBook[JOIN with books ON book_id]
    JoinBook --> ReturnBookJSON[Return HTTP 200: Full Book JSON Object]
    ReturnBookJSON --> RenderMetadata[Display Book Title, Author, Category, ISBN & Shelf Status]
    RenderMetadata --> ShowActionLinks[Show Direct Link to Issue or Return Book]
    ShowActionLinks --> EndScan([End Scan])
```

---

## 4. Stock Verification & Inventory Audit Flowchart

```mermaid
flowchart TD
    Start([Start: Run Stock Audit]) --> FetchCatalog[Fetch Total Catalog Books from Database]
    FetchCatalog --> ScanShelfTags[Audit Registered RFID Tag Presence]
    ScanShelfTags --> CompareInventory[Compare Registered Shelf Tags vs Catalog Books]
    CompareInventory --> AnyMissing{Any Unmapped or Missing Tags?}
    AnyMissing -- Yes --> FlagDiscrepancy[Flag Missing / Un-tagged Volumes in Audit Table]
    AnyMissing -- No --> MarkAllVerified[Mark 100% of Physical Copies as Verified Present]
    FlagDiscrepancy --> RenderAuditReport[Render Stock Verification Report Table]
    MarkAllVerified --> RenderAuditReport
    RenderAuditReport --> EndAudit([Audit Complete])
```

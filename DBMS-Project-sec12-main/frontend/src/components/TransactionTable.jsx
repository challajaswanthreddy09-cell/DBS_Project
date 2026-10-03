import React from "react";
import { Tag, Calendar, CheckCircle2, Clock } from "lucide-react";

/**
 * Reusable Transaction Table Component
 * Shows circulation log with issue/return dates, overdue status, and fines.
 */
export default function TransactionTable({ transactions, onReturnAction, onPayFineAction }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="empty-state card">
        <p className="empty-title">No transactions recorded</p>
        <p className="empty-sub">Issued and returned books will be recorded here.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive card">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Tx ID</th>
            <th>Book</th>
            <th>Member</th>
            <th>Issue Date</th>
            <th>Due Date</th>
            <th>Return Date</th>
            <th>Status</th>
            <th>Fine</th>
            {(onReturnAction || onPayFineAction) && <th className="text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const isIssued = tx.status === "Issued";
            const hasFine = Number(tx.fine || 0) > 0;
            const isFineUnpaid = tx.fine_status === "Unpaid";

            return (
              <tr key={tx.transaction_id}>
                <td className="font-mono text-muted">TR-{tx.transaction_id}</td>
                <td>
                  <div className="table-item-title">{tx.book_title || `Book #${tx.book_id}`}</div>
                  {tx.rfid_id && (
                    <span className="badge-rfid-inline">
                      <Tag size={11} /> {tx.rfid_id}
                    </span>
                  )}
                </td>
                <td>
                  <div className="font-medium">{tx.member_name || `Member #${tx.member_id}`}</div>
                </td>
                <td className="text-muted text-xs">
                  <span className="flex-center-gap">
                    <Calendar size={12} />
                    {tx.issue_date}
                  </span>
                </td>
                <td className="text-muted text-xs">
                  <span className="flex-center-gap">
                    <Clock size={12} />
                    {tx.due_date}
                  </span>
                </td>
                <td className="text-muted text-xs">{tx.return_date || <span className="text-italic">-</span>}</td>
                <td>
                  <span className={`status-pill ${isIssued ? "status-warning" : "status-available"}`}>
                    {isIssued ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                    {tx.status}
                  </span>
                </td>
                <td>
                  {hasFine ? (
                    <span className={`fine-pill ${isFineUnpaid ? "fine-unpaid" : "fine-paid"}`}>
                      ₹{tx.fine} ({tx.fine_status})
                    </span>
                  ) : (
                    <span className="text-muted text-xs">₹0</span>
                  )}
                </td>
                {(onReturnAction || onPayFineAction) && (
                  <td className="text-right">
                    <div className="table-actions">
                      {isIssued && onReturnAction && (
                        <button
                          onClick={() => onReturnAction(tx)}
                          className="btn-sm btn-return-action"
                          title="Process Return"
                        >
                          Return
                        </button>
                      )}
                      {hasFine && isFineUnpaid && onPayFineAction && (
                        <button
                          onClick={() => onPayFineAction(tx)}
                          className="btn-sm btn-pay-action"
                          title="Clear Fine"
                        >
                          Pay
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

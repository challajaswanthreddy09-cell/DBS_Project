import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Mail, Phone, BookCheck, Shield, RefreshCw } from "lucide-react";
import MemberTable from "../components/MemberTable";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import Button from "../components/Button";
import api from "../api/client";
import { INITIAL_MEMBERS } from "../data/sampleData";

/**
 * Member Management Page (Members.jsx)
 * Connects to Express GET /api/members and DELETE /api/members/:id.
 */
export default function Members() {
  const navigate = useNavigate();
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem("libraryMembers");
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch patrons from Express Backend
  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const q = searchTerm.trim() ? `?search=${encodeURIComponent(searchTerm.trim())}` : "";
      const res = await api.get(`/members${q}`);
      if (res.data && Array.isArray(res.data)) {
        setMembers(res.data);
        localStorage.setItem("libraryMembers", JSON.stringify(res.data));
      }
    } catch (err) {
      console.warn("API GET /members error, using local state:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [searchTerm]);

  const handleDeleteMember = async (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        await api.delete(`/members/${id}`);
        const updated = members.filter((m) => m.member_id !== id);
        setMembers(updated);
        localStorage.setItem("libraryMembers", JSON.stringify(updated));
        showToast("Member record removed.");
      } catch (err) {
        console.error("API DELETE /members/:id error:", err);
        showToast(err.response?.data?.message || "Failed to delete member.");
      }
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <div className="members-page">
      <div className="page-header-actions-row">
        <div>
          <h2>Member Management</h2>
          <p className="text-muted text-sm">View and manage registered student and faculty library patrons.</p>
        </div>
        <Link to="/members/add" className="btn-custom btn-primary">
          <UserPlus size={16} className="mr-1" />
          <span>Add New Member</span>
        </Link>
      </div>

      {toastMessage && <div className="toast-notification">{toastMessage}</div>}

      <div className="filter-toolbar card">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by Member Name, Email, or Phone..."
        />
      </div>

      {isLoading && <div className="text-center py-2 text-muted"><RefreshCw size={18} className="animate-spin inline mr-2" />Syncing patrons from MySQL...</div>}
      <MemberTable
        members={members}
        onView={(member) => setSelectedMember(member)}
        onEdit={(member) => navigate(`/members/edit/${member.member_id}`)}
        onDelete={handleDeleteMember}
      />

      {selectedMember && (
        <Modal
          isOpen={Boolean(selectedMember)}
          onClose={() => setSelectedMember(null)}
          title="Member Profile"
          footer={
            <Button variant="outline" onClick={() => setSelectedMember(null)}>
              Close
            </Button>
          }
        >
          <div className="member-modal-content">
            <div className="member-avatar-block">
              <div className="avatar-circle">{selectedMember.name.charAt(0)}</div>
              <div>
                <h4>{selectedMember.name}</h4>
                <p className="text-muted font-mono">MEM-{String(selectedMember.member_id).padStart(3, "0")}</p>
              </div>
            </div>

            <div className="modal-info-grid mt-4">
              <div className="info-block">
                <span className="info-label">Email Address</span>
                <span className="info-val flex-center-gap">
                  <Mail size={14} /> {selectedMember.email}
                </span>
              </div>
              <div className="info-block">
                <span className="info-label">Contact Phone</span>
                <span className="info-val flex-center-gap">
                  <Phone size={14} /> {selectedMember.phone}
                </span>
              </div>
              <div className="info-block">
                <span className="info-label">Membership Status</span>
                <span
                  className={`status-pill ${
                    selectedMember.status === "Active" ? "status-available" : "status-danger"
                  }`}
                >
                  <Shield size={12} />
                  {selectedMember.status}
                </span>
              </div>
              <div className="info-block">
                <span className="info-label">Active Loans</span>
                <span className="info-val flex-center-gap">
                  <BookCheck size={14} /> {selectedMember.books_issued || 0} books currently issued
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

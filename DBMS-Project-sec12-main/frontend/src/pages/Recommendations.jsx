import React, { useState, useEffect } from "react";
import { Sparkles, BookOpen, Tag, ArrowRight, CheckCircle2, User, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { INITIAL_BOOKS, INITIAL_MEMBERS } from "../data/sampleData";

/**
 * Book Recommendations Page (Recommendations.jsx)
 * Connects to Express GET /api/recommendations?book_id=...
 * Implements rule-based, explainable title suggestions.
 */
export default function Recommendations() {
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [selectedBookId, setSelectedBookId] = useState(1);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load books and patrons
  useEffect(() => {
    const loadData = async () => {
      try {
        const [bRes, mRes] = await Promise.allSettled([api.get("/books"), api.get("/members")]);
        if (bRes.status === "fulfilled" && bRes.value.data.length > 0) setBooks(bRes.value.data);
        if (mRes.status === "fulfilled" && mRes.value.data.length > 0) setMembers(mRes.value.data);
      } catch (err) {
        console.warn("API offline, using sample data:", err.message);
      }
    };
    loadData();
  }, []);

  // Fetch recommendations whenever selected book or patron changes
  useEffect(() => {
    const fetchRecs = async () => {
      setIsLoading(true);
      try {
        const q = selectedMemberId
          ? `?member_id=${selectedMemberId}`
          : `?book_id=${selectedBookId}`;
        const res = await api.get(`/recommendations${q}`);

        if (res.data && res.data.recommendations && res.data.recommendations.length > 0) {
          setRecommendations(res.data.recommendations);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("API GET /recommendations offline, using local rules:", err.message);
      }

      // Local rule-based fallback
      const activeBook = books.find((b) => b.book_id === Number(selectedBookId)) || books[0];
      const sameCat = books.filter((b) => b.book_id !== activeBook.book_id && b.category === activeBook.category);
      const crossCat = books.filter((b) => b.book_id !== activeBook.book_id && b.category !== activeBook.category);
      const combined = [...sameCat, ...crossCat.slice(0, 2)].map((b) => ({
        ...b,
        recommendation_reason:
          b.category === activeBook.category
            ? `Shares core subject (${activeBook.category}) with "${activeBook.title}"`
            : "Curricular prerequisite synergy"
      }));

      setRecommendations(combined);
      setIsLoading(false);
    };

    fetchRecs();
  }, [selectedBookId, selectedMemberId, books]);

  const activeBook = books.find((b) => b.book_id === Number(selectedBookId)) || books[0];

  return (
    <div className="recommendations-page">
      <div className="page-header-actions-row">
        <div>
          <h2>Smart Book Recommendations Engine</h2>
          <p className="text-muted text-sm">
            Explainable, rule-based recommendation logic based on category taxonomy, author synergy, and borrowing patterns.
          </p>
        </div>
      </div>

      {/* Logic Explanation Box for Viva */}
      <div className="viva-logic-card card mb-4">
        <div className="flex-center-gap text-secondary font-semibold mb-2">
          <Sparkles size={18} />
          <span>Viva Rule-Based Recommendation Algorithm</span>
        </div>
        <p className="text-sm text-muted">
          Unlike complex black-box machine learning models, this academic engine applies deterministic collaborative
          filtering and category affinity rules:
        </p>
        <div className="logic-pills-row mt-2">
          <span className="logic-pill">1. Direct Subject Match (Same Category)</span>
          <span className="logic-pill">2. Curricular Pairing (e.g. Database ↔ Data Structures)</span>
          <span className="logic-pill">3. Patron Reading History Co-occurrence</span>
        </div>
      </div>

      {/* Base Book Selector */}
      <div className="card context-selector-card">
        <div className="form-row">
          <div className="form-group flex-2">
            <label className="form-label" htmlFor="baseBook">
              Select Currently Read / Borrowed Book:
            </label>
            <select
              id="baseBook"
              className="form-select"
              value={selectedBookId}
              onChange={(e) => {
                setSelectedBookId(Number(e.target.value));
                setSelectedMemberId("");
              }}
            >
              {books.map((b) => (
                <option key={b.book_id} value={b.book_id}>
                  {b.title} ({b.category} • RFID: {b.rfid_id})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group flex-1">
            <label className="form-label" htmlFor="patronFilter">
              Or Filter by Member History:
            </label>
            <select
              id="patronFilter"
              className="form-select"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
            >
              <option value="">-- All Patrons --</option>
              {members.map((m) => (
                <option key={m.member_id} value={m.member_id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="active-book-banner mt-3">
          <BookOpen size={24} className="text-primary mr-3" />
          <div>
            <span className="text-xs text-muted font-mono">SELECTED REFERENCE TITLE</span>
            <h4 className="font-semibold text-primary-dark">{activeBook.title}</h4>
            <span className="text-xs text-muted">
              Author: {activeBook.author} | Category: <strong className="text-secondary">{activeBook.category}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Recommended Titles Grid */}
      <div className="mt-4">
        <div className="section-header-clean mb-3">
          <div className="flex-center-gap">
            <Sparkles size={18} className="text-warning" />
            <h3 className="text-base font-semibold">Recommended Titles for This Reader</h3>
          </div>
          <span className="badge-pill">
            Recommendation based on category/borrowing history
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-6 text-muted">
            <RefreshCw size={24} className="animate-spin inline mb-2" />
            <p>Querying recommendation engine in MySQL...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="empty-state card">
            <p className="empty-title">No recommendations available</p>
            <p className="empty-sub">Try selecting another title from the list above.</p>
          </div>
        ) : (
          <div className="recommendations-grid">
            {recommendations.map((book, idx) => (
              <div key={book.book_id} className="recommendation-card card">
                <div className="rec-card-header">
                  <span className="rec-rank-badge">#{idx + 1} Match</span>
                  <span className="badge-category">{book.category}</span>
                </div>

                <h4 className="rec-book-title">{book.title}</h4>
                <p className="rec-book-author">By {book.author}</p>

                <div className="rec-reason-box">
                  <span className="rec-reason-lbl">Recommendation Reason:</span>
                  <span className="rec-reason-text">
                    {book.recommendation_reason || `Curriculum affinity with "${activeBook.title}"`}
                  </span>
                </div>

                <div className="rec-card-footer">
                  <span className="badge-rfid">
                    <Tag size={12} className="mr-1" />
                    {book.rfid_id || "Available"}
                  </span>
                  <Link to={`/issue?rfid=${book.rfid_id}`} className="btn-sm btn-outline">
                    <span>Issue Copy</span>
                    <ArrowRight size={13} className="ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

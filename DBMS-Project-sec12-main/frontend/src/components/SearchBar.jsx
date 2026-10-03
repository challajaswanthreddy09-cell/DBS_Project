import React from "react";
import { Search, X } from "lucide-react";

/**
 * Reusable Search Bar Component with quick clear button
 */
export default function SearchBar({ value, onChange, placeholder = "Search...", onClear }) {
  return (
    <div className="search-bar-wrapper">
      <Search className="search-bar-icon" size={18} />
      <input
        type="text"
        className="search-bar-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          className="search-bar-clear"
          onClick={() => {
            if (onClear) onClear();
            else onChange("");
          }}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

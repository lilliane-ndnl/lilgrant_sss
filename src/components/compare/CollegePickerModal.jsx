import React, { useState, useMemo } from "react";
import { X, Search } from "lucide-react";

export default function CollegePickerModal({ colleges, selected, onSelect, onClose }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return colleges.slice(0, 80);
    const q = search.toLowerCase();
    return colleges.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.state?.toLowerCase().includes(q)
    ).slice(0, 80);
  }, [colleges, search]);

  const selectedIds = new Set(selected.map(c => c.id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: "#7a5a9d",
          border: "1px solid rgba(255,255,255,0.2)",
          maxHeight: "80vh",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
          <h2 className="text-white font-semibold">Add a School</h2>
          <button onClick={onClose} className="hover:opacity-70 transition-opacity">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} />
            <input
              autoFocus
              type="text"
              placeholder="Search by name, city, or state…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                backgroundColor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
              }}
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>No schools found.</p>
          ) : (
            filtered.map(college => {
              const isSelected = selectedIds.has(college.id);
              return (
                <button
                  key={college.id}
                  disabled={isSelected}
                  onClick={() => onSelect(college)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-all"
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                    backgroundColor: isSelected ? "rgba(255,255,255,0.05)" : "transparent",
                    opacity: isSelected ? 0.5 : 1,
                    cursor: isSelected ? "default" : "pointer",
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <div>
                    <p className="text-sm font-medium text-white">{college.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {college.city && `${college.city}, `}{college.state} · {college.control_type}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)" }}>
                      Added
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
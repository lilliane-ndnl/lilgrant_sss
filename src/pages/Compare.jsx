import { db } from '@/api/base44Client';
import React, { useState, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { X, Plus, ArrowLeft, Loader2, Search } from "lucide-react";
import CollegePickerModal from "../components/compare/CollegePickerModal";
import CompareTable from "../components/compare/CompareTable";

export default function Compare() {
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [showPicker, setShowPicker] = useState(false);

  const { data: colleges = [], isLoading } = useQuery({
    queryKey: ["colleges"],
    queryFn: () => db.entities.College.list("-created_date", 500),
  });

  const fourYear = useMemo(() =>
    colleges.filter(c =>
      !c.predominant_degree ||
      c.predominant_degree === "Bachelor's" ||
      c.predominant_degree === "Master's" ||
      c.predominant_degree === "Doctoral"
    ),
    [colleges]
  );

  function addCollege(college) {
    if (selectedColleges.length >= 4) return;
    if (selectedColleges.find(c => c.id === college.id)) return;
    setSelectedColleges(prev => [...prev, college]);
    setShowPicker(false);
  }

  function removeCollege(id) {
    setSelectedColleges(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div className="min-h-screen pt-6 pb-16 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <Link
          to="/universities"
          className="inline-flex items-center gap-1 text-sm mb-6 transition-opacity hover:opacity-80"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to University Hub
        </Link>

        <div className="text-center mb-10">
          <div className="text-5xl mb-3">⚖️</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Compare Universities</h1>
          <p className="text-sm max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.7)" }}>
            Select up to 4 schools to compare side-by-side across costs, aid, admissions, and outcomes.
          </p>
        </div>

        {/* School Selector Row */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {selectedColleges.map(college => (
            <div
              key={college.id}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: "white" }}
            >
              <span className="max-w-[160px] truncate">{college.name}</span>
              <button onClick={() => removeCollege(college.id)} className="ml-1 hover:opacity-70 transition-opacity">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {selectedColleges.length < 4 && (
            <button
              onClick={() => setShowPicker(true)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
              style={{ backgroundColor: "rgba(255,255,255,0.88)", color: "#7a5a9d" }}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add School {selectedColleges.length > 0 ? `(${selectedColleges.length}/4)` : ""}
            </button>
          )}

          {selectedColleges.length > 0 && (
            <button
              onClick={() => setSelectedColleges([])}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-70"
              style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)" }}
            >
              Clear All
            </button>
          )}
        </div>

        {/* Empty state */}
        {selectedColleges.length === 0 && (
          <div
            className="text-center py-20 rounded-2xl"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-white font-medium mb-1">No schools selected yet</p>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>
              Click "Add School" to start comparing universities.
            </p>
            <button
              onClick={() => setShowPicker(true)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: "rgba(255,255,255,0.88)", color: "#7a5a9d" }}
            >
              <Plus className="w-4 h-4" /> Add Your First School
            </button>
          </div>
        )}

        {/* Comparison Table */}
        {selectedColleges.length >= 2 && (
          <CompareTable colleges={selectedColleges} onRemove={removeCollege} />
        )}

        {selectedColleges.length === 1 && (
          <div className="text-center py-8" style={{ color: "rgba(255,255,255,0.55)" }}>
            <p className="text-sm">Add at least one more school to start comparing.</p>
          </div>
        )}
      </div>

      {/* Picker Modal */}
      {showPicker && (
        <CollegePickerModal
          colleges={fourYear}
          selected={selectedColleges}
          onSelect={addCollege}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
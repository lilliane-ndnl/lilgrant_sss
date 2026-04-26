import React, { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp, Award } from "lucide-react";

export default function ScholarshipCard({ college }) {
  const [expanded, setExpanded] = useState(false);

  const hasScholarship = college.scholarship_name || college.scholarship_info;
  const hasAidInfo = college.avg_aid_intl || college.pct_intl_receiving_aid != null || college.meets_full_need;

  if (!hasScholarship && !hasAidInfo) return null;

  const fmt = (n) => n != null ? `$${Number(n).toLocaleString()}` : null;

  return (
    <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)" }}>
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-4 h-4" style={{ color: "rgba(251,191,36,0.9)" }} />
        <h3 className="text-sm font-semibold text-white">Financial Aid & Scholarships</h3>
      </div>

      {/* Aid overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {college.avg_aid_intl && (
          <div className="p-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Avg Aid / Year</p>
            <p className="text-xl font-bold" style={{ color: "rgba(110,231,183,1)" }}>{fmt(college.avg_aid_intl)}</p>
          </div>
        )}
        {college.pct_intl_receiving_aid != null && (
          <div className="p-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Intl Students w/ Aid</p>
            <p className="text-xl font-bold" style={{ color: "rgba(192,132,252,1)" }}>{Math.round(college.pct_intl_receiving_aid)}%</p>
          </div>
        )}
        {college.avg_annual_cost && (
          <div className="p-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Net Cost After Aid</p>
            <p className="text-xl font-bold" style={{ color: "rgba(251,191,36,1)" }}>{fmt(college.avg_annual_cost)}</p>
          </div>
        )}
      </div>

      {/* Meets full need */}
      {college.meets_full_need && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4"
          style={{ backgroundColor: "rgba(110,231,183,0.12)", border: "1px solid rgba(110,231,183,0.25)" }}>
          <span className="text-green-300 text-sm">✓</span>
          <p className="text-sm text-green-300 font-medium">This school meets 100% of demonstrated financial need for international students.</p>
        </div>
      )}

      {/* Scholarship details */}
      {hasScholarship && (
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <div>
              <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "rgba(251,191,36,0.7)" }}>Largest Merit Scholarship</p>
              <p className="text-sm font-semibold text-white">{college.scholarship_name || "Scholarship Available"}</p>
            </div>
            {college.scholarship_info && (
              expanded ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.5)" }} /> : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.5)" }} />
            )}
          </button>

          {expanded && college.scholarship_info && (
            <div className="px-4 pb-4">
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>{college.scholarship_info}</p>
              {college.scholarship_link && (
                <a
                  href={college.scholarship_link.startsWith("http") ? college.scholarship_link : `https://${college.scholarship_link}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-xs transition-opacity hover:opacity-80"
                  style={{ color: "rgba(251,191,36,0.9)" }}
                >
                  <ExternalLink className="w-3 h-3" /> View Scholarship Info
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
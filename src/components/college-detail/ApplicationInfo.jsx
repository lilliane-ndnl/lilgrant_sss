import React from "react";
import { Calendar, FileText, Clock } from "lucide-react";

function InfoRow({ label, value, highlight }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <span className="text-sm flex-shrink-0" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</span>
      <span className="text-sm font-medium text-right" style={{ color: highlight || "rgba(255,255,255,0.9)" }}>{value}</span>
    </div>
  );
}

function Badge({ label, color, bg, border }) {
  return (
    <span className="px-3 py-1.5 rounded-lg text-xs font-medium"
      style={{ backgroundColor: bg, color, border: `1px solid ${border}` }}>
      {label}
    </span>
  );
}

const TESTING_COLORS = {
  "Optional": { bg: "rgba(251,191,36,0.15)", color: "rgba(252,211,77,1)", border: "rgba(251,191,36,0.3)" },
  "Required": { bg: "rgba(239,68,68,0.15)", color: "rgba(252,165,165,1)", border: "rgba(239,68,68,0.3)" },
  "Test-Free": { bg: "rgba(110,231,183,0.15)", color: "rgba(110,231,183,1)", border: "rgba(110,231,183,0.3)" },
  "Not Required": { bg: "rgba(110,231,183,0.15)", color: "rgba(110,231,183,1)", border: "rgba(110,231,183,0.3)" },
  "Recommended": { bg: "rgba(192,132,252,0.15)", color: "rgba(192,132,252,1)", border: "rgba(192,132,252,0.3)" },
};

export default function ApplicationInfo({ college }) {
  const hasInfo = college.testing_policy || college.ed_deadline || college.ea_deadline || college.rd_deadline || college.uses_common_app;
  if (!hasInfo) return null;

  const testColor = TESTING_COLORS[college.testing_policy] || { bg: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", border: "rgba(255,255,255,0.2)" };

  return (
    <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4" style={{ color: "rgba(192,132,252,0.9)" }} />
        <h3 className="text-sm font-semibold text-white">Application Requirements</h3>
      </div>

      {/* Testing policy */}
      {college.testing_policy && (
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Testing Policy</p>
          <Badge label={`📝 ${college.testing_policy}`} {...testColor} />
        </div>
      )}

      {/* Deadlines */}
      {(college.ed_deadline || college.ea_deadline || college.rd_deadline) && (
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Application Deadlines</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {college.ed_deadline && (
              <div className="p-3 rounded-xl text-center" style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(252,165,165,0.8)" }}>Early Decision</p>
                <p className="text-sm font-semibold" style={{ color: "rgba(252,165,165,1)" }}>{college.ed_deadline}</p>
              </div>
            )}
            {college.ea_deadline && (
              <div className="p-3 rounded-xl text-center" style={{ backgroundColor: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(252,211,77,0.8)" }}>Early Action</p>
                <p className="text-sm font-semibold" style={{ color: "rgba(252,211,77,1)" }}>{college.ea_deadline}</p>
              </div>
            )}
            {college.rd_deadline && (
              <div className="p-3 rounded-xl text-center" style={{ backgroundColor: "rgba(110,231,183,0.1)", border: "1px solid rgba(110,231,183,0.2)" }}>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(110,231,183,0.8)" }}>Regular Decision</p>
                <p className="text-sm font-semibold" style={{ color: "rgba(110,231,183,1)" }}>{college.rd_deadline}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Platform */}
      {college.uses_common_app && (
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "rgba(0,107,214,0.12)", border: "1px solid rgba(0,107,214,0.25)" }}>
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#0065D3"/><path d="M8 16.5C8 12.36 11.36 9 15.5 9c2.1 0 3.99.84 5.37 2.2l-2.14 2.14A4 4 0 0 0 15.5 12 4.5 4.5 0 0 0 11 16.5a4.5 4.5 0 0 0 4.5 4.5c2.1 0 3.59-1.07 4.1-2.5H15.5v-2.5H22c.07.4.1.82.1 1.25C22.1 20.9 19.2 24 15.5 24 11.36 24 8 20.64 8 16.5Z" fill="white"/></svg>
          <div>
            <p className="text-sm font-semibold" style={{ color: "rgba(147,197,253,1)" }}>Accepts Common App</p>
            <p className="text-xs" style={{ color: "rgba(147,197,253,0.7)" }}>Apply through the Common Application platform</p>
          </div>
        </div>
      )}
    </div>
  );
}
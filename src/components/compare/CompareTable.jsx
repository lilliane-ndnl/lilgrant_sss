import React from "react";
import { Link } from "react-router-dom";
import { X, ExternalLink } from "lucide-react";

const fmt = n => n != null ? `$${Number(n).toLocaleString()}` : "—";
const pct = n => n != null ? `${Math.round(n * 100)}%` : "—";
const pct2 = n => n != null ? `${n}%` : "—";
const num = n => n != null ? Number(n).toLocaleString() : "—";
const ratio = n => n != null ? `${n}:1` : "—";

const SECTIONS = [
  {
    label: "Overview",
    rows: [
      { label: "Location", fn: c => c.city && c.state ? `${c.city}, ${c.state}` : c.state || "—" },
      { label: "Type", fn: c => c.control_type || "—" },
      { label: "Setting", fn: c => c.setting || "—" },
      { label: "Aid Policy", fn: c => c.aid_type || "—", highlight: (v) => v === "Need-Blind" ? "green" : null },
      { label: "US News Rank", fn: c => c.us_news_rank ? `#${c.us_news_rank}` : "—" },
    ],
  },
  {
    label: "Admissions",
    rows: [
      { label: "Overall Accept Rate", fn: c => pct(c.acceptance_rate), highlight: v => v !== "—" && parseFloat(v) < 20 ? "green" : null },
      { label: "Intl Accept Rate", fn: c => pct(c.intl_acceptance_rate) },
      { label: "SAT Reading (mid 50%)", fn: c => c.sat_reading_25 && c.sat_reading_75 ? `${c.sat_reading_25}–${c.sat_reading_75}` : "—" },
      { label: "SAT Math (mid 50%)", fn: c => c.sat_math_25 && c.sat_math_75 ? `${c.sat_math_25}–${c.sat_math_75}` : "—" },
      { label: "ACT (mid 50%)", fn: c => c.act_25 && c.act_75 ? `${c.act_25}–${c.act_75}` : "—" },
      { label: "Testing Policy", fn: c => c.testing_policy || "—" },
      { label: "Common App", fn: c => c.uses_common_app === true ? "Yes" : c.uses_common_app === false ? "No" : "—", highlight: v => v === "Yes" ? "green" : null },
    ],
  },
  {
    label: "Costs & Aid",
    rows: [
      { label: "Out-of-State Tuition", fn: c => fmt(c.tuition_out_of_state) },
      { label: "Est. Cost (after aid if avail.)", fn: c => fmt(c.avg_coa_after_aid ?? c.avg_annual_cost ?? c.tuition_out_of_state), highlight: (_, c) => (c.avg_coa_after_aid ?? c.avg_annual_cost) < 25000 ? "green" : null },
      { label: "Avg Intl Aid / Year", fn: c => fmt(c.avg_aid_intl), highlight: (v, c) => c.avg_aid_intl >= 50000 ? "green" : null },
      { label: "Intl Students Receiving Aid", fn: c => pct2(c.pct_intl_receiving_aid) },
      { label: "Meets Full Need", fn: c => c.meets_full_need === true ? "Yes" : c.meets_full_need === false ? "No" : "—", highlight: v => v === "Yes" ? "green" : null },
      { label: "Median Debt at Graduation", fn: c => fmt(c.median_debt_graduation) },
      { label: "Pell Grant Recipients", fn: c => pct2(c.pct_receiving_pell) },
    ],
  },
  {
    label: "Outcomes",
    rows: [
      { label: "Graduation Rate (6yr)", fn: c => pct(c.graduation_rate), highlight: (v, c) => c.graduation_rate >= 0.85 ? "green" : null },
      { label: "Retention Rate (1yr)", fn: c => pct(c.retention_rate) },
      { label: "Median Earnings (10yr)", fn: c => fmt(c.median_earnings_10yr) },
      { label: "Loan Repayment Rate", fn: c => pct(c.loan_repayment_rate) },
    ],
  },
  {
    label: "Campus",
    rows: [
      { label: "Total Enrollment", fn: c => num(c.total_enrollment) },
      { label: "Undergrad Enrollment", fn: c => num(c.undergrad_enrollment) },
      { label: "Student:Faculty Ratio", fn: c => ratio(c.student_faculty_ratio) },
      { label: "Campus Housing", fn: c => c.campus_housing === true ? "Yes" : c.campus_housing === false ? "No" : "—" },
      { label: "Varsity Sports", fn: c => c.varsity_sports === true ? "Yes" : c.varsity_sports === false ? "No" : "—" },
      { label: "Intl Students", fn: c => pct2(c.pct_intl_students) },
      { label: "Women Enrolled", fn: c => pct2(c.pct_women) },
    ],
  },
];

function Cell({ value, highlight }) {
  const color = highlight === "green"
    ? { color: "rgba(110,231,183,1)", fontWeight: 600 }
    : { color: "rgba(255,255,255,0.88)" };
  return (
    <td className="px-4 py-3 text-sm text-center" style={color}>
      {value}
    </td>
  );
}

export default function CompareTable({ colleges, onRemove }) {
  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
      <table className="w-full border-collapse min-w-[600px]">
        <thead>
          <tr style={{ backgroundColor: "rgba(255,255,255,0.1)", borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
            <th className="px-4 py-4 text-left text-xs font-semibold w-44" style={{ color: "rgba(255,255,255,0.5)" }}>
              Metric
            </th>
            {colleges.map(college => (
              <th key={college.id} className="px-4 py-4 text-center" style={{ minWidth: 160 }}>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/universities/${college.id}`}
                      className="text-sm font-semibold text-white hover:underline leading-tight text-center"
                    >
                      {college.name}
                    </Link>
                    <button onClick={() => onRemove(college.id)} className="hover:opacity-60 transition-opacity flex-shrink-0">
                      <X className="w-3.5 h-3.5 text-white/50" />
                    </button>
                  </div>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {college.city && `${college.city}, `}{college.state}
                  </span>
                  {college.website_url && (
                    <a
                      href={college.website_url.startsWith("http") ? college.website_url : `https://${college.website_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-xs hover:opacity-70 transition-opacity"
                      style={{ color: "rgba(192,132,252,0.85)" }}
                    >
                      <ExternalLink className="w-3 h-3" /> Site
                    </a>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SECTIONS.map(section => (
            <React.Fragment key={section.label}>
              <tr style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                <td
                  colSpan={colleges.length + 1}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider"
                  style={{ color: "rgba(192,132,252,0.9)" }}
                >
                  {section.label}
                </td>
              </tr>
              {section.rows.map(row => (
                <tr
                  key={row.label}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <td className="px-4 py-3 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {row.label}
                  </td>
                  {colleges.map(college => {
                    const value = row.fn(college);
                    const highlight = row.highlight ? row.highlight(value, college) : null;
                    return <Cell key={college.id} value={value} highlight={highlight} />;
                  })}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
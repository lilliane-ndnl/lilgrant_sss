import React from "react";

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div
      className="p-4 rounded-2xl flex flex-col gap-1 relative overflow-hidden"
      style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}
    >
      {icon && <div className="text-2xl mb-1">{icon}</div>}
      <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "rgba(255,255,255,0.48)" }}>{label}</p>
      <p className="text-2xl font-bold leading-tight" style={{ color: color || "white" }}>{value}</p>
      {sub && <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>{sub}</p>}
    </div>
  );
}

export default function QuickStats({ college }) {
  const fmt = (n) => n != null ? `$${Number(n).toLocaleString()}` : "N/A";
  const pct = (n) => n != null ? `${Math.round(n * 100)}%` : "N/A";
  const pct2 = (n) => n != null ? `${Math.round(n)}%` : "N/A";

  const stats = [
    {
      icon: "🎯",
      label: "Acceptance Rate",
      value: college.acceptance_rate != null ? `${Math.round(college.acceptance_rate * 100)}%` : "N/A",
      sub: "Overall selectivity",
      color: college.acceptance_rate < 0.1 ? "rgba(248,113,113,1)" : college.acceptance_rate < 0.3 ? "rgba(251,191,36,1)" : "rgba(110,231,183,1)",
    },
    {
      icon: "🌍",
      label: "Intl Acceptance Rate",
      value: college.intl_acceptance_rate != null ? `${Math.round(college.intl_acceptance_rate * 100)}%` : "N/A",
      sub: "For international applicants",
      color: "rgba(96,165,250,1)",
    },
    {
      icon: "💰",
      label: "Avg Intl Aid / Year",
      value: college.avg_aid_intl ? fmt(college.avg_aid_intl) : "N/A",
      sub: college.pct_intl_receiving_aid != null ? `${Math.round(college.pct_intl_receiving_aid)}% of intl students` : "Grant-based",
      color: "rgba(110,231,183,1)",
    },
    {
      icon: "🧾",
      label: "Net Cost After Aid",
      value: college.avg_annual_cost ? fmt(college.avg_annual_cost) : "N/A",
      sub: "Average annual net cost",
      color: "rgba(251,191,36,1)",
    },
    {
      icon: "🎓",
      label: "Graduation Rate",
      value: pct(college.graduation_rate),
      sub: "Within 6 years",
      color: "rgba(192,132,252,1)",
    },
    {
      icon: "📈",
      label: "Median Earnings",
      value: college.median_earnings_10yr ? fmt(college.median_earnings_10yr) : "N/A",
      sub: "10 years after entry",
      color: "rgba(251,191,36,0.95)",
    },
    {
      icon: "👥",
      label: "Total Enrollment",
      value: college.total_enrollment != null ? Number(college.total_enrollment).toLocaleString() : "N/A",
      sub: "Students",
      color: "white",
    },
    {
      icon: "📚",
      label: "Student:Faculty",
      value: college.student_faculty_ratio ? `${college.student_faculty_ratio}:1` : "N/A",
      sub: "Ratio",
      color: "white",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
    </div>
  );
}
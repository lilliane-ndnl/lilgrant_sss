import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

function MiniDonut({ value, label, color, size = 100 }) {
  const data = [
    { value: Math.round(value), name: label },
    { value: Math.round(100 - value), name: "Other" },
  ];
  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ width: size, height: size, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius="60%" outerRadius="85%" startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
              <Cell fill={color} />
              <Cell fill="rgba(255,255,255,0.08)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white">{Math.round(value)}%</span>
        </div>
      </div>
      <p className="text-[11px] text-center leading-tight" style={{ color: "rgba(255,255,255,0.65)", maxWidth: size }}>{label}</p>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: "rgba(60,30,90,0.95)", border: "1px solid rgba(255,255,255,0.2)", color: "white" }}>
        <p className="font-semibold">{payload[0].name}</p>
        <p>{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export default function AcceptanceChart({ college }) {
  const overallRate = college.acceptance_rate != null ? Math.round(college.acceptance_rate * 100) : null;
  const intlRate = college.intl_acceptance_rate != null ? Math.round(college.intl_acceptance_rate * 100) : null;
  const intlYield = college.intl_yield != null ? Math.round(college.intl_yield * 100) : null;
  const gradRate = college.graduation_rate != null ? Math.round(college.graduation_rate * 100) : null;
  const retentionRate = college.retention_rate != null ? Math.round(college.retention_rate * 100) : null;

  // Funnel data for bar chart
  const funnelData = [];
  if (college.intl_applicants) funnelData.push({ stage: "Applied", count: college.intl_applicants });
  if (college.intl_admitted) funnelData.push({ stage: "Admitted", count: college.intl_admitted });
  if (college.intl_enrolled) funnelData.push({ stage: "Enrolled", count: college.intl_enrolled });

  const hasDonut = overallRate != null || intlRate != null || gradRate != null || retentionRate != null;

  if (!hasDonut && funnelData.length === 0) return null;

  return (
    <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
      <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
        <span>🎯</span> Admissions at a Glance
      </h3>

      {hasDonut && (
        <div className="flex flex-wrap gap-6 justify-center mb-6">
          {overallRate != null && (
            <MiniDonut value={overallRate} label="Overall Accept Rate" color="rgba(96,165,250,0.9)" size={90} />
          )}
          {intlRate != null && (
            <MiniDonut value={intlRate} label="Intl Accept Rate" color="rgba(192,132,252,0.9)" size={90} />
          )}
          {intlYield != null && (
            <MiniDonut value={intlYield} label="Intl Yield Rate" color="rgba(251,191,36,0.9)" size={90} />
          )}
          {gradRate != null && (
            <MiniDonut value={gradRate} label="Graduation Rate" color="rgba(110,231,183,0.9)" size={90} />
          )}
          {retentionRate != null && (
            <MiniDonut value={retentionRate} label="Retention Rate (Yr 1)" color="rgba(248,113,113,0.9)" size={90} />
          )}
        </div>
      )}

      {/* Intl Admission Funnel */}
      {funnelData.length >= 2 && (
        <>
          <p className="text-[11px] uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>International Applicant Funnel</p>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="stage" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {funnelData.map((_, i) => (
                    <Cell key={i} fill={["rgba(96,165,250,0.8)", "rgba(192,132,252,0.8)", "rgba(110,231,183,0.8)"][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Intl yield context */}
      {intlRate != null && overallRate != null && (
        <div className="mt-4 p-3 rounded-xl text-xs" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)" }}>
          {intlRate < overallRate
            ? `⚠️ International applicants face a ${overallRate - intlRate}pp lower acceptance rate than the overall rate — this school is more selective for international students.`
            : intlRate > overallRate
            ? `✅ International applicants have a ${intlRate - overallRate}pp higher acceptance rate than the overall rate.`
            : `ℹ️ Acceptance rate is equal for domestic and international applicants.`}
        </div>
      )}
    </div>
  );
}
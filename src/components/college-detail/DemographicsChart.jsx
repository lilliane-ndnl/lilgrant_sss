import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const RACE_COLORS = {
  White: "rgba(148,163,184,0.85)",
  Asian: "rgba(192,132,252,0.85)",
  Hispanic: "rgba(251,191,36,0.85)",
  Black: "rgba(110,231,183,0.85)",
  International: "rgba(96,165,250,0.85)",
  Other: "rgba(251,113,133,0.75)",
};

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

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function DemographicsChart({ college }) {
  const races = [
    { name: "White", value: college.pct_white, color: RACE_COLORS.White },
    { name: "Asian", value: college.pct_asian, color: RACE_COLORS.Asian },
    { name: "Hispanic", value: college.pct_hispanic, color: RACE_COLORS.Hispanic },
    { name: "Black", value: college.pct_black, color: RACE_COLORS.Black },
    { name: "International", value: college.pct_intl_students, color: RACE_COLORS.International },
  ].filter(d => d.value != null && d.value > 0);

  const total = races.reduce((s, d) => s + d.value, 0);
  const remaining = Math.max(0, 100 - total);
  const pieData = remaining > 1 ? [...races, { name: "Other / Unknown", value: Math.round(remaining), color: RACE_COLORS.Other }] : races;

  if (races.length === 0) return null;

  // Gender split
  const womenPct = college.pct_women;
  const menPct = womenPct != null ? Math.round(100 - womenPct) : null;

  return (
    <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
      <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
        <span>🌐</span> Student Body Demographics
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
        {/* Pie Chart */}
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius="80%"
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
                strokeWidth={1}
                stroke="rgba(255,255,255,0.1)"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend + bars */}
        <div className="space-y-2.5">
          {pieData.map(d => (
            <div key={d.name}>
              <div className="flex justify-between text-xs mb-1" style={{ color: "rgba(255,255,255,0.8)" }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 inline-block" style={{ backgroundColor: d.color }} />
                  {d.name}
                </span>
                <span className="font-semibold">{d.value}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                <div className="h-full rounded-full" style={{ width: `${Math.min(d.value, 100)}%`, backgroundColor: d.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gender split */}
      {womenPct != null && (
        <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <p className="text-[11px] uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>Gender Split</p>
          <div className="flex items-center gap-3">
            <span className="text-xs w-10 text-right" style={{ color: "rgba(192,132,252,0.9)" }}>{Math.round(womenPct)}%</span>
            <div className="flex-1 h-4 rounded-full overflow-hidden flex" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
              <div className="h-full" style={{ width: `${womenPct}%`, backgroundColor: "rgba(192,132,252,0.8)" }} />
              <div className="h-full flex-1" style={{ backgroundColor: "rgba(96,165,250,0.6)" }} />
            </div>
            <span className="text-xs w-10" style={{ color: "rgba(96,165,250,0.9)" }}>{menPct}%</span>
          </div>
          <div className="flex justify-between mt-1 text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            <span>♀ Women</span>
            <span>Men ♂</span>
          </div>
        </div>
      )}
    </div>
  );
}
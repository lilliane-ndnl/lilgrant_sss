import React from "react";

function ScoreBar({ label, low, high, min, max, color }) {
  if (!low && !high) return null;
  const range = max - min;
  const leftPct = ((low - min) / range) * 100;
  const widthPct = ((high - low) / range) * 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.75)" }}>
        <span>{label}</span>
        <span className="font-semibold" style={{ color }}>{low}–{high}</span>
      </div>
      <div className="relative h-3 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
        {/* min label */}
        <div className="absolute h-full rounded-full" style={{ left: `${leftPct}%`, width: `${widthPct}%`, backgroundColor: color }} />
      </div>
      <div className="flex justify-between text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
        <span>{min}</span>
        <span>Middle 50%</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export default function TestScoreChart({ college }) {
  const hasSAT = college.sat_reading_25 || college.sat_math_25;
  const hasACT = college.act_25 || college.act_75;

  if (!hasSAT && !hasACT) return null;

  const satTotal25 = (college.sat_reading_25 || 0) + (college.sat_math_25 || 0);
  const satTotal75 = (college.sat_reading_75 || 0) + (college.sat_math_75 || 0);

  return (
    <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <span>📊</span> Test Score Ranges (Middle 50%)
      </h3>

      {hasSAT && (
        <div className="mb-5">
          <p className="text-[11px] uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>SAT</p>
          {satTotal25 > 0 && satTotal75 > 0 && (
            <ScoreBar label="SAT Total" low={satTotal25} high={satTotal75} min={800} max={1600} color="rgba(192,132,252,0.85)" />
          )}
          <ScoreBar label="Evidence-Based Reading" low={college.sat_reading_25} high={college.sat_reading_75} min={200} max={800} color="rgba(96,165,250,0.8)" />
          <ScoreBar label="Math" low={college.sat_math_25} high={college.sat_math_75} min={200} max={800} color="rgba(110,231,183,0.8)" />
        </div>
      )}

      {hasACT && (
        <div>
          <p className="text-[11px] uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>ACT</p>
          <ScoreBar label="ACT Composite" low={college.act_25} high={college.act_75} min={1} max={36} color="rgba(251,191,36,0.85)" />
        </div>
      )}
    </div>
  );
}
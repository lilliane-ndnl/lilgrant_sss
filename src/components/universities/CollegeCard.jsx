import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Heart, ExternalLink } from "lucide-react";
import nuRankingRaw  from '@/data/US-News-National-University-Rankings-Top-150-Through-2026.csv?raw';
import lacRankingRaw from '@/data/US-News-Rankings-Liberal-Arts-Colleges-Through-2026.csv?raw';

// Parse a ranking CSV and return a Set of IPEDS id strings (column index 2)
function parseIpedsSet(raw) {
  const lines = raw.trim().split('\n').slice(1); // skip header
  const set = new Set();
  for (const line of lines) {
    const cols = line.split(',');
    const ipeds = cols[2]?.trim();
    if (ipeds) set.add(ipeds);
  }
  return set;
}

const nuIpedsSet  = parseIpedsSet(nuRankingRaw);
const lacIpedsSet = parseIpedsSet(lacRankingRaw);

function fmtK(val) {
  if (val == null) return "—";
  return `$${Math.round(val / 1000)}k`;
}

function acceptColor(rate) {
  if (rate == null) return "rgba(255,255,255,0.55)";
  if (rate > 0.5)  return "rgba(52,211,153,1)";
  if (rate >= 0.2) return "rgba(251,191,36,1)";
  return "rgba(248,113,113,1)";
}

// Consistent cost fallback used everywhere
function estCost(college) {
  return college.avg_coa_after_aid ?? college.avg_annual_cost ?? college.tuition_out_of_state ?? null;
}

export default function CollegeCard({ college, isFavorited, onToggleFavorite }) {
  const ar      = college.acceptance_rate;
  const netCost = estCost(college);

  const ipeds = String(college.scorecard_id ?? "");
  const rank  = college.us_news_rank;
  let rankLabel = null;
  if (rank && rank < 2000) {
    if (nuIpedsSet.has(ipeds))       rankLabel = `#${rank} NU`;
    else if (lacIpedsSet.has(ipeds)) rankLabel = `#${rank} LAC`;
    else                             rankLabel = `#${rank}`;
  }

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300"
      style={{
        backgroundColor: "rgba(255,255,255,0.10)",
        border: "1px solid rgba(255,255,255,0.22)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.15)",
      }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.17)"; e.currentTarget.style.border = "1px solid rgba(255,255,255,0.35)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)"; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.10)"; e.currentTarget.style.border = "1px solid rgba(255,255,255,0.22)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.15)"; }}
    >
      {/* ── 1. Top tags row ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {rankLabel && (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold"
            style={{ backgroundColor: "rgba(251,191,36,0.18)", color: "rgba(252,211,77,1)", border: "1px solid rgba(251,191,36,0.35)" }}>
            {rankLabel}
          </span>
        )}
        {college.need_blind_intl && (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
            style={{ backgroundColor: "rgba(52,211,153,0.18)", color: "rgba(110,231,183,1)", border: "1px solid rgba(52,211,153,0.35)" }}>
            Need-Blind 🌍
          </span>
        )}
        {college.uses_common_app && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
            style={{ backgroundColor: "rgba(59,130,246,0.18)", color: "rgba(147,197,253,1)", border: "1px solid rgba(59,130,246,0.3)" }}>
            Common App
          </span>
        )}
        {college.control_type && (
          <span className="px-2 py-0.5 rounded-full text-[11px]"
            style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.18)" }}>
            {college.control_type}
          </span>
        )}
      </div>

      {/* ── 2. Name + Location ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-base font-semibold text-white leading-tight">{college.name}</h3>
          <div className="flex items-center gap-1 mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="text-xs">{college.city && `${college.city}, `}{college.state}</span>
          </div>
        </div>
        <button
          onClick={e => { e.preventDefault(); onToggleFavorite(college); }}
          className="p-1.5 rounded-lg flex-shrink-0 transition-opacity hover:opacity-80"
        >
          <Heart
            className="w-4 h-4"
            style={isFavorited ? { fill: "#f472b6", color: "#f472b6" } : { color: "rgba(255,255,255,0.4)" }}
          />
        </button>
      </div>

      {/* ── 3. Stats 2×2 grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Acceptance Rate */}
        <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Admit Rate</p>
          <p className="text-base font-bold" style={{ color: acceptColor(ar) }}>
            {ar != null ? `${Math.round(ar * 100)}%` : "—"}
          </p>
        </div>
        {/* Tuition */}
        <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Tuition</p>
          <p className="text-base font-bold text-white">{fmtK(college.tuition_out_of_state)}</p>
        </div>
        {/* Avg Intl Aid */}
        <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Avg Intl Aid</p>
          {college.avg_aid_intl ? (
            <p className="text-base font-bold" style={{ color: "rgba(52,211,153,1)" }}>
              {fmtK(college.avg_aid_intl)}
            </p>
          ) : college.website_url ? (
            <a
              href={college.website_url.startsWith("http") ? college.website_url : `https://${college.website_url}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-[11px] font-medium leading-tight hover:opacity-80 transition-opacity"
              style={{ color: "rgba(147,197,253,1)" }}
              onClick={e => e.stopPropagation()}
            >
              🔗 Check Website
            </a>
          ) : (
            <p className="text-base font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>—</p>
          )}
        </div>
        {/* Est. Cost */}
        <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
          <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>Est. Cost</p>
          <p className="text-[9px] mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>after aid if avail.</p>
          <p className="text-base font-bold text-white">{fmtK(netCost)}</p>
        </div>
      </div>

      {/* ── 4. Bottom row: grad rate + earnings ─────────────────────────── */}
      <div className="flex justify-between text-xs mb-4 px-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
        <span>
          {college.graduation_rate != null
            ? `Grad: ${Math.round(college.graduation_rate * 100)}%`
            : ""}
        </span>
        <span>
          {college.median_earnings_10yr != null
            ? `Earns: $${Math.round(college.median_earnings_10yr / 1000)}k/yr`
            : ""}
        </span>
      </div>

      {/* ── 5. Actions ──────────────────────────────────────────────────── */}
      <div className="flex gap-2">
        <Link
          to={`/universities/${college.id}`}
          className="flex-1 text-center py-2 rounded-xl text-xs font-medium transition-colors"
          style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.22)"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)"}
        >
          View Details
        </Link>
        {college.website_url && (
          <a
            href={college.website_url.startsWith("http") ? college.website_url : `https://${college.website_url}`}
            target="_blank" rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl flex items-center transition-colors"
            style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
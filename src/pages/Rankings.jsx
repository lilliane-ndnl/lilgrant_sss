import { db } from '@/api/base44Client';
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Loader2, Trophy } from "lucide-react";

import nuCsvRaw      from '@/data/US-News-National-University-Rankings-Top-150-Through-2026.csv?raw';
import lacCsvRaw     from '@/data/US-News-Rankings-Liberal-Arts-Colleges-Through-2026.csv?raw';
import matchingIdRaw from '@/data/Matching_ID_-_NU_and_LAC.csv?raw';

const TABS = [
  { key: "national", label: "🏛️ National Universities" },
  { key: "lac",      label: "📚 Liberal Arts Colleges" },
];

// ─── CSV helpers ────────────────────────────────────────────────────────────

function parseRank(val) {
  if (!val || !val.trim()) return null;
  const n = parseInt(val.trim(), 10);
  if (!isNaN(n)) return n;
  // Range value like "T2 (183-201)" — use lower bound
  const m = val.match(/\((\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

function parseCsv(raw) {
  return raw
    .trim()
    .split('\n')
    .slice(1)               // skip header row
    .map(line => {
      const cols = [];
      let cur = '', inQ = false;
      for (const ch of line) {
        if (ch === '"') { inQ = !inQ; continue; }
        if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; }
        cur += ch;
      }
      cols.push(cur.trim());
      return { name: cols[0]?.trim() || '', ipeds: cols[2]?.trim() || '', rank2026: parseRank(cols[3]) };
    })
    .filter(r => r.name && r.rank2026 !== null);
}

// Parse once at module level — these are static assets
const nuCsvData  = parseCsv(nuCsvRaw);
const lacCsvData = parseCsv(lacCsvRaw);

// IPEDS override map: ipeds string → correct name (from the matching CSV)
// Used as a fallback when name-based matching fails
const ipedsOverrides = {};
matchingIdRaw.trim().split('\n').slice(1).forEach(line => {
  const [, name, ipeds] = line.split(',');
  if (ipeds?.trim()) ipedsOverrides[ipeds.trim()] = name?.trim();
});

// ─── Name normalisation ──────────────────────────────────────────────────────

function norm(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[–—]/g, '-')   // em/en dash → hyphen
    .replace(/\./g, '')       // remove periods  (St. → St)
    .replace(/,.*$/, '')      // strip trailing ", Subtitle" (quoted CSV names)
    .replace(/\s+/g, ' ')
    .trim();
}

function variants(s) {
  const b = norm(s);
  const noThe = b.startsWith('the ') ? b.slice(4) : b;
  return new Set([
    b,
    noThe,
    b.replace(/-/g, ' '),
    noThe.replace(/-/g, ' '),
    b.replace(/&/g, 'and'),
    noThe.replace(/&/g, 'and'),
    b.replace(/\band\b/g, '&'),
    noThe.replace(/\band\b/g, '&'),
    b.replace(/ at /g, ' '),
    noThe.replace(/ at /g, ' '),
    b.replace(/\bsaint\b/g, 'st'),
    b.replace(/\bst\b/g, 'saint'),
    // "Oberlin College and Conservatory" → "Oberlin College"
    b.replace(/ and conservatory$/, ''),
    // Strip " at Notre Dame, Indiana" type suffixes (already handled by comma strip above)
    b.replace(/ at \w[\w ]*$/, ''),
  ]);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function RankBadge({ rank }) {
  const gold   = rank <= 3;
  const silver = rank <= 10;
  return (
    <span
      className="text-xl font-black w-10 text-center flex-shrink-0"
      style={{ color: gold ? "rgba(252,211,77,1)" : silver ? "rgba(203,213,225,1)" : "rgba(255,255,255,0.55)" }}
    >
      #{rank}
    </span>
  );
}

function CollegeRow({ college, csvEntry }) {
  const rank      = csvEntry.rank2026;
  const isMatched = !!college;

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all"
      style={{
        backgroundColor: rank <= 3 ? "rgba(251,191,36,0.08)" : "rgba(255,255,255,0.06)",
        border:          rank <= 3 ? "1px solid rgba(251,191,36,0.2)" : "1px solid rgba(255,255,255,0.1)",
        opacity: isMatched ? 1 : 0.55,
      }}
    >
      <RankBadge rank={rank} />

      <div className="flex-1 min-w-0">
        {isMatched ? (
          <Link
            to={`/universities/${college.id}`}
            className="font-semibold text-sm text-white hover:underline leading-tight block truncate"
          >
            {college.name}
          </Link>
        ) : (
          <span className="font-semibold text-sm leading-tight block truncate" style={{ color: "rgba(255,255,255,0.55)" }}>
            {csvEntry.name}
          </span>
        )}
        <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.45)" }}>
          {isMatched
            ? [college.city, college.state].filter(Boolean).join(", ") +
              (college.control_type ? ` · ${college.control_type}` : "")
            : "Not yet in database"}
        </p>
      </div>

      <div className="hidden sm:flex gap-4 text-xs text-right flex-shrink-0">
        <div>
          <p style={{ color: "rgba(255,255,255,0.4)" }}>Accept</p>
          <p className="font-medium text-white">
            {college?.acceptance_rate != null ? `${Math.round(college.acceptance_rate * 100)}%` : "—"}
          </p>
        </div>
        <div>
          <p style={{ color: "rgba(255,255,255,0.4)" }}>Tuition</p>
          <p className="font-medium text-white">
            {college?.tuition_out_of_state ? `$${(college.tuition_out_of_state / 1000).toFixed(0)}k` : "—"}
          </p>
        </div>
        <div>
          <p style={{ color: "rgba(255,255,255,0.4)" }}>Avg Aid</p>
          <p className="font-medium" style={{ color: "rgba(110,231,183,1)" }}>
            {college?.avg_aid_intl ? `$${(college.avg_aid_intl / 1000).toFixed(0)}k` : "—"}
          </p>
        </div>
      </div>

      {isMatched && (
        <Link
          to={`/universities/${college.id}`}
          className="px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0"
          style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}
        >
          View →
        </Link>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Rankings() {
  const [activeTab, setActiveTab] = useState("national");

  const { data: colleges = [], isLoading } = useQuery({
    queryKey: ["colleges"],
    queryFn: () => db.entities.College.list(),
  });

  const { nuRows, lacRows } = useMemo(() => {
    // Build lookup maps from JSON data
    const byNorm = new Map();
    const byIpeds = new Map();
    for (const c of colleges) {
      for (const v of variants(c.name)) {
        if (!byNorm.has(v)) byNorm.set(v, c);
      }
      if (c.scorecard_id) byIpeds.set(String(c.scorecard_id), c);
    }

    function resolve(csvData) {
      const unmatched = [];
      const rows = csvData.map(entry => {
        let college = null;

        // 1st attempt: name-based fuzzy match
        for (const v of variants(entry.name)) {
          if (byNorm.has(v)) { college = byNorm.get(v); break; }
        }

        // 2nd attempt: IPEDS/scorecard_id match using the override CSV
        if (!college && entry.ipeds) {
          college = byIpeds.get(entry.ipeds) || null;
        }

        if (!college) unmatched.push(entry);
        return { csvEntry: entry, college };
      });
      return { rows, unmatched };
    }

    const { rows: nuRows,  unmatched: unmatchedNU  } = resolve(nuCsvData);
    const { rows: lacRows, unmatched: unmatchedLAC } = resolve(lacCsvData);

    // ── Console report ──
    console.group('📊 US News Rankings — Matching Report');
    if (unmatchedNU.length) {
      console.log('=== UNMATCHED NU SCHOOLS ===');
      unmatchedNU.forEach(e => console.log(`  - "${e.name}" (rank #${e.rank2026})`));
    } else {
      console.log('✅ All NU schools matched');
    }
    if (unmatchedLAC.length) {
      console.log('=== UNMATCHED LAC SCHOOLS ===');
      unmatchedLAC.forEach(e => console.log(`  - "${e.name}" (rank #${e.rank2026})`));
    } else {
      console.log('✅ All LAC schools matched');
    }
    console.log(
      `NU matched: ${nuRows.length - unmatchedNU.length}/${nuRows.length} | NU unmatched: ${unmatchedNU.length}`
    );
    console.log(
      `LAC matched: ${lacRows.length - unmatchedLAC.length}/${lacRows.length} | LAC unmatched: ${unmatchedLAC.length}`
    );
    console.groupEnd();

    return { nuRows, lacRows };
  }, [colleges]);

  const activeRows = (activeTab === "national" ? nuRows : lacRows)
    .slice()
    .sort((a, b) => (a.csvEntry?.rank2026 ?? Infinity) - (b.csvEntry?.rank2026 ?? Infinity));

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <div className="text-center px-4 pt-12 pb-8">
        <div className="text-5xl mb-4">🏆</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">US News Rankings 2026</h1>
        <p className="text-sm sm:text-base max-w-xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
          Official US News &amp; World Report rankings for National Universities and Liberal Arts Colleges.
          Click any school to see detailed admissions, financial aid, and outcomes data.
        </p>
      </div>

      {/* Tabs */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-6">
        <div className="flex gap-2 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-5 py-2 rounded-xl text-sm font-medium transition-all"
              style={activeTab === tab.key
                ? { backgroundColor: "rgba(255,255,255,0.88)", color: "#7a5a9d" }
                : { backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.18)" }
              }
            >
              {tab.label}{" "}
              <span style={{ opacity: 0.7 }}>
                ({tab.key === "national" ? nuRows.length : lacRows.length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-white/60" />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>
              Showing {activeRows.length} schools · Source: US News &amp; World Report 2026
            </p>
            {activeRows.map(({ csvEntry, college }) => (
              <CollegeRow key={csvEntry.name} college={college} csvEntry={csvEntry} />
            ))}
          </div>
        )}
      </div>

      <div className="text-center mt-10 px-4">
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
          Rankings sourced from US News &amp; World Report 2026. Presented for informational purposes only.
        </p>
      </div>
    </div>
  );
}

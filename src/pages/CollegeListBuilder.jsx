import { db } from '@/api/base44Client';
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as XLSX from 'xlsx';
import {
  Loader2, Download, RotateCcw, ChevronRight, ChevronLeft,
  X, Search, Check, GraduationCap,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const MAJORS = [
  "Business & Management", "Mathematics & Statistics", "Computer Science & IT",
  "Engineering", "Biology & Life Sciences", "Social Sciences", "Economics",
  "Pre-Med / Health Sciences", "Political Science & Law", "Psychology",
  "Arts & Design", "Education", "Communication & Media", "Environmental Science",
  "Physics & Astronomy", "Chemistry", "Philosophy", "Nursing",
];

const SIZES = [
  { key: "small",      label: "Small",      sub: "Under 5,000 students" },
  { key: "medium",     label: "Medium",     sub: "5,000–15,000 students" },
  { key: "large",      label: "Large",      sub: "15,000–30,000 students" },
  { key: "very_large", label: "Very Large", sub: "30,000+ students" },
];

const SETTINGS = [
  { key: "City",   label: "🏙️ City" },
  { key: "Suburb", label: "🏘️ Suburb" },
  { key: "Town",   label: "🏡 Town" },
  { key: "Rural",  label: "🌲 Rural" },
];

const REGIONS = [
  { key: "Northeast", label: "🗽 Northeast", states: ["ME","NH","VT","MA","RI","CT","NY","NJ","PA","MD","DE","DC"] },
  { key: "Southeast", label: "🌴 Southeast", states: ["VA","WV","KY","TN","NC","SC","GA","FL","AL","MS","AR","LA"] },
  { key: "Midwest",   label: "🌾 Midwest",   states: ["OH","MI","IN","IL","WI","MN","IA","MO","ND","SD","NE","KS"] },
  { key: "Southwest", label: "🌵 Southwest", states: ["TX","OK","NM","AZ"] },
  { key: "West",      label: "🏔️ West",      states: ["CO","WY","MT","ID","WA","OR","CA","NV","UT","AK","HI"] },
];

const GRADES = ["9th Grade","10th Grade","11th Grade","12th Grade","Gap Year"];

const STORAGE_KEY = 'lilgrant_quiz_prefs';

const DEFAULT_PREFS = {
  name: "", grade: "", isInternational: null,
  maxBudget: 55000, gpa: "", testType: "SAT", sat: "", act: "",
  homeCountry: "", regions: [],
  sizes: [], settings: [], majors: [],
  controlType: "any", genderSetting: "any",
  strategy: "balanced",
  dreamSchools: [],
};

const STEP_TITLES = [
  "Welcome","Citizenship","Budget","Academic Profile","Location",
  "School Size","Campus Setting","Fields of Study","School Type",
  "Strategy","Dream Schools",
];
const TOTAL_STEPS = STEP_TITLES.length;

const STRATEGY_DIST = {
  ambitious: { reach: 4, match: 5, safety: 3 },
  balanced:  { reach: 3, match: 7, safety: 4 },
  safe:      { reach: 2, match: 6, safety: 5 },
};

// ─── UI Components ────────────────────────────────────────────────────────────

function StepIndicator({ step, total }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mb-8 flex-wrap">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: i === step ? 28 : 10,
            backgroundColor: i <= step ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)",
          }}
        />
      ))}
    </div>
  );
}

function ToggleChip({ label, selected, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1.5 rounded-full text-sm transition-all"
      style={selected
        ? { backgroundColor: "rgba(255,255,255,0.9)", color: "#7a5a9d", fontWeight: 600 }
        : { backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.2)", opacity: disabled ? 0.4 : 1 }
      }
    >
      {label}
    </button>
  );
}

function BigCard({ emoji, title, sub, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl p-5 text-left transition-all"
      style={{
        backgroundColor: selected ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)",
        border: selected ? "2px solid rgba(255,255,255,0.7)" : "2px solid rgba(255,255,255,0.15)",
      }}
    >
      <div className="text-3xl mb-2">{emoji}</div>
      <p className="font-bold text-white text-base">{title}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>{sub}</p>}
      {selected && <Check className="w-4 h-4 text-white mt-2" />}
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider mb-3"
       style={{ color: "rgba(255,255,255,0.5)" }}>
      {children}
    </p>
  );
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

function getRegionForState(state) {
  return REGIONS.find(r => r.states.includes(state))?.key || null;
}

function getSizeKey(enrollment) {
  if (!enrollment) return null;
  if (enrollment < 5000)  return "small";
  if (enrollment < 15000) return "medium";
  if (enrollment < 30000) return "large";
  return "very_large";
}

function scoreCollege(college, prefs) {
  let score = 0;
  let academicFit = "MATCH";

  // ── 1. Budget (40 pts) ───────────────────────────────────────────────────
  const cost = college.avg_coa_after_aid ?? college.avg_annual_cost ?? college.tuition_out_of_state ?? null;

  if (prefs.maxBudget === null) {
    score += 40;
  } else if (cost) {
    if (cost <= prefs.maxBudget)           score += 40;
    else if (cost <= prefs.maxBudget * 1.1) score += 20;
    else if (cost > prefs.maxBudget * 1.2)  return null; // hard exclude
    else                                    score += 10;
  } else {
    score += 20; // no cost data, neutral
  }

  // ── 2. Academic fit (30 pts) ──────────────────────────────────────────────
  const studentSAT = prefs.testType === "SAT" ? Number(prefs.sat) || 0 : 0;
  const studentACT = prefs.testType === "ACT" ? Number(prefs.act) || 0 : 0;
  const sat25 = (college.sat_math_25 || 0) + (college.sat_reading_25 || 0);
  const sat75 = (college.sat_math_75 || 0) + (college.sat_reading_75 || 0);
  const ar    = college.acceptance_rate || 0.5;

  if (prefs.testType === "Test-Optional" || (!studentSAT && !studentACT)) {
    if (ar > 0.5)       { academicFit = "SAFETY"; score += 30; }
    else if (ar >= 0.2) { academicFit = "MATCH";  score += 20; }
    else                { academicFit = "REACH";  score += 10; }
  } else if (studentSAT) {
    if (sat25 && sat75) {
      if (studentSAT > sat75)      { academicFit = "SAFETY"; score += 30; }
      else if (studentSAT >= sat25){ academicFit = "MATCH";  score += 20; }
      else                         { academicFit = "REACH";  score += 10; }
    } else {
      if (ar > 0.5)       { academicFit = "SAFETY"; score += 30; }
      else if (ar >= 0.2) { academicFit = "MATCH";  score += 20; }
      else                { academicFit = "REACH";  score += 10; }
    }
  } else if (studentACT && college.act_25 && college.act_75) {
    if (studentACT > college.act_75)      { academicFit = "SAFETY"; score += 30; }
    else if (studentACT >= college.act_25){ academicFit = "MATCH";  score += 20; }
    else                                  { academicFit = "REACH";  score += 10; }
  } else {
    if (ar > 0.5)       { academicFit = "SAFETY"; score += 30; }
    else if (ar >= 0.2) { academicFit = "MATCH";  score += 20; }
    else                { academicFit = "REACH";  score += 10; }
  }

  // ── 3. Preferences (20 pts) ───────────────────────────────────────────────
  // Region
  if (!prefs.regions.length) {
    score += 5;
  } else {
    const r = getRegionForState(college.state);
    if (r && prefs.regions.includes(r)) score += 5;
  }
  // Size
  if (!prefs.sizes.length) {
    score += 5;
  } else {
    if (prefs.sizes.includes(getSizeKey(college.undergrad_enrollment))) score += 5;
  }
  // Setting
  if (!prefs.settings.length) {
    score += 5;
  } else {
    const settingMatch = prefs.settings.some(s =>
      college.setting?.toLowerCase().includes(s.toLowerCase())
    );
    if (settingMatch) score += 5;
  }
  // Major
  if (!prefs.majors.length) {
    score += 5;
  } else {
    const majorMatch = prefs.majors.some(m =>
      college.popular_programs?.some(p =>
        p?.toLowerCase().includes(m.split(" ")[0].toLowerCase())
      )
    );
    if (majorMatch) score += 5;
  }

  // ── 4. Intl bonus (10 pts) ────────────────────────────────────────────────
  if (prefs.isInternational) {
    if (college.avg_aid_intl > 0)          score += 5;
    if (college.meets_full_need === "Yes")  score += 3;
    if (college.pct_intl_receiving_aid > 0.3) score += 2;
  }

  return { score: Math.min(score, 100), academicFit };
}

function buildResults(colleges, prefs) {
  const dreamIds = new Set(prefs.dreamSchools);
  const dist     = STRATEGY_DIST[prefs.strategy] || STRATEGY_DIST.balanced;

  const reach = [], match = [], safety = [];

  for (const c of colleges) {
    if (dreamIds.has(c.id)) continue;
    const res = scoreCollege(c, prefs);
    if (!res) continue;
    const entry = { college: c, score: res.score, academicFit: res.academicFit };
    if (res.academicFit === "REACH")  reach.push(entry);
    else if (res.academicFit === "MATCH")  match.push(entry);
    else                              safety.push(entry);
  }

  const byScore = (a, b) => b.score - a.score;
  reach.sort(byScore); match.sort(byScore); safety.sort(byScore);

  return {
    dreamSchools: prefs.dreamSchools.map(id => colleges.find(c => c.id === id)).filter(Boolean),
    reach:  reach.slice(0, dist.reach),
    match:  match.slice(0, dist.match),
    safety: safety.slice(0, dist.safety),
  };
}

// ─── XLSX Export ─────────────────────────────────────────────────────────────

function exportToExcel(results, prefs) {
  const { dreamSchools, reach, match, safety } = results;
  const rows = [];

  const fmt = (category, college, score) => ({
    "Category":                      category,
    "School Name":                   college.name,
    "Location":                      [college.city, college.state].filter(Boolean).join(", "),
    "US News Rank":                  college.us_news_rank || "—",
    "Acceptance Rate":               college.acceptance_rate != null ? `${Math.round(college.acceptance_rate * 100)}%` : "—",
    "Tuition (Out of State)":        college.tuition_out_of_state ? `$${college.tuition_out_of_state.toLocaleString()}` : "—",
    "Avg Aid for Intl Students":     prefs.isInternational && college.avg_aid_intl ? `$${college.avg_aid_intl.toLocaleString()}` : "—",
    "Avg Cost After Aid":            college.avg_coa_after_aid || college.avg_annual_cost ? `$${(college.avg_coa_after_aid || college.avg_annual_cost || 0).toLocaleString()}` : "—",
    "ED Deadline":                   college.early_plan || "—",
    "RD Deadline":                   "—",
    "Aid Type":                      college.intl_aid_type || college.how_to_apply_aid || "—",
    "Meets Full Need":               college.meets_full_need || "—",
    "Median Earnings 10yr":          college.median_earnings_10yr ? `$${college.median_earnings_10yr.toLocaleString()}` : "—",
    "Common App":                    "—",
    "Website":                       college.website_url || "—",
    "Match Score":                   score != null ? `${score}%` : "Dream",
  });

  dreamSchools.forEach(c => rows.push(fmt("💛 Dream School", c, null)));
  reach.forEach(({ college, score })  => rows.push(fmt("🔴 Reach",  college, score)));
  match.forEach(({ college, score })  => rows.push(fmt("🟡 Match",  college, score)));
  safety.forEach(({ college, score }) => rows.push(fmt("🟢 Safety", college, score)));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "College List");

  const colWidths = [14, 36, 22, 12, 16, 20, 22, 20, 16, 14, 20, 14, 18, 12, 32, 12];
  ws["!cols"] = colWidths.map(w => ({ wch: w }));

  const filename = `${prefs.name || "My"}-CollegeList-LilGrant.xlsx`;
  XLSX.writeFile(wb, filename);
}

// ─── Dream School Search ──────────────────────────────────────────────────────

function DreamSchoolSearch({ colleges, selected, onChange }) {
  const [query, setQuery] = useState("");
  const [open, setOpen]   = useState(false);
  const ref = useRef(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return colleges
      .filter(c => c.name?.toLowerCase().includes(q) && !selected.includes(c.id))
      .slice(0, 8);
  }, [query, colleges, selected]);

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedColleges = selected.map(id => colleges.find(c => c.id === id)).filter(Boolean);

  return (
    <div ref={ref} className="space-y-3">
      {/* Added chips */}
      {selectedColleges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedColleges.map(c => (
            <div key={c.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                 style={{ backgroundColor: "rgba(252,211,77,0.2)", border: "1px solid rgba(252,211,77,0.5)", color: "rgba(252,211,77,1)" }}>
              <span>{c.name}</span>
              <button onClick={() => onChange(selected.filter(id => id !== c.id))} className="ml-1 hover:opacity-70">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      {selected.length < 5 && (
        <div className="relative">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
               style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.5)" }} />
            <input
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40"
              placeholder="Search colleges…"
              value={query}
              onChange={e => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
            />
          </div>

          {open && filtered.length > 0 && (
            <div className="absolute z-20 w-full mt-1 rounded-xl overflow-hidden shadow-xl"
                 style={{ backgroundColor: "#3d2060", border: "1px solid rgba(255,255,255,0.15)" }}>
              {filtered.map(c => (
                <button
                  key={c.id}
                  className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors"
                  onMouseDown={e => {
                    e.preventDefault();
                    onChange([...selected, c.id]);
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  <p className="text-sm font-medium text-white">{c.name}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {[c.city, c.state].filter(Boolean).join(", ")}
                    {c.acceptance_rate != null && ` · ${Math.round(c.acceptance_rate * 100)}% admit`}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {selected.length >= 5 && (
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Maximum of 5 dream schools reached.</p>
      )}
    </div>
  );
}

// ─── Result Card ─────────────────────────────────────────────────────────────

function ResultCard({ college, category, score, isIntl }) {
  const cost = college.avg_coa_after_aid ?? college.avg_annual_cost ?? college.tuition_out_of_state ?? null;

  const accent =
    category === "dream"  ? "rgba(252,211,77,1)"    :
    category === "reach"  ? "rgba(248,113,113,1)"   :
    category === "match"  ? "rgba(251,191,36,1)"     :
                            "rgba(52,211,153,1)";

  const bg =
    category === "dream"  ? "rgba(252,211,77,0.08)"  :
    category === "reach"  ? "rgba(248,113,113,0.08)" :
    category === "match"  ? "rgba(251,191,36,0.08)"  :
                            "rgba(52,211,153,0.08)";

  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: bg, border: `1px solid ${accent}33` }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="font-bold text-white text-sm leading-snug">{college.name}</p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
            {[college.city, college.state].filter(Boolean).join(", ")}
            {college.control_type && ` · ${college.control_type}`}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {score != null && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: accent + "33", color: accent }}>
              {score}% match
            </span>
          )}
          {college.us_news_rank && (
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              #{college.us_news_rank} US News
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <div>
          <p style={{ color: "rgba(255,255,255,0.4)" }}>Admit Rate</p>
          <p className="font-semibold text-white">
            {college.acceptance_rate != null ? `${Math.round(college.acceptance_rate * 100)}%` : "—"}
          </p>
        </div>
        <div>
          <p style={{ color: "rgba(255,255,255,0.4)" }}>Est. Cost</p>
          <p className="font-semibold text-white">
            {cost ? `$${Math.round(cost / 1000)}k` : "—"}
          </p>
        </div>
        <div>
          <p style={{ color: "rgba(255,255,255,0.4)" }}>Intl Aid</p>
          <p className="font-semibold" style={{ color: college.avg_aid_intl > 0 ? "rgba(52,211,153,1)" : "rgba(255,255,255,0.4)" }}>
            {isIntl && college.avg_aid_intl ? `$${Math.round(college.avg_aid_intl / 1000)}k` : "—"}
          </p>
        </div>
      </div>

      <Link
        to={`/universities/${college.id}`}
        className="block w-full text-center py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80"
        style={{ backgroundColor: accent + "22", color: accent, border: `1px solid ${accent}44` }}
      >
        View School →
      </Link>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CollegeListBuilder() {
  const [step,        setStep]        = useState(0);
  const [prefs,       setPrefs]       = useState(DEFAULT_PREFS);
  const [results,     setResults]     = useState(null);   // null | {reach, match, safety, dreamSchools}
  const [welcomeBack, setWelcomeBack] = useState(null);   // null | {name}

  const { data: colleges = [], isLoading } = useQuery({
    queryKey: ["colleges"],
    queryFn: () => db.entities.College.list(),
  });

  // ── LocalStorage ──────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name) setWelcomeBack(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (step > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    }
  }, [prefs, step]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function up(fields) { setPrefs(p => ({ ...p, ...fields })); }
  function toggleArr(arr, val) {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
  }

  function next() {
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1);
    else finish();
  }
  function back() { setStep(s => Math.max(0, s - 1)); }
  function finish() {
    const r = buildResults(colleges, prefs);
    setResults(r);
    setStep(TOTAL_STEPS); // results page
  }
  function restart() {
    setPrefs(DEFAULT_PREFS);
    setResults(null);
    setStep(0);
    localStorage.removeItem(STORAGE_KEY);
    setWelcomeBack(null);
  }

  // Optional steps (can be skipped)
  const OPTIONAL = new Set([5, 6, 7, 8, 10]);
  const isOptional = OPTIONAL.has(step);

  // Next disabled conditions
  const nextDisabled = (
    (step === 0 && !prefs.name.trim()) ||
    (step === 1 && prefs.isInternational === null)
  );

  // ── Welcome back banner ───────────────────────────────────────────────────
  if (welcomeBack && step === 0 && results === null) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full rounded-3xl p-8 text-center"
             style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <div className="text-4xl mb-4">👋</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome back, {welcomeBack.name}!
          </h2>
          <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.65)" }}>
            You have a previous session saved. Would you like to continue where you left off?
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setPrefs(welcomeBack); setStep(9); setWelcomeBack(null); }}
              className="py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: "rgba(255,255,255,0.9)", color: "#7a5a9d" }}
            >
              Continue my list
            </button>
            <button
              onClick={() => { localStorage.removeItem(STORAGE_KEY); setWelcomeBack(null); }}
              className="py-3 rounded-xl font-medium text-sm transition-all hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              Start fresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Results page ──────────────────────────────────────────────────────────
  if (step === TOTAL_STEPS && results) {
    const { dreamSchools, reach, match, safety } = results;
    const total = dreamSchools.length + reach.length + match.length + safety.length;

    return (
      <div className="min-h-screen pb-20">
        {/* Header */}
        <div className="text-center px-4 pt-12 pb-8">
          <div className="text-5xl mb-4"><GraduationCap className="inline w-12 h-12" /></div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Here&apos;s your college list{prefs.name ? `, ${prefs.name}` : ""}! 🎓
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            {total} schools selected based on your profile
          </p>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            <button
              onClick={() => exportToExcel(results, prefs)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: "rgba(52,211,153,0.2)", color: "rgba(52,211,153,1)", border: "1px solid rgba(52,211,153,0.4)" }}
            >
              <Download className="w-4 h-4" />
              Download My List as Excel
            </button>
            <button
              onClick={restart}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <RotateCcw className="w-4 h-4" />
              Start Over
            </button>
          </div>

          {/* Dream Schools */}
          {dreamSchools.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-white mb-3">💛 Dream Schools</h2>
              <div className="space-y-3">
                {dreamSchools.map(c => (
                  <ResultCard key={c.id} college={c} category="dream" score={null} isIntl={prefs.isInternational} />
                ))}
              </div>
            </div>
          )}

          {/* Reach */}
          {reach.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-white mb-1">🔴 Reach Schools</h2>
              <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                Competitive admits — worth the shot!
              </p>
              <div className="space-y-3">
                {reach.map(({ college, score }) => (
                  <ResultCard key={college.id} college={college} category="reach" score={score} isIntl={prefs.isInternational} />
                ))}
              </div>
            </div>
          )}

          {/* Match */}
          {match.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-white mb-1">🟡 Match Schools</h2>
              <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                Strong fit — you have a solid chance of admission.
              </p>
              <div className="space-y-3">
                {match.map(({ college, score }) => (
                  <ResultCard key={college.id} college={college} category="match" score={score} isIntl={prefs.isInternational} />
                ))}
              </div>
            </div>
          )}

          {/* Safety */}
          {safety.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-white mb-1">🟢 Safety Schools</h2>
              <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                Highly likely to be admitted — great options to have!
              </p>
              <div className="space-y-3">
                {safety.map(({ college, score }) => (
                  <ResultCard key={college.id} college={college} category="safety" score={score} isIntl={prefs.isInternational} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Wizard ────────────────────────────────────────────────────────────────
  const stepContent = (() => {
    // Step 0 — Welcome
    if (step === 0) return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Welcome! 👋</h2>
        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>
          Let&apos;s build your personalized college list in a few minutes.
        </p>

        <div className="space-y-4">
          <div>
            <SectionLabel>Your first name</SectionLabel>
            <input
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder:text-white/40 outline-none border border-white/20 focus:border-white/50 text-sm"
              placeholder="e.g. Priya"
              value={prefs.name}
              onChange={e => up({ name: e.target.value })}
            />
          </div>

          <div>
            <SectionLabel>What grade are you in?</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {GRADES.map(g => (
                <ToggleChip key={g} label={g} selected={prefs.grade === g} onClick={() => up({ grade: g })} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );

    // Step 1 — Citizenship
    if (step === 1) return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Are you an international student?</h2>
        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>
          This helps us show you relevant aid and cost information.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <BigCard
            emoji="🌍"
            title="International Student"
            sub="Citizen of a country other than the US"
            selected={prefs.isInternational === true}
            onClick={() => up({ isInternational: true })}
          />
          <BigCard
            emoji="🇺🇸"
            title="US Citizen / Permanent Resident"
            sub="Eligible for federal financial aid"
            selected={prefs.isInternational === false}
            onClick={() => up({ isInternational: false })}
          />
        </div>
      </div>
    );

    // Step 2 — Budget
    if (step === 2) {
      const noLimit = prefs.maxBudget === null;
      const budgetVal = noLimit ? 100000 : prefs.maxBudget;
      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">What&apos;s your maximum yearly budget?</h2>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>
            Include tuition, room &amp; board, and living expenses.
          </p>

          <div className="text-center mb-6">
            <p className="text-4xl font-black text-white mb-1">
              {noLimit ? "$100k+" : `$${budgetVal.toLocaleString()}`}
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>per year</p>
          </div>

          <input
            type="range" min={5000} max={100000} step={1000}
            value={budgetVal}
            onChange={e => {
              const v = Number(e.target.value);
              up({ maxBudget: v >= 100000 ? null : v });
            }}
            className="w-full accent-white cursor-pointer"
          />
          <div className="flex justify-between mt-2 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            <span>$5,000</span><span>$100,000+</span>
          </div>

          {noLimit && (
            <p className="mt-4 text-xs text-center" style={{ color: "rgba(255,255,255,0.55)" }}>
              No budget limit set — we&apos;ll show all schools regardless of cost.
            </p>
          )}
        </div>
      );
    }

    // Step 3 — Academic Profile
    if (step === 3) return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Your academic profile</h2>
        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>
          Used to classify schools as reach, match, or safety.
        </p>

        <div className="space-y-5">
          <div>
            <SectionLabel>GPA (unweighted, 0.0 – 4.0)</SectionLabel>
            <input
              type="number" min="0" max="4" step="0.01"
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder:text-white/40 outline-none border border-white/20 focus:border-white/50 text-sm"
              placeholder="e.g. 3.7"
              value={prefs.gpa}
              onChange={e => up({ gpa: e.target.value })}
            />
          </div>

          <div>
            <SectionLabel>Test scores</SectionLabel>
            <div className="flex gap-2 mb-3">
              {["SAT","ACT","Test-Optional"].map(t => (
                <ToggleChip key={t} label={t} selected={prefs.testType === t} onClick={() => up({ testType: t })} />
              ))}
            </div>
            {prefs.testType === "SAT" && (
              <input
                type="number" min="400" max="1600" step="10"
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder:text-white/40 outline-none border border-white/20 focus:border-white/50 text-sm"
                placeholder="SAT score (400–1600)"
                value={prefs.sat}
                onChange={e => up({ sat: e.target.value })}
              />
            )}
            {prefs.testType === "ACT" && (
              <input
                type="number" min="1" max="36" step="1"
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder:text-white/40 outline-none border border-white/20 focus:border-white/50 text-sm"
                placeholder="ACT composite score (1–36)"
                value={prefs.act}
                onChange={e => up({ act: e.target.value })}
              />
            )}
            {prefs.testType === "Test-Optional" && (
              <p className="text-xs px-4 py-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}>
                We&apos;ll use each school&apos;s admission rate to determine fit.
              </p>
            )}
          </div>
        </div>
      </div>
    );

    // Step 4 — Location
    if (step === 4) return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Location preferences</h2>
        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>
          Where in the US would you like to study?
        </p>

        {prefs.isInternational && (
          <div className="mb-5">
            <SectionLabel>What country are you from?</SectionLabel>
            <input
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder:text-white/40 outline-none border border-white/20 focus:border-white/50 text-sm"
              placeholder="e.g. India, South Korea, Nigeria…"
              value={prefs.homeCountry}
              onChange={e => up({ homeCountry: e.target.value })}
            />
          </div>
        )}

        <div>
          <SectionLabel>Preferred US regions (select all that apply)</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {REGIONS.map(r => (
              <ToggleChip
                key={r.key} label={r.label}
                selected={prefs.regions.includes(r.key)}
                onClick={() => up({ regions: toggleArr(prefs.regions, r.key) })}
              />
            ))}
            <ToggleChip
              label="🗺️ No preference"
              selected={prefs.regions.length === 0}
              onClick={() => up({ regions: [] })}
            />
          </div>
        </div>
      </div>
    );

    // Step 5 — School Size
    if (step === 5) return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">School size</h2>
        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>
          Pick one or more — or skip for no preference.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {SIZES.map(s => (
            <BigCard
              key={s.key} emoji="🏫" title={s.label} sub={s.sub}
              selected={prefs.sizes.includes(s.key)}
              onClick={() => up({ sizes: toggleArr(prefs.sizes, s.key) })}
            />
          ))}
        </div>
      </div>
    );

    // Step 6 — Setting
    if (step === 6) return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Campus setting</h2>
        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>
          What environment do you prefer? Pick any.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {SETTINGS.map(s => (
            <BigCard
              key={s.key} emoji="" title={s.label} sub={null}
              selected={prefs.settings.includes(s.key)}
              onClick={() => up({ settings: toggleArr(prefs.settings, s.key) })}
            />
          ))}
        </div>
      </div>
    );

    // Step 7 — Majors
    if (step === 7) return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Fields of study</h2>
        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>
          What do you plan to study? Pick up to 3.
        </p>
        <div className="flex flex-wrap gap-2">
          {MAJORS.map(m => (
            <ToggleChip
              key={m} label={m}
              selected={prefs.majors.includes(m)}
              disabled={!prefs.majors.includes(m) && prefs.majors.length >= 3}
              onClick={() => {
                if (prefs.majors.includes(m) || prefs.majors.length < 3)
                  up({ majors: toggleArr(prefs.majors, m) });
              }}
            />
          ))}
        </div>
        {prefs.majors.length === 3 && (
          <p className="mt-3 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            Maximum 3 selected. Deselect one to change.
          </p>
        )}
      </div>
    );

    // Step 8 — School Type
    if (step === 8) return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">School type</h2>
        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>
          Any specific preferences? All optional.
        </p>
        <div className="space-y-5">
          <div>
            <SectionLabel>Public vs. Private</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {[{k:"any",l:"No preference"},{k:"Public",l:"Public"},{k:"Private nonprofit",l:"Private"}].map(o => (
                <ToggleChip key={o.k} label={o.l} selected={prefs.controlType === o.k} onClick={() => up({ controlType: o.k })} />
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Student body</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {[{k:"any",l:"No preference"},{k:"Coeducational",l:"Co-ed"},{k:"Women's",l:"Women's College"}].map(o => (
                <ToggleChip key={o.k} label={o.l} selected={prefs.genderSetting === o.k} onClick={() => up({ genderSetting: o.k })} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );

    // Step 9 — Strategy
    if (step === 9) return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">How would you like to balance your list?</h2>
        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>
          This determines how many reach, match, and safety schools we include.
        </p>
        <div className="space-y-3">
          {[
            { key: "ambitious", emoji: "🎯", title: "Ambitious",
              sub: "3–4 reach · 4–5 match · 2–3 safety — swing for the fences" },
            { key: "balanced",  emoji: "⚖️", title: "Balanced",
              sub: "2–3 reach · 6–8 match · 3–4 safety — solid and realistic" },
            { key: "safe",      emoji: "🛡️", title: "Safe",
              sub: "1–2 reach · 5–6 match · 4–5 safety — prioritize certainty" },
          ].map(s => (
            <BigCard
              key={s.key} emoji={s.emoji} title={s.title} sub={s.sub}
              selected={prefs.strategy === s.key}
              onClick={() => up({ strategy: s.key })}
            />
          ))}
        </div>
      </div>
    );

    // Step 10 — Dream Schools
    if (step === 10) return (
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Any dream schools?</h2>
        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>
          Add up to 5 schools you want to attend no matter what —
          we&apos;ll always include these at the top of your list.
        </p>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "rgba(255,255,255,0.5)" }} />
          </div>
        ) : (
          <DreamSchoolSearch
            colleges={colleges}
            selected={prefs.dreamSchools}
            onChange={ids => up({ dreamSchools: ids })}
          />
        )}
      </div>
    );

    return null;
  })();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
            Step {step + 1} of {TOTAL_STEPS}
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            {STEP_TITLES[step]}
          </p>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1 rounded-full mb-6" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%`, backgroundColor: "rgba(255,255,255,0.8)" }}
          />
        </div>

        <StepIndicator step={step} total={TOTAL_STEPS} />

        {/* Card */}
        <div
          key={step}
          className="rounded-3xl p-6 sm:p-8 mb-6"
          style={{
            backgroundColor: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            animation: "fadeIn 0.2s ease",
          }}
        >
          {stepContent}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              onClick={back}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}

          <div className="flex-1" />

          {isOptional && (
            <button
              onClick={next}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              Skip
            </button>
          )}

          <button
            onClick={step === TOTAL_STEPS - 1 ? finish : next}
            disabled={nextDisabled || (step === TOTAL_STEPS - 1 && isLoading)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: "rgba(255,255,255,0.9)", color: "#7a5a9d" }}
          >
            {step === TOTAL_STEPS - 1 ? (
              isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Building…</> : "Build My List 🎓"
            ) : (
              <>Next <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

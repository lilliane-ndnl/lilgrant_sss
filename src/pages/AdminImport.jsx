import { db } from '@/api/base44Client';
import React, { useState, useRef } from "react";

import {
  Loader2, Download, CheckCircle, AlertCircle, ChevronDown, ChevronUp,
  Filter, Database, Upload, FileText, RefreshCw, Merge, Globe
} from "lucide-react";
import { toast } from "sonner";

const API_KEY = import.meta.env.VITE_SCORECARD_API_KEY || "2tNX6yRH58baD6mpdXyEu1mcxEaVOFQTEtKRrX4n";

// ── Scorecard fields — admissions + costs + demographics + programs ───────────
const SCORECARD_FIELDS = [
  "id","school.name","school.city","school.state","school.school_url",
  "school.locale","school.ownership","school.degrees_awarded.predominant",
  "school.region_id","school.carnegie_size_setting",
  "latest.admissions.admission_rate.overall",
  "latest.admissions.admission_rate.by_ope_id",
  "latest.student.size","latest.student.enrollment.undergrad_12_month",
  "latest.student.enrollment.grad_12_month",
  "latest.student.demographics.race_ethnicity.asian",
  "latest.student.demographics.race_ethnicity.black",
  "latest.student.demographics.race_ethnicity.hispanic",
  "latest.student.demographics.race_ethnicity.white",
  "latest.student.demographics.race_ethnicity.non_resident_alien",
  "latest.student.demographics.women",
  "latest.cost.tuition.in_state","latest.cost.tuition.out_of_state",
  "latest.cost.avg_net_price.overall","latest.cost.avg_net_price.private",
  "latest.cost.avg_net_price.public",
  "latest.aid.pell_grant_rate","latest.aid.loan_principal",
  "latest.aid.federal_loan_rate","latest.aid.median_debt.completers.overall",
  "latest.completion.rate_suppressed.overall",
  "latest.student.retention_rate.four_year.full_time",
  "latest.earnings.10_yrs_after_entry.median",
  "latest.earnings.6_yrs_after_entry.median",
  "latest.repayment.3_yr_repayment.overall",
  "latest.admissions.sat_scores.25th_percentile.critical_reading",
  "latest.admissions.sat_scores.75th_percentile.critical_reading",
  "latest.admissions.sat_scores.25th_percentile.math",
  "latest.admissions.sat_scores.75th_percentile.math",
  "latest.admissions.act_scores.25th_percentile.cumulative",
  "latest.admissions.act_scores.75th_percentile.cumulative",
  "latest.admissions.act_scores.midpoint.cumulative",
  "latest.admissions.sat_scores.midpoint.critical_reading",
  "latest.admissions.sat_scores.midpoint.math",
  // Programs (top 6 CIP titles)
  "latest.programs.cip_4_digit.title",
  "latest.programs.cip_4_digit.credential.level",
  "school.men_only","school.women_only",
  "school.minority_serving.historically_black",
  "school.carnegie_basic",
].join(",");

// ── Field of Study API (separate endpoint) ────────────────────────────────────
// This gives program-level earnings/completion data per school
const FOS_FIELDS = [
  "unit_id","school.name","field_of_study.title","field_of_study.credential.level",
  "field_of_study.earnings.highest.2_yr.overall_median_earnings",
  "field_of_study.earnings.highest.3_yr.overall_median_earnings",
  "field_of_study.earnings.count_wne_3yr",
].join(",");

const REGION_MAP = { 1:"Northeast",2:"Mid-Atlantic",3:"Southeast",4:"Midwest",5:"Southwest",6:"West",7:"West",8:"West",9:"West" };
const OWNERSHIP_MAP = { 1:"Public",2:"Private Non-Profit",3:"Private For-Profit" };
const DEGREE_MAP = { 1:"Certificate",2:"Associate",3:"Bachelor's",4:"Master's" };
const LOCALE_SETTING = (l) => { if(l==null) return undefined; if(l<=13) return "City"; if(l<=23) return "Suburb"; if(l<=33) return "Town"; return "Rural"; };

const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];

function mapScorecardToCollege(r) {
  const pct = (v) => (v != null ? Math.round(v * 100) : undefined);

  // Extract popular programs from CIP data (array of objects)
  let popularPrograms = [];
  const cipTitles = r["latest.programs.cip_4_digit.title"];
  if (Array.isArray(cipTitles)) {
    // Deduplicate and take top 8
    popularPrograms = [...new Set(cipTitles.filter(Boolean))].slice(0, 8);
  }

  // Best net cost (use private if available, else overall)
  const netCost = r["latest.cost.avg_net_price.private"] ??
                  r["latest.cost.avg_net_price.public"] ??
                  r["latest.cost.avg_net_price.overall"] ?? undefined;

  return {
    scorecard_id: r["id"],
    name: r["school.name"],
    city: r["school.city"],
    state: r["school.state"],
    region: REGION_MAP[r["school.region_id"]],
    control_type: OWNERSHIP_MAP[r["school.ownership"]],
    setting: LOCALE_SETTING(r["school.locale"]),
    website_url: r["school.school_url"],
    predominant_degree: DEGREE_MAP[r["school.degrees_awarded.predominant"]],
    acceptance_rate: r["latest.admissions.admission_rate.overall"] ?? undefined,
    total_enrollment: r["latest.student.size"] ?? undefined,
    undergrad_enrollment: r["latest.student.enrollment.undergrad_12_month"] ?? undefined,
    grad_enrollment: r["latest.student.enrollment.grad_12_month"] ?? undefined,
    tuition_in_state: r["latest.cost.tuition.in_state"] ?? undefined,
    tuition_out_of_state: r["latest.cost.tuition.out_of_state"] ?? undefined,
    avg_annual_cost: netCost,
    pct_receiving_pell: pct(r["latest.aid.pell_grant_rate"]),
    median_debt_graduation: r["latest.aid.median_debt.completers.overall"] ?? r["latest.aid.loan_principal"] ?? undefined,
    pct_students_with_loans: pct(r["latest.aid.federal_loan_rate"]),
    graduation_rate: r["latest.completion.rate_suppressed.overall"] ?? undefined,
    retention_rate: r["latest.student.retention_rate.four_year.full_time"] ?? undefined,
    median_earnings_10yr: r["latest.earnings.10_yrs_after_entry.median"] ?? undefined,
    median_earnings_6yr: r["latest.earnings.6_yrs_after_entry.median"] ?? undefined,
    loan_repayment_rate: r["latest.repayment.3_yr_repayment.overall"] ?? undefined,
    sat_reading_25: r["latest.admissions.sat_scores.25th_percentile.critical_reading"] ?? undefined,
    sat_reading_75: r["latest.admissions.sat_scores.75th_percentile.critical_reading"] ?? undefined,
    sat_math_25: r["latest.admissions.sat_scores.25th_percentile.math"] ?? undefined,
    sat_math_75: r["latest.admissions.sat_scores.75th_percentile.math"] ?? undefined,
    act_25: r["latest.admissions.act_scores.25th_percentile.cumulative"] ?? undefined,
    act_75: r["latest.admissions.act_scores.75th_percentile.cumulative"] ?? undefined,
    pct_women: pct(r["latest.student.demographics.women"]),
    pct_intl_students: pct(r["latest.student.demographics.race_ethnicity.non_resident_alien"]),
    pct_asian: pct(r["latest.student.demographics.race_ethnicity.asian"]),
    pct_black: pct(r["latest.student.demographics.race_ethnicity.black"]),
    pct_hispanic: pct(r["latest.student.demographics.race_ethnicity.hispanic"]),
    pct_white: pct(r["latest.student.demographics.race_ethnicity.white"]),
    popular_programs: popularPrograms,
    aid_type: "Need-Aware",
    data_cached: true,
  };
}

// ── Fetch Field of Study earnings data for a school by unitid ─────────────────
async function fetchFieldsOfStudy(unitid) {
  const params = new URLSearchParams({
    api_key: API_KEY,
    fields: FOS_FIELDS,
    unit_id: unitid,
    "field_of_study.credential.level": "3", // Bachelor's = level 3
    per_page: 20,
  });
  const res = await fetch(`https://api.data.gov/ed/collegescorecard/v1/schools.json?${params}`);
  const json = await res.json();
  if (!json.results || json.results.length === 0) return [];
  // Extract titles with earnings
  return (json.results[0]["latest.programs.cip_4_digit"] || [])
    .filter(p => p?.title && p?.credential?.level === 3)
    .map(p => p.title)
    .filter(Boolean)
    .slice(0, 10);
}

// ── CSV parsing ───────────────────────────────────────────────────────────────
function parseCSVText(text, delimiter = ",") {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(delimiter).map(h => h.replace(/^["'\uFEFF]+|["']+$/g, "").trim());
  return lines.slice(1).map(line => {
    const cols = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQ = !inQ; }
      else if (line[i] === delimiter && !inQ) { cols.push(cur); cur = ""; }
      else { cur += line[i]; }
    }
    cols.push(cur);
    const row = {};
    headers.forEach((h, i) => { row[h] = (cols[i] || "").trim(); });
    return row;
  });
}

// ── Parse the LilGrant masterfile (semicolon-delimited) ──────────────────────
function parseLilGrantRow(row) {
  const n = (v) => {
    if (!v || v === "-" || v === "N/A" || v === "" || v === "No data" || v === "TBD" || v === "unknown") return null;
    // Handle European decimal comma (e.g. "0,41" → 0.41)
    const f = parseFloat(String(v).replace(/[$,%]/g,"").replace(",","."));
    return isNaN(f) ? null : f;
  };

  // Support both old masterfile column names and new international CSV columns
  const name = row["School Name"] || row["University/College Name"] || row["University.College Name"];
  if (!name || name.trim() === "") return null;

  // ── Aid type: from "Meets Full Need" field ──
  const meetsNeedRaw = (row["Meets Full Need"] || row["Meets full demonstrated need?"] || "").trim();
  const isNeedBlind = meetsNeedRaw.toLowerCase().includes("need-blind");
  const meetsFullNeed = meetsNeedRaw.toLowerCase().includes("yes");

  // ── % intl students receiving aid (comes as decimal 0-1 or whole number) ──
  let pctAid = n(row["Intl Students w/ Aid (%)"] || row["Percentage of International students who receive aid"] || row["Percentage of international students who receive aids?"]);
  if (pctAid != null && pctAid <= 1) pctAid = Math.round(pctAid * 100);

  // ── Average aid awarded ──
  const avgAid = n(row["Avg Aid Awarded"] || row["Average amount awarded"] || row["Average amount awarded?"]);

  // ── Avg COA after aid (net cost) ──
  const avgCOAAfterAid = n(row["Avg COA After Aid"]);

  // ── Intl yield (decimal — skip CoC2027 outdated data) ──
  const intlYield = n(row["Intl Yield"]);

  // ── Intl acceptance rate (can be "23%" or decimal) ──
  let intlRate = null;
  const intlRateRaw = row["Intl Acceptance Rate"] || row["International admission rate"] || "";
  if (intlRateRaw && intlRateRaw !== "-") {
    if (intlRateRaw.includes("%")) {
      intlRate = parseFloat(intlRateRaw.replace("%","").trim()) / 100;
    } else {
      const v = n(intlRateRaw);
      if (v != null) intlRate = v > 1 ? v / 100 : v;
    }
  }

  // ── Intl applicants/admitted/enrolled (current cycle only, NOT CoC2027) ──
  const intlApps = n(row["Intl Applicants"]);
  const intlAdmit = n(row["Intl Accepted"]);
  const intlEnroll = n(row["Intl Enrolled"]);

  // ── Scholarship info ──
  const scholName = row["Scholarship Name"] || row["Scholarship's Name and Information"] || "";
  const scholInfo = row["Scholarship Info"] || row["Scholarship's Information"] || "";
  const scholLink = row["Scholarship's Link"] || "";

  // ── Testing policy ──
  const testing = row["Testing Policy"] || row["Testing Requirements"] || "";

  // ── Early plan → deadlines ──
  const earlyPlan = row["Early Plan"] || "";
  let edDeadline = "", eaDeadline = "";
  if (earlyPlan.toLowerCase().includes("decision only") || earlyPlan.toLowerCase() === "early decision only") edDeadline = "ED";
  if (earlyPlan.toLowerCase().includes("action only")) eaDeadline = "EA";
  if (earlyPlan.toLowerCase() === "both") { edDeadline = "ED"; eaDeadline = "EA"; }

  // ── Tags ──
  const tags = row["Tags"] || "";

  // ── Aid type label ──
  let aidType = undefined;
  if (isNeedBlind) {
    aidType = "Need-Blind";
  } else if (meetsFullNeed) {
    aidType = "Need-Blind"; // meets full need → effectively need-blind
  }

  const result = { name: name.trim() };
  if (aidType) result.aid_type = aidType;
  if (meetsFullNeed || isNeedBlind) result.meets_full_need = true;
  if (pctAid != null) result.pct_intl_receiving_aid = pctAid;
  if (avgAid != null) result.avg_aid_intl = avgAid;
  if (avgCOAAfterAid != null) result.avg_annual_cost = avgCOAAfterAid;
  if (intlYield != null) result.intl_yield = intlYield;
  if (intlRate != null) result.intl_acceptance_rate = intlRate;
  if (intlApps != null) result.intl_applicants = intlApps;
  if (intlAdmit != null) result.intl_admitted = intlAdmit;
  if (intlEnroll != null) result.intl_enrolled = intlEnroll;
  if (scholName) result.scholarship_name = scholName;
  if (scholInfo) result.scholarship_info = scholInfo;
  if (scholLink) result.scholarship_link = scholLink;
  if (testing) result.testing_policy = testing;
  if (edDeadline) result.ed_deadline = edDeadline;
  if (eaDeadline) result.ea_deadline = eaDeadline;
  if (tags) result.intl_aid_notes = tags; // store tags in intl_aid_notes for now
  return result;
}

// Parse Common App CSV (semicolon-delimited)
function parseCommonAppRow(row) {
  const name = row["Common App Member"] || row["Common App Member\uFEFF"] || row["\uFEFFCommon App Member"] || row["name"];
  if (!name || name.trim() === "") return null;
  const testPolicy = row["Standard Test Policy"] || "";
  let policy = null;
  if (testPolicy === "F") policy = "Test-Free";
  else if (testPolicy === "N") policy = "Not Required";
  else if (testPolicy === "S") policy = "Recommended";
  else if (testPolicy === "R") policy = "Required";
  return {
    name: name.trim(),
    uses_common_app: true,
    ...(policy ? { testing_policy: policy } : {}),
  };
}

// Parse Common App Requirements Grid (ReqGrid CSV)
function parseReqGridRow(row) {
  // The name column has a BOM and no label on second row
  const name = row["\uFEFF"] || row["Common App Member"] || row[""] || "";
  if (!name || name.trim() === "" || name.trim().startsWith("NOTES")) return null;

  // Skip rows that are clearly notes/legends
  const trimmed = name.trim();
  if (trimmed.length > 100) return null;

  // Test policy mapping
  const TEST_POLICY_MAP = { A: "Required", F: "Test-Free", I: "Not Required", N: "Not Required", S: "Optional" };
  const testCode = (row["Test Policy"] || row["Minimum Standard Test Policy 1"] || "").trim();
  const testPolicy = TEST_POLICY_MAP[testCode] || null;

  // Deadlines
  const edDeadline  = (row["Deadline ED"]          || row["Deadlines 1"] || "").trim();
  const eaDeadline  = (row["Deadline EA"]          || row["Deadlines 3"] || "").trim();
  const rdDeadline  = (row["Deadline RD/ Rolling"] || row["Deadlines 6"] || "").trim();

  const result = { name: trimmed, uses_common_app: true };
  if (testPolicy) result.testing_policy = testPolicy;
  if (edDeadline) result.ed_deadline = edDeadline;
  if (eaDeadline) result.ea_deadline = eaDeadline;
  if (rdDeadline) result.rd_deadline = rdDeadline;
  return result;
}

// Parse International Admission Rate CSV (semicolon-delimited)
function parseIntlRateRow(row) {
  const name = row["Institution"] || row["\uFEFFInstitution"];
  if (!name) return null;
  const rateStr = row["International Students - Acceptance Rate%"] || "";
  const rate = parseFloat(rateStr.replace("%","")) / 100;
  const apps = parseInt(row["International Students - Applicants"]);
  const admitted = parseInt(row["International Students - Applicants Accepted"]);
  const enrolled = parseInt(row["International Students - Enrollment"]);
  const result = { name: name.trim() };
  if (!isNaN(rate)) result.intl_acceptance_rate = rate;
  if (!isNaN(apps)) result.intl_applicants = apps;
  if (!isNaN(admitted)) result.intl_admitted = admitted;
  if (!isNaN(enrolled)) result.intl_enrolled = enrolled;
  return result;
}

// Fuzzy name match — normalize and compare
function normalizeName(n) {
  return (n || "").toLowerCase()
    .replace(/university of /g, "u of ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fuzzyMatch(dbName, sourceName) {
  const a = normalizeName(dbName);
  const b = normalizeName(sourceName);
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  return false;
}

// ── Bulk import helper ────────────────────────────────────────────────────────
async function runBulkImport(batch, onProgress) {
  const CHUNK = 10;
  let count = 0;
  for (let i = 0; i < batch.length; i += CHUNK) {
    await db.entities.College.bulkCreate(batch.slice(i, i + CHUNK));
    count += Math.min(CHUNK, batch.length - i);
    onProgress(count);
  }
  return count;
}

// ── Fetch single school from Scorecard by unitid, save/update in DB ──────────
async function fetchAndCacheSchool(unitid, existingCollege) {
  const params = new URLSearchParams({ api_key: API_KEY, fields: SCORECARD_FIELDS, "id": unitid });
  const res = await fetch(`https://api.data.gov/ed/collegescorecard/v1/schools?${params}`);
  const json = await res.json();
  if (!json.results || json.results.length === 0) return null;
  const mapped = mapScorecardToCollege(json.results[0]);
  // Preserve existing enrichment fields that Scorecard doesn't have
  const update = { ...mapped };
  if (existingCollege) {
    await db.entities.College.update(existingCollege.id, update);
  } else {
    await db.entities.College.create(update);
  }
  return mapped;
}

// ── UI Components ─────────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl p-6 mb-5" style={{ backgroundColor:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.18)" }}>
      <div className="flex items-center gap-2 mb-5">
        <Icon className="w-4 h-4" style={{ color:"rgba(192,132,252,0.9)" }} />
        <h2 className="font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ ok, label }) {
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${ok ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>{label}</span>
  );
}

function PreviewTable({ rows }) {
  return (
    <div className="overflow-x-auto rounded-xl mb-4" style={{ border:"1px solid rgba(255,255,255,0.15)" }}>
      <table className="w-full text-xs">
        <thead>
          <tr style={{ backgroundColor:"rgba(255,255,255,0.08)" }}>
            {["Name","State","Intl Rate","Avg Aid","% Aid","Common App","Aid Type"].map(h => (
              <th key={h} className="px-3 py-2 text-left font-medium whitespace-nowrap" style={{ color:"rgba(255,255,255,0.6)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0,50).map((c,i) => (
            <tr key={i} style={{ borderTop:"1px solid rgba(255,255,255,0.07)" }}>
              <td className="px-3 py-2 text-white font-medium max-w-[160px] truncate">{c.name}</td>
              <td className="px-3 py-2" style={{ color:"rgba(255,255,255,0.7)" }}>{c.state || "—"}</td>
              <td className="px-3 py-2" style={{ color:"rgba(255,255,255,0.7)" }}>{c.intl_acceptance_rate != null ? `${Math.round(c.intl_acceptance_rate*100)}%` : "—"}</td>
              <td className="px-3 py-2" style={{ color:"rgba(255,255,255,0.7)" }}>{c.avg_aid_intl ? `$${Number(c.avg_aid_intl).toLocaleString()}` : "—"}</td>
              <td className="px-3 py-2" style={{ color:"rgba(255,255,255,0.7)" }}>{c.pct_intl_receiving_aid != null ? `${c.pct_intl_receiving_aid}%` : "—"}</td>
              <td className="px-3 py-2">{c.uses_common_app ? <StatusBadge ok label="Yes" /> : "—"}</td>
              <td className="px-3 py-2" style={{ color:"rgba(255,255,255,0.7)" }}>{c.aid_type || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 50 && <p className="text-center text-xs py-2" style={{ color:"rgba(255,255,255,0.4)" }}>Showing first 50 of {rows.length}</p>}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminImport() {
  const [tab, setTab] = useState("enrich");

  // ── Enrich tab ──
  const [enrichRows, setEnrichRows] = useState([]);
  const [enrichFilename, setEnrichFilename] = useState("");
  const [enrichFileType, setEnrichFileType] = useState("lilgrant"); // lilgrant | commonapp | intlrate | reqgrid
  const [enrichLoading, setEnrichLoading] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState({ done: 0, total: 0, matched: 0, skipped: 0 });
  const [enrichDone, setEnrichDone] = useState(false);
  const [enrichNotFound, setEnrichNotFound] = useState([]);
  const enrichInput = useRef();

  // ── API tab ──
  const [filterState, setFilterState] = useState("all");
  const [perPage, setPerPage] = useState(100);
  const [page, setPage] = useState(0);
  const [onlyFourYear, setOnlyFourYear] = useState(true);
  const [apiResults, setApiResults] = useState([]);
  const [total, setTotal] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiImporting, setApiImporting] = useState(false);
  const [apiImported, setApiImported] = useState(0);
  const [apiError, setApiError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // ── Full sync tab ──
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncLog, setSyncLog] = useState([]);
  const [syncProgress, setSyncProgress] = useState({ done: 0, total: 0 });
  const [syncDone, setSyncDone] = useState(false);
  const [syncOnlyUncached, setSyncOnlyUncached] = useState(true);

  // ── Cache tab ──
  const [cacheLoading, setCacheLoading] = useState(false);
  const [cacheLog, setCacheLog] = useState([]);
  const [cacheDone, setCacheDone] = useState(false);

  // ── CSV tab ──
  const [csvRows, setCsvRows] = useState([]);
  const [csvFilename, setCsvFilename] = useState("");
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvImported, setCsvImported] = useState(0);
  const csvInput = useRef();

  // ── Parse enrich file ──────────────────────────────────────────────────────
  function handleEnrichFile(file) {
    if (!file) return;
    setEnrichRows([]); setEnrichFilename(file.name); setEnrichDone(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      // Detect delimiter
      const delim = text.slice(0, 500).includes(";") ? ";" : ",";
      const rows = parseCSVText(text, delim);
      let parsed = [];
      if (enrichFileType === "commonapp") {
        parsed = rows.map(parseCommonAppRow).filter(Boolean);
      } else if (enrichFileType === "intlrate") {
        parsed = rows.map(parseIntlRateRow).filter(Boolean);
      } else if (enrichFileType === "reqgrid") {
        // Skip first row (it's the group header row) — real data starts at row index 1
        parsed = rows.slice(1).map(parseReqGridRow).filter(Boolean);
      } else {
        parsed = rows.map(parseLilGrantRow).filter(Boolean);
      }
      setEnrichRows(parsed);
      toast.success(`Parsed ${parsed.length} rows from ${file.name}`);
    };
    reader.readAsText(file);
  }

  // ── Run enrich: match by name, patch existing records ─────────────────────
  async function runEnrich() {
    setEnrichLoading(true); setEnrichDone(false); setEnrichNotFound([]);
    setEnrichProgress({ done: 0, total: enrichRows.length, matched: 0, skipped: 0 });

    // Load all existing colleges (up to 3000)
    const allColleges = await db.entities.College.list("-created_date", 3000);
    let matched = 0, skipped = 0;
    const notFound = [];
    const BATCH = 5;
    const DELAY = 1000;

    for (let i = 0; i < enrichRows.length; i++) {
      const src = enrichRows[i];
      // Find best match in DB
      const dbMatch = allColleges.find(c => fuzzyMatch(c.name, src.name));
      if (dbMatch) {
        // Only update non-null fields from source
        const patch = {};
        for (const [k, v] of Object.entries(src)) {
          if (k === "name") continue;
          if (v !== null && v !== undefined && v !== "") patch[k] = v;
        }
        if (Object.keys(patch).length > 0) {
          let retries = 3;
          while (retries > 0) {
            try {
              await db.entities.College.update(dbMatch.id, patch);
              matched++;
              break;
            } catch (e) {
              retries--;
              if (retries === 0) { skipped++; notFound.push(`${src.name} (update error)`); }
              else await new Promise(r => setTimeout(r, 2000));
            }
          }
        } else {
          matched++; // counts as matched even if no patch needed
        }
      } else {
        skipped++;
        notFound.push(src.name);
      }
      setEnrichProgress({ done: i + 1, total: enrichRows.length, matched, skipped });
      if ((i + 1) % BATCH === 0) await new Promise(r => setTimeout(r, DELAY));
    }
    setEnrichLoading(false); setEnrichDone(true);
    setEnrichNotFound(notFound);
    toast.success(`Enriched ${matched} colleges! (${skipped} not matched)`);
  }

  // ── Full Data Sync: fetch ALL 4-year schools from Scorecard, store in DB ────
  // Handles pagination automatically — fetches up to ~3,000 schools in pages of 100
  async function runFullSync() {
    setSyncLoading(true); setSyncDone(false); setSyncLog([]); setSyncProgress({ done: 0, total: 0 });

    // Step 1: Get all existing records so we can update vs create
    const existing = await db.entities.College.list("-created_date", 2000);
    const existingByName = {};
    existing.forEach(c => { existingByName[normalizeName(c.name)] = c; });
    setSyncLog([`Found ${existing.length} schools already in database.`]);

    // Step 2: Fetch all 4-year schools from Scorecard via pagination
    let allResults = [];
    let page = 0;
    const PER_PAGE = 100;
    setSyncLog(prev => [...prev, "Fetching all 4-year schools from Scorecard API..."]);

    while (true) {
      const params = new URLSearchParams({
        api_key: API_KEY,
        fields: SCORECARD_FIELDS,
        per_page: PER_PAGE,
        page,
        "school.degrees_awarded.predominant": "3,4", // bachelor's & graduate-offering
      });
      const res = await fetch(`https://api.data.gov/ed/collegescorecard/v1/schools?${params}`);
      const json = await res.json();
      const results = json.results || [];
      if (results.length === 0) break;
      allResults = allResults.concat(results);
      const total = json.metadata?.total || allResults.length;
      setSyncProgress({ done: allResults.length, total });
      setSyncLog(prev => [...prev, `  Fetched page ${page} → ${allResults.length}/${total} schools`]);
      if (allResults.length >= total) break;
      page++;
      await new Promise(r => setTimeout(r, 200)); // rate limit
    }

    setSyncLog(prev => [...prev, `\nFetched ${allResults.length} schools total. Now saving to database...`]);

    // Step 3: Upsert each school (update if exists, create if new)
    let updated = 0, created = 0, errors = 0;
    const CHUNK = 5;
    for (let i = 0; i < allResults.length; i += CHUNK) {
      const chunk = allResults.slice(i, i + CHUNK);
      await Promise.all(chunk.map(async (r) => {
        const mapped = mapScorecardToCollege(r);
        if (!mapped.name) return;
        const key = normalizeName(mapped.name);
        try {
          if (existingByName[key]) {
            await db.entities.College.update(existingByName[key].id, mapped);
            updated++;
          } else if (!syncOnlyUncached) {
            await db.entities.College.create(mapped);
            created++;
          }
        } catch (e) {
          errors++;
        }
      }));
      setSyncProgress({ done: i + CHUNK, total: allResults.length });
    }

    setSyncLog(prev => [...prev, `\nDone! Updated: ${updated}, Created: ${created}, Errors: ${errors}`]);
    setSyncLoading(false); setSyncDone(true);
    toast.success(`Full sync complete! ${updated} updated, ${created} new schools.`);

    const allData = await db.entities.College.list();
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'colleges-updated.json';
    a.click();
    toast.success('JSON file downloaded! Replace src/data/colleges-2026-04-24.json with this file.');
  }

  // ── Fetch & Cache: pull Scorecard data for each existing school once ────────
  async function runFetchAndCache() {
    setCacheLoading(true); setCacheDone(false); setCacheLog([]);

    // Get all colleges that don't have data_cached yet
    const allColleges = await db.entities.College.list("-created_date", 1000);
    const needsCache = allColleges.filter(c => !c.data_cached && c.name);

    if (needsCache.length === 0) {
      setCacheLoading(false); setCacheDone(true);
      toast.info("All schools already have cached data!");
      return;
    }

    setCacheLog([`Found ${needsCache.length} schools to cache from Scorecard API...`]);

    for (const college of needsCache) {
      try {
        // Search by name
        const params = new URLSearchParams({
          api_key: API_KEY,
          fields: SCORECARD_FIELDS,
          "school.name": college.name,
          per_page: 1,
          ...(onlyFourYear ? { "school.degrees_awarded.predominant": "3,4" } : {}),
        });
        const res = await fetch(`https://api.data.gov/ed/collegescorecard/v1/schools?${params}`);
        const json = await res.json();
        if (json.results && json.results.length > 0) {
          const mapped = mapScorecardToCollege(json.results[0]);
          await db.entities.College.update(college.id, mapped);
          setCacheLog(prev => [...prev, `✓ Cached: ${college.name}`]);
        } else {
          // Mark as attempted so we don't retry forever
          await db.entities.College.update(college.id, { data_cached: true });
          setCacheLog(prev => [...prev, `⚠ Not found in Scorecard: ${college.name}`]);
        }
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 300));
      } catch (e) {
        setCacheLog(prev => [...prev, `✗ Error: ${college.name} — ${e.message}`]);
      }
    }
    setCacheLoading(false); setCacheDone(true);
    toast.success("Scorecard caching complete!");
  }

  // ── Scorecard batch fetch ──────────────────────────────────────────────────
  async function fetchFromScorecard() {
    setApiError(""); setApiLoading(true); setApiResults([]); setTotal(null); setApiImported(0);
    const params = new URLSearchParams({ api_key: API_KEY, fields: SCORECARD_FIELDS, per_page: perPage, page });
    if (filterState !== "all") params.append("school.state", filterState);
    if (onlyFourYear) params.append("school.degrees_awarded.predominant", "3,4");
    try {
      const res = await fetch(`https://api.data.gov/ed/collegescorecard/v1/schools?${params}`);
      if (!res.ok) { const j = await res.json().catch(()=>({})); throw new Error(j?.error?.message || `HTTP ${res.status}`); }
      const json = await res.json();
      setTotal(json.metadata?.total ?? 0);
      setApiResults(json.results || []);
    } catch (e) { setApiError(e.message || "Failed to fetch"); }
    finally { setApiLoading(false); }
  }

  async function importApi() {
    setApiImporting(true); setApiImported(0);
    const batch = apiResults.map(mapScorecardToCollege).filter(c => c.name);
    await runBulkImport(batch, setApiImported);
    setApiImporting(false);
    toast.success(`Imported ${batch.length} colleges!`);
  }

  // ── CSV import ─────────────────────────────────────────────────────────────
  function handleCsvFile(file) {
    if (!file) return;
    setCsvRows([]); setCsvFilename(file.name); setCsvImported(0);
    const reader = new FileReader();
    reader.onload = (e) => {
      const rows = parseCSVText(e.target.result);
      const colleges = rows.map(r => {
        const name = r["name"] || r["INSTNM"];
        if (!name) return null;
        return { name, state: r["state"] || r["STABBR"], aid_type: "Need-Aware", data_cached: false };
      }).filter(Boolean);
      setCsvRows(colleges);
    };
    reader.readAsText(file);
  }

  const apiMapped = apiResults.map(mapScorecardToCollege);

  // ── Common App Members tab ──
  const [caRows, setCaRows] = useState([]);
  const [caFilename, setCaFilename] = useState("");
  const [caLoading, setCaLoading] = useState(false);
  const [caProgress, setCaProgress] = useState({ done: 0, total: 0, matched: 0, skipped: 0 });
  const [caDone, setCaDone] = useState(false);
  const [caNotFound, setCaNotFound] = useState([]);
  const [caDebugHeaders, setCaDebugHeaders] = useState([]);
  const caInput = useRef();

  function parseCaRows(jsonRows) {
    // jsonRows: array of objects with keys matching the XLSX/CSV columns
    // Row 0 of the XLSX is the sub-header row (e.g. "Deadline ED", "Test Policy", etc.)
    // We need to remap col_0 → name, and use the sub-header values as real column names

    const TEST_MAP = { A: "Required", R: "Required", F: "Test-Free", I: "Not Required", N: "Not Required", S: "Optional", O: "Optional" };

    // The first row of data (index 0) contains the real sub-column headers
    const subHeaders = jsonRows[0];
    // Real column name mappings from the XLSX structure
    const nameKey   = "col_0";                           // "Common App Member"
    const edKey     = "Deadlines 1";                     // "Deadline ED"
    const ediiKey   = "Deadlines 2";                     // "Deadline EDII"
    const eaKey     = "Deadlines 3";                     // "Deadline EA"
    const eaiiKey   = "Deadlines 4";                     // "Deadline EAII"
    const reaKey    = "Deadlines 5";                     // "Deadline REA"
    const rdKey     = "Deadlines 6";                     // "Deadline RD/Rolling"
    const appFeeIntlKey = "App Fees² (USD$) 2";          // "App Fee - INTL (USD)"
    const testKey   = "Minimum Standard Test Policy 1";  // "Test Policy"
    const intlTestKey = "Minimum Standard Test Policy 3";// "INTL" test policy
    const teacherRecKey = "Recommendations 1";           // Teacher recs required
    const counselorRecKey = "Recommendations 4";         // Counselor rec required
    const midYearKey = "Recommendations 3";              // Mid-year report

    const fmt = (v) => {
      if (!v && v !== 0) return null;
      const s = String(v).trim().replace(/\xa0/g, " ");
      if (!s || s === "None" || s === "null") return null;
      // Format dates: "2025-11-01 00:00:00" → "11/1"
      const dateMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (dateMatch) {
        const month = parseInt(dateMatch[2]);
        const day = parseInt(dateMatch[3]);
        return `${month}/${day}`;
      }
      return s;
    };

    // Skip row 0 (sub-headers), parse from row 1 onward
    return jsonRows.slice(1).map(row => {
      const name = fmt(row[nameKey]);
      if (!name || name.length < 2 || name.startsWith("NOTES") || name.startsWith("*")) return null;

      const testCode = fmt(row[testKey]);
      const testPolicy = testCode ? (TEST_MAP[testCode.toUpperCase()] || testCode) : null;

      const intlTest = fmt(row[intlTestKey]);
      const appFeeIntl = fmt(row[appFeeIntlKey]);
      const edDeadline = fmt(row[edKey]);
      const ediiDeadline = fmt(row[ediiKey]);
      const eaDeadline = fmt(row[eaKey]);
      const eaiiDeadline = fmt(row[eaiiKey]);
      const reaDeadline = fmt(row[reaKey]);
      const rdDeadline = fmt(row[rdKey]);
      const teacherRec = fmt(row[teacherRecKey]);
      const counselorRec = fmt(row[counselorRecKey]);
      const midYear = fmt(row[midYearKey]);

      const result = { name, uses_common_app: true };
      if (testPolicy) result.testing_policy = testPolicy;
      if (edDeadline) result.ed_deadline = edDeadline;
      if (eaDeadline) result.ea_deadline = eaDeadline;
      if (rdDeadline) result.rd_deadline = rdDeadline;

      // Store supplemental info in intl_aid_notes
      const extras = [];
      if (ediiDeadline) extras.push(`EDII: ${ediiDeadline}`);
      if (eaiiDeadline) extras.push(`EAII: ${eaiiDeadline}`);
      if (reaDeadline) extras.push(`REA: ${reaDeadline}`);
      if (appFeeIntl) extras.push(`Intl App Fee: $${appFeeIntl}`);
      if (intlTest) extras.push(`Intl Test: ${intlTest}`);
      if (teacherRec) extras.push(`Teacher Recs: ${teacherRec}`);
      if (counselorRec === "Y") extras.push(`Counselor Rec: Yes`);
      if (midYear === "Y") extras.push(`Mid-Year Report: Yes`);
      if (extras.length > 0) result.intl_aid_notes = extras.join(" | ");

      return result;
    }).filter(Boolean);
  }

  function handleCaFile(file) {
    if (!file) return;
    setCaRows([]); setCaFilename(file.name); setCaDone(false); setCaDebugHeaders([]);

    const isXlsx = file.name.toLowerCase().endsWith(".xlsx") || file.name.toLowerCase().endsWith(".xls");

    if (isXlsx) {
      // Use ExtractDataFromUploadedFile integration via file upload
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // Upload file first
          const blob = new Blob([e.target.result], { type: file.type });
          const uploadFile = new File([blob], file.name, { type: file.type });
          toast.info("Uploading XLSX...");
          const uploadResult = await db.integrations.Core.UploadFile({ file: uploadFile });
          if (!uploadResult || !uploadResult.file_url) {
            toast.error("Upload failed - no file URL returned");
            return;
          }
          const { file_url } = uploadResult;

          toast.info("Extracting data from XLSX...");
          const result = await db.integrations.Core.ExtractDataFromUploadedFile({
            file_url,
            json_schema: {
              type: "object",
              properties: {
                rows: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: { type: "string" }
                  }
                }
              }
            }
          });

          if (!result) {
            toast.error("No response from extraction service");
            return;
          }
          if (result.status !== "success") {
            toast.error(`Extraction failed: ${result.details || "Unknown error"}`);
            return;
          }
          if (!result.output?.rows) {
            toast.error("No rows found in extracted data");
            return;
          }

          const parsed = parseCaRows(result.output.rows);
          setCaDebugHeaders(["col_0 (Name)", "Deadlines 1-6", "Test Policy", "App Fee INTL", "Recommendations"]);
          setCaRows(parsed);
          toast.success(`Parsed ${parsed.length} schools from ${file.name}`);
        } catch (err) {
          console.error("XLSX parse error:", err);
          toast.error("Error: " + (err.message || "Unknown error"));
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // CSV fallback
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const delim = text.slice(0, 2000).includes(";") ? ";" : ",";
        const lines = text.trim().split(/\r?\n/);
        if (lines.length < 3) { toast.error("File needs at least 3 rows"); return; }

        const rawHeaders = lines[0].split(delim).map(h => h.replace(/^["'\uFEFF\ufeff]+|["']+$/g, "").trim());
        setCaDebugHeaders(rawHeaders);

        const splitLine = (line) => {
          const cols = [];
          let cur = "", inQ = false;
          for (let i = 0; i < line.length; i++) {
            if (line[i] === '"') { inQ = !inQ; }
            else if (line[i] === delim && !inQ) { cols.push(cur); cur = ""; }
            else { cur += line[i]; }
          }
          cols.push(cur);
          return cols;
        };

        const jsonRows = lines.slice(1).map(line => {
          const cols = splitLine(line);
          const row = {};
          rawHeaders.forEach((h, i) => { row[h] = (cols[i] || "").trim(); });
          return row;
        });

        // Remap CSV to same key structure
        const remapped = jsonRows.map(r => ({
          col_0: r["Common App Member"] || r["col_0"] || r[rawHeaders[0]],
          col_1: r["School Type"] || r["col_1"],
          "Deadlines 1": r["Deadline ED"] || r["Deadlines 1"],
          "Deadlines 2": r["Deadline EDII"] || r["Deadlines 2"],
          "Deadlines 3": r["Deadline EA"] || r["Deadlines 3"],
          "Deadlines 4": r["Deadline EAII"] || r["Deadlines 4"],
          "Deadlines 5": r["Deadline REA"] || r["Deadlines 5"],
          "Deadlines 6": r["Deadline RD/ Rolling"] || r["Deadlines 6"],
          "App Fees² (USD$) 2": r["App Fee - INTL (USD)"] || r["App Fees² (USD$) 2"],
          "Minimum Standard Test Policy 1": r["Test Policy"] || r["Minimum Standard Test Policy 1"],
          "Minimum Standard Test Policy 3": r["INTL"] || r["Minimum Standard Test Policy 3"],
          "Recommendations 1": r["Recommendation - Teacher Evaluations Number required"] || r["Recommendations 1"],
          "Recommendations 3": r["Mid Year Report required"] || r["Recommendations 3"],
          "Recommendations 4": r["Counselor Recommendation required"] || r["Recommendations 4"],
        }));

        const parsed = parseCaRows([jsonRows[0], ...remapped.slice(1)]);
        setCaRows(parsed);
        toast.success(`Parsed ${parsed.length} schools from ${file.name}`);
      };
      reader.readAsText(file);
    }
  }

  async function runCaImport() {
    setCaLoading(true); setCaDone(false); setCaNotFound([]);
    setCaProgress({ done: 0, total: caRows.length, matched: 0, skipped: 0 });

    const allColleges = await db.entities.College.list("-created_date", 3000);
    let matched = 0, skipped = 0;
    const notFound = [];
    const BATCH = 5, DELAY = 800;

    for (let i = 0; i < caRows.length; i++) {
      const { name } = caRows[i];
      const dbMatch = allColleges.find(c => fuzzyMatch(c.name, name));
      if (dbMatch) {
        // Build patch from all non-null fields in the source row
        const patch = {};
        for (const [k, v] of Object.entries(caRows[i])) {
          if (k === "name") continue;
          if (v !== null && v !== undefined && v !== "") patch[k] = v;
        }
        let retries = 3;
        while (retries > 0) {
          try {
            await db.entities.College.update(dbMatch.id, patch);
            matched++;
            break;
          } catch {
            retries--;
            if (retries === 0) { skipped++; notFound.push(`${name} (update error)`); }
            else await new Promise(r => setTimeout(r, 2000));
          }
        }
      } else {
        skipped++;
        notFound.push(name);
      }
      setCaProgress({ done: i + 1, total: caRows.length, matched, skipped });
      if ((i + 1) % BATCH === 0) await new Promise(r => setTimeout(r, DELAY));
    }
    setCaLoading(false); setCaDone(true); setCaNotFound(notFound);
    toast.success(`Marked ${matched} schools as Common App members! (${skipped} not found in DB)`);
  }

  // ── International School List tab ──
  const [intlRows, setIntlRows] = useState([]);
  const [intlFilename, setIntlFilename] = useState("");
  const [intlLoading, setIntlLoading] = useState(false);
  const [intlProgress, setIntlProgress] = useState({ done: 0, total: 0, matched: 0, skipped: 0 });
  const [intlDone, setIntlDone] = useState(false);
  const [intlNotFound, setIntlNotFound] = useState([]);
  const intlInput = useRef();

  // ── Rankings tab ──
  const [rankFile, setRankFile] = useState(null);
  const [rankFilename, setRankFilename] = useState("");
  const [rankRows, setRankRows] = useState([]);
  const [rankType, setRankType] = useState("national"); // national | lac
  const [rankLoading, setRankLoading] = useState(false);
  const [rankProgress, setRankProgress] = useState({ done: 0, total: 0, matched: 0, skipped: 0 });
  const [rankDone, setRankDone] = useState(false);
  const [rankNotFound, setRankNotFound] = useState([]);
  const rankInput = useRef();

  // ── Parse International School List (semicolon CSV with European decimals) ──
  function parseIntlRow(row) {
    const n = (v) => {
      if (!v || v === "-" || v === "N/A" || v === "" || v === "TBD" || v === "No data" || v === "unknown" || v === "Unclear") return null;
      const f = parseFloat(String(v).replace(/[$,%]/g,"").replace(",",".")); // European decimal
      return isNaN(f) ? null : f;
    };

    const name = row["School Name"] || "";
    if (!name || name.trim() === "") return null;

    const region = row["Region?"] || "";
    const aidType = row["Aid Type"] || "";
    const avgAid = n(row["Avg Aid Awarded"]);
    const pctAid = n(row["Intl Students w/ Aid (%)"]);
    const avgCost = n(row["Avg COA After Aid"]);
    const acceptRate = n(row["Overall Acceptance Rate"]);
    const intlRate = n(row["Intl Acceptance Rate"]);
    const intlApps = n(row["Intl Applicants"]);
    const intlAdmit = n(row["Intl Accepted"]);
    const intlEnroll = n(row["Intl Enrolled"]);
    const intlYield = n(row["Intl Yield"]);
    const meetsNeed = (row["Meets Full Need"] || "").toLowerCase().includes("yes");
    const scholName = row["Scholarship Name"] || "";
    const scholInfo = row["Scholarship Info"] || "";

    const result = { name: name.trim() };
    if (aidType && aidType !== "N/A") result.aid_type = aidType;
    if (avgAid != null) result.avg_aid_intl = Math.round(avgAid);
    if (pctAid != null) result.pct_intl_receiving_aid = Math.round(pctAid * 100);
    if (avgCost != null) result.avg_annual_cost = Math.round(avgCost);
    if (acceptRate != null) result.acceptance_rate = acceptRate;
    if (intlRate != null) result.intl_acceptance_rate = intlRate;
    if (intlApps != null) result.intl_applicants = intlApps;
    if (intlAdmit != null) result.intl_admitted = intlAdmit;
    if (intlEnroll != null) result.intl_enrolled = intlEnroll;
    if (intlYield != null) result.intl_yield = intlYield;
    if (meetsNeed) result.meets_full_need = true;
    if (scholName) result.scholarship_name = scholName;
    if (scholInfo) result.scholarship_info = scholInfo;
    if (region) result.intl_aid_notes = region;
    
    return result;
  }

  function handleIntlFile(file) {
    if (!file) return;
    setIntlRows([]); setIntlFilename(file.name); setIntlDone(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const delim = text.slice(0, 500).includes(";") ? ";" : ",";
      const rows = parseCSVText(text, delim);
      const parsed = rows.map(parseIntlRow).filter(Boolean);
      setIntlRows(parsed);
      toast.success(`Parsed ${parsed.length} international schools from ${file.name}`);
    };
    reader.readAsText(file);
  }

  async function runIntlImport() {
    setIntlLoading(true); setIntlDone(false); setIntlNotFound([]);
    setIntlProgress({ done: 0, total: intlRows.length, matched: 0, skipped: 0 });

    const allColleges = await db.entities.College.list("-created_date", 3000);
    let matched = 0, skipped = 0;
    const notFound = [];
    const BATCH = 5, DELAY = 800;

    for (let i = 0; i < intlRows.length; i++) {
      const src = intlRows[i];
      const dbMatch = allColleges.find(c => fuzzyMatch(c.name, src.name));
      if (dbMatch) {
        const patch = {};
        for (const [k, v] of Object.entries(src)) {
          if (k === "name" || k === "intl_aid_notes") continue;
          if (v !== null && v !== undefined && v !== "") patch[k] = v;
        }
        let retries = 3;
        while (retries > 0) {
          try {
            await db.entities.College.update(dbMatch.id, patch);
            matched++;
            break;
          } catch (e) {
            retries--;
            if (retries === 0) { skipped++; notFound.push(src.name); }
            else await new Promise(r => setTimeout(r, 2000));
          }
        }
      } else {
        skipped++;
        notFound.push(src.name);
      }
      setIntlProgress({ done: i + 1, total: intlRows.length, matched, skipped });
      if ((i + 1) % BATCH === 0) await new Promise(r => setTimeout(r, DELAY));
    }
    setIntlLoading(false); setIntlDone(true);
    setIntlNotFound(notFound);
    toast.success(`Enriched ${matched} schools with international data! (${skipped} not found in DB)`);
  }

  function handleRankFile(file) {
    if (!file) return;
    setRankRows([]); setRankFilename(file.name); setRankDone(false);
    const reader = new FileReader();
    reader.onload = (e) => {
      const rows = parseCSVText(e.target.result, ",");
      // Extract: IPEDS ID, name, 2026 rank
      const sampleRow = rows[0] || {};
      const keys = Object.keys(sampleRow);

      // Strip BOM from all keys
      const cleanKey = (k) => k.replace(/^\uFEFF/, "").trim();
      const cleanedKeys = keys.map(cleanKey);

      // Find name column: "University Name" (NU file) or "College Name" (LAC file)
      const nameRawKey = keys.find(k => {
        const ck = cleanKey(k).toLowerCase();
        return ck === "university name" || ck === "college name" || ck === "school name";
      });

      // Find IPEDS column: "IPEDS" (NU file) or "IPEDS ID" (LAC file)
      const ipedsRawKey = keys.find(k => {
        const ck = cleanKey(k).toLowerCase();
        return ck === "ipeds" || ck === "ipeds id";
      });

      // Find rank column: key exactly "2026"
      const rankKey = keys.find(k => cleanKey(k) === "2026") || "2026";

      const parsed = rows.map(row => {
        const ipeds = ipedsRawKey ? (row[ipedsRawKey] || "").trim() : "";
        const name  = nameRawKey  ? (row[nameRawKey]  || "").trim() : "";
        const rankRaw = row[rankKey] || "";
        const rank = parseInt(rankRaw.replace(/[^0-9]/g, ""));
        if (!rank || isNaN(rank)) return null;
        return { ipeds, name, rank };
      }).filter(Boolean);

      toast.success(`Parsed ${parsed.length} ranking rows · name="${cleanKey(nameRawKey||"?")}" · ipeds="${cleanKey(ipedsRawKey||"?")}"`);
      setRankRows(parsed);
    };
    reader.readAsText(file);
  }

  async function runRankImport() {
    setRankLoading(true); setRankDone(false);
    setRankProgress({ done: 0, total: rankRows.length, matched: 0, skipped: 0 });

    // Load all colleges — match by scorecard_id (IPEDS) first, then name
    const allColleges = await db.entities.College.list("-created_date", 2000);
    const byIpeds = {};
    allColleges.forEach(c => { if (c.scorecard_id) byIpeds[String(c.scorecard_id)] = c; });

    let matched = 0, skipped = 0;
    const notFound = [];
    const BATCH = 3;
    const DELAY = 1500;

    for (let i = 0; i < rankRows.length; i++) {
      const { ipeds, name, rank } = rankRows[i];
      const dbMatch = byIpeds[ipeds] || allColleges.find(c => fuzzyMatch(c.name, name));
      if (dbMatch) {
        // Skip if already has the correct rank (allows safe re-runs / resume)
        if (dbMatch.us_news_rank === rank) {
          matched++;
          setRankProgress({ done: i + 1, total: rankRows.length, matched, skipped });
          continue;
        }
        let retries = 3;
        while (retries > 0) {
          try {
            await db.entities.College.update(dbMatch.id, { us_news_rank: rank });
            matched++;
            break;
          } catch (e) {
            retries--;
            if (retries === 0) { skipped++; break; }
            await new Promise(r => setTimeout(r, 2000)); // wait before retry
          }
        }
      } else {
        skipped++;
        notFound.push(`${name} (IPEDS: ${ipeds})`);
      }
      setRankProgress({ done: i + 1, total: rankRows.length, matched, skipped });
      if ((i + 1) % BATCH === 0) await new Promise(r => setTimeout(r, DELAY));
    }
    setRankLoading(false); setRankDone(true);
    if (notFound.length > 0) setRankNotFound(notFound);
    toast.success(`Updated ${matched} schools with US News 2026 rankings! (${skipped} not found)`);
  }

  const TABS = [
    { key: "sync",      label: "⚡ Full Data Sync" },
    { key: "enrich",    label: "🔗 Enrich from Files" },
    { key: "rankings",  label: "🏆 US News Rankings" },
    { key: "commonapp", label: "🎓 Common App Members" },
    { key: "intl",      label: "🌍 International School List" },
    { key: "cache",     label: "💾 Fetch & Cache API" },
    { key: "api",       label: "🌐 Batch API Import" },
    { key: "csv",       label: "📄 Upload CSV" },
  ];

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-6 h-6" style={{ color:"rgba(192,132,252,0.9)" }} />
            <h1 className="text-2xl font-bold text-white">College Data Admin</h1>
          </div>
          <p className="text-sm" style={{ color:"rgba(255,255,255,0.65)" }}>
            Enrich existing records from your files, cache Scorecard data permanently, or import new schools.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={tab === t.key
                ? { backgroundColor:"rgba(255,255,255,0.88)", color:"#7a5a9d" }
                : { backgroundColor:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.75)", border:"1px solid rgba(255,255,255,0.2)" }
              }
            >{t.label}</button>
          ))}
        </div>

        {/* ── FULL SYNC TAB ──────────────────────────────────────────────────── */}
        {tab === "sync" && (
          <Section title="Full Data Sync — All 4-Year Schools" icon={RefreshCw}>
            <p className="text-xs mb-4" style={{ color:"rgba(255,255,255,0.6)" }}>
              Fetches <strong className="text-white">every 4-year college</strong> from the Scorecard API (all ~2,800 schools, paginated)
              and saves admission rates, costs, SAT/ACT, demographics, earnings, and <strong className="text-white">fields of study/programs</strong> directly to your database.
              Schools already in the DB are updated; new ones are created.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl p-4" style={{ backgroundColor:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }}>
                <p className="text-xs font-semibold text-white mb-2">What gets saved</p>
                <ul className="text-xs space-y-1" style={{ color:"rgba(255,255,255,0.6)" }}>
                  <li>✓ Admission rate, SAT/ACT ranges</li>
                  <li>✓ Tuition, avg net cost, debt</li>
                  <li>✓ Graduation & retention rates</li>
                  <li>✓ Median earnings (6yr & 10yr)</li>
                  <li>✓ Demographics breakdown</li>
                  <li>✓ Popular programs (CIP titles)</li>
                  <li>✓ Loan repayment rate</li>
                  <li>✓ % students with federal loans</li>
                </ul>
              </div>
              <div className="rounded-xl p-4" style={{ backgroundColor:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }}>
                <p className="text-xs font-semibold text-white mb-2">Estimated time</p>
                <ul className="text-xs space-y-1" style={{ color:"rgba(255,255,255,0.6)" }}>
                  <li>~30 API pages to fetch all schools</li>
                  <li>~5-10 min to save all records</li>
                  <li>Run once — data stays forever</li>
                  <li>Re-run anytime to refresh data</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-5">
              <input id="syncUncached" type="checkbox" checked={syncOnlyUncached} onChange={e => setSyncOnlyUncached(e.target.checked)} />
              <label htmlFor="syncUncached" className="text-sm" style={{ color:"rgba(255,255,255,0.75)" }}>
                Only update existing schools (don't create new records)
              </label>
            </div>

            {syncProgress.total > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1" style={{ color:"rgba(255,255,255,0.65)" }}>
                  <span>Progress</span>
                  <span>{Math.min(syncProgress.done, syncProgress.total)}/{syncProgress.total} schools</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor:"rgba(255,255,255,0.12)" }}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${Math.min(100, (syncProgress.done/syncProgress.total)*100)}%`,
                    backgroundColor:"rgba(192,132,252,0.8)"
                  }} />
                </div>
              </div>
            )}

            {syncLog.length > 0 && (
              <div className="rounded-xl p-3 mb-4 max-h-40 overflow-y-auto" style={{ backgroundColor:"rgba(0,0,0,0.25)", border:"1px solid rgba(255,255,255,0.1)" }}>
                {syncLog.map((line, i) => (
                  <p key={i} className="text-xs font-mono mb-0.5" style={{ color: line.startsWith("Done") ? "rgba(110,231,183,0.9)" : "rgba(255,255,255,0.65)" }}>
                    {line}
                  </p>
                ))}
              </div>
            )}

            {syncDone && (
              <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ backgroundColor:"rgba(52,211,153,0.15)", border:"1px solid rgba(52,211,153,0.3)" }}>
                <CheckCircle className="w-4 h-4 text-green-400" />
                <p className="text-sm text-green-300">Full sync complete! All data stored in your backend.</p>
              </div>
            )}

            <button onClick={runFullSync} disabled={syncLoading}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              style={{ backgroundColor:"rgba(255,255,255,0.88)", color:"#7a5a9d" }}>
              {syncLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Syncing all schools… (keep this tab open)</>
                : <><RefreshCw className="w-4 h-4" /> Start Full Data Sync</>}
            </button>
          </Section>
        )}

        {/* ── ENRICH TAB ─────────────────────────────────────────────────────── */}
        {tab === "enrich" && (
          <>
            <Section title="Enrich Existing Schools from Your Files" icon={Merge}>
              <p className="text-xs mb-4" style={{ color:"rgba(255,255,255,0.6)" }}>
                Upload your LilGrant masterfile, Common App CSV, or International Admission Rate CSV.
                We'll match schools by name and fill in missing fields — without overwriting anything.
              </p>

              {/* File type selector */}
              <div className="mb-4">
                <p className="text-[11px] mb-2" style={{ color:"rgba(255,255,255,0.5)" }}>File type</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key:"lilgrant", label:"LilGrant Masterfile (semicolon CSV / XLSX exported)" },
                    { key:"commonapp", label:"Common App Member List" },
                    { key:"intlrate", label:"International Admission Rates" },
                    { key:"reqgrid", label:"Common App Requirements Grid (ReqGrid)" },
                  ].map(ft => (
                    <button key={ft.key} onClick={() => setEnrichFileType(ft.key)}
                      className="px-3 py-1.5 rounded-lg text-xs transition-all"
                      style={enrichFileType === ft.key
                        ? { backgroundColor:"rgba(192,132,252,0.3)", color:"rgba(220,180,255,1)", border:"1px solid rgba(192,132,252,0.5)" }
                        : { backgroundColor:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.65)", border:"1px solid rgba(255,255,255,0.15)" }
                      }
                    >{ft.label}</button>
                  ))}
                </div>
              </div>

              {/* File drop zone */}
              <div
                onClick={() => enrichInput.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleEnrichFile(e.dataTransfer.files[0]); }}
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer mb-4 transition-all hover:opacity-80"
                style={{ borderColor:"rgba(255,255,255,0.25)", backgroundColor:"rgba(255,255,255,0.05)" }}
              >
                <FileText className="w-7 h-7 mx-auto mb-2" style={{ color:"rgba(192,132,252,0.7)" }} />
                <p className="text-sm font-medium text-white mb-1">{enrichFilename || "Drop CSV here or click to browse"}</p>
                <p className="text-xs" style={{ color:"rgba(255,255,255,0.5)" }}>Semi-colon or comma delimited CSV</p>
                <input ref={enrichInput} type="file" accept=".csv,.txt" className="hidden"
                  onChange={e => handleEnrichFile(e.target.files[0])} />
              </div>

              {enrichRows.length > 0 && (
                <>
                  <p className="text-sm font-medium text-white mb-3">{enrichRows.length} rows parsed — preview:</p>
                  <PreviewTable rows={enrichRows} />

                  {enrichLoading && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1" style={{ color:"rgba(255,255,255,0.65)" }}>
                        <span>Processing… {enrichProgress.done}/{enrichProgress.total}</span>
                        <span>✓ {enrichProgress.matched} matched · ⚠ {enrichProgress.skipped} skipped</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor:"rgba(255,255,255,0.12)" }}>
                        <div className="h-full rounded-full transition-all" style={{ width:`${(enrichProgress.done/enrichProgress.total)*100}%`, backgroundColor:"rgba(192,132,252,0.8)" }} />
                      </div>
                    </div>
                  )}

                  {enrichDone && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor:"rgba(52,211,153,0.15)", border:"1px solid rgba(52,211,153,0.3)" }}>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <p className="text-sm text-green-300">Done! {enrichProgress.matched} schools enriched, {enrichProgress.skipped} not matched.</p>
                      </div>
                      {enrichNotFound.length > 0 && (
                        <div className="mt-2 p-3 rounded-xl" style={{ backgroundColor:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)" }}>
                          <p className="text-xs font-semibold text-red-300 mb-1">Not found in DB ({enrichNotFound.length}):</p>
                          <div className="max-h-48 overflow-y-auto">
                            {enrichNotFound.map((n, i) => <p key={i} className="text-xs text-red-300">• {n}</p>)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <button onClick={runEnrich} disabled={enrichLoading}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                    style={{ backgroundColor:"rgba(192,132,252,0.2)", color:"rgba(220,180,255,1)", border:"1px solid rgba(192,132,252,0.35)" }}>
                    {enrichLoading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Enriching…</>
                      : <><Merge className="w-4 h-4" /> Enrich {enrichRows.length} Schools</>}
                  </button>
                </>
              )}
            </Section>
          </>
        )}

        {/* ── COMMON APP MEMBERS TAB ─────────────────────────────────────────── */}
        {tab === "commonapp" && (
          <Section title="Common App Members Import" icon={CheckCircle}>
            <p className="text-xs mb-4" style={{ color:"rgba(255,255,255,0.6)" }}>
              Upload your Common App member list (any CSV format). The parser will auto-detect the name column and mark matching schools as <strong className="text-white">uses_common_app: true</strong>.
            </p>

            <div
              onClick={() => caInput.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleCaFile(e.dataTransfer.files[0]); }}
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer mb-4 hover:opacity-80 transition-all"
              style={{ borderColor:"rgba(96,165,250,0.4)", backgroundColor:"rgba(96,165,250,0.05)" }}
            >
              <FileText className="w-7 h-7 mx-auto mb-2" style={{ color:"rgba(96,165,250,0.7)" }} />
              <p className="text-sm font-medium text-white mb-1">{caFilename || "Drop CSV here or click to browse"}</p>
              <p className="text-xs" style={{ color:"rgba(255,255,255,0.5)" }}>XLSX or CSV — directly from Common App ReqGrid export</p>
              <input ref={caInput} type="file" accept=".csv,.txt,.xlsx,.xls" className="hidden" onChange={e => handleCaFile(e.target.files[0])} />
            </div>

            {caDebugHeaders.length > 0 && (
              <div className="rounded-xl p-3 mb-4" style={{ backgroundColor:"rgba(0,0,0,0.2)", border:"1px solid rgba(255,255,255,0.1)" }}>
                <p className="text-[10px] font-semibold mb-1" style={{ color:"rgba(255,255,255,0.4)" }}>Detected columns:</p>
                <p className="text-xs font-mono" style={{ color:"rgba(96,165,250,0.9)" }}>{caDebugHeaders.slice(0,10).join(" · ")}{caDebugHeaders.length > 10 ? ` …+${caDebugHeaders.length - 10} more` : ""}</p>
              </div>
            )}

            {caRows.length > 0 && (
              <>
                <div className="rounded-xl overflow-hidden mb-4" style={{ border:"1px solid rgba(255,255,255,0.12)" }}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ backgroundColor:"rgba(255,255,255,0.08)" }}>
                        {["#","School Name","Test Policy","ED Deadline","EA Deadline","RD Deadline"].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-medium whitespace-nowrap" style={{ color:"rgba(255,255,255,0.6)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {caRows.slice(0, 20).map((r, i) => (
                        <tr key={i} style={{ borderTop:"1px solid rgba(255,255,255,0.07)" }}>
                          <td className="px-3 py-1.5" style={{ color:"rgba(255,255,255,0.4)" }}>{i + 1}</td>
                          <td className="px-3 py-1.5 text-white max-w-[180px] truncate">{r.name}</td>
                          <td className="px-3 py-1.5" style={{ color:"rgba(255,255,255,0.7)" }}>{r.testing_policy || "—"}</td>
                          <td className="px-3 py-1.5" style={{ color:"rgba(255,255,255,0.7)" }}>{r.ed_deadline || "—"}</td>
                          <td className="px-3 py-1.5" style={{ color:"rgba(255,255,255,0.7)" }}>{r.ea_deadline || "—"}</td>
                          <td className="px-3 py-1.5" style={{ color:"rgba(255,255,255,0.7)" }}>{r.rd_deadline || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {caRows.length > 20 && <p className="text-center text-xs py-2" style={{ color:"rgba(255,255,255,0.4)" }}>Showing first 20 of {caRows.length}</p>}
                </div>

                {caLoading && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1" style={{ color:"rgba(255,255,255,0.65)" }}>
                      <span>Processing… {caProgress.done}/{caProgress.total}</span>
                      <span>✓ {caProgress.matched} matched · ⚠ {caProgress.skipped} not found</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor:"rgba(255,255,255,0.12)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width:`${(caProgress.done/caProgress.total)*100}%`, backgroundColor:"rgba(96,165,250,0.8)" }} />
                    </div>
                  </div>
                )}

                {caDone && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor:"rgba(52,211,153,0.15)", border:"1px solid rgba(52,211,153,0.3)" }}>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <p className="text-sm text-green-300">Done! {caProgress.matched} schools marked as Common App. {caProgress.skipped} not found in DB.</p>
                    </div>
                    {caNotFound.length > 0 && (
                      <div className="mt-2 p-3 rounded-xl" style={{ backgroundColor:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)" }}>
                        <p className="text-xs font-semibold text-red-300 mb-1">Not found in DB ({caNotFound.length}):</p>
                        <div className="max-h-48 overflow-y-auto">
                          {caNotFound.map((n, i) => <p key={i} className="text-xs text-red-300">• {n}</p>)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button onClick={runCaImport} disabled={caLoading}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ backgroundColor:"rgba(96,165,250,0.2)", color:"rgba(147,197,253,1)", border:"1px solid rgba(96,165,250,0.4)" }}>
                  {caLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Marking…</>
                    : <><CheckCircle className="w-4 h-4" /> Mark {caRows.length} Schools as Common App</>}
                </button>
              </>
            )}
          </Section>
        )}

        {/* ── INTERNATIONAL SCHOOL LIST TAB ───────────────────────────────── */}
        {tab === "intl" && (
          <Section title="International School List Import" icon={Globe}>
            <p className="text-xs mb-4" style={{ color:"rgba(255,255,255,0.6)" }}>
              Upload the international school list CSV (683 schools with detailed aid, cost, and acceptance data).
              Fields are <strong className="text-white">semicolon-delimited</strong> with European decimal format (0,41 = 0.41).
            </p>

            <div
              onClick={() => intlInput.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleIntlFile(e.dataTransfer.files[0]); }}
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer mb-4 hover:opacity-80 transition-all"
              style={{ borderColor:"rgba(96,165,250,0.3)", backgroundColor:"rgba(96,165,250,0.05)" }}
            >
              <FileText className="w-7 h-7 mx-auto mb-2" style={{ color:"rgba(96,165,250,0.7)" }} />
              <p className="text-sm font-medium text-white mb-1">{intlFilename || "Drop CSV here or click to browse"}</p>
              <p className="text-xs" style={{ color:"rgba(255,255,255,0.5)" }}>International school list (683 schools)</p>
              <input ref={intlInput} type="file" accept=".csv" className="hidden" onChange={e => handleIntlFile(e.target.files[0])} />
            </div>

            {intlRows.length > 0 && (
              <>
                <div className="rounded-xl overflow-hidden mb-4" style={{ border:"1px solid rgba(255,255,255,0.12)" }}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ backgroundColor:"rgba(255,255,255,0.08)" }}>
                        {["School","Region","Aid Type","Avg Aid","% w/ Aid","Overall Accept","Intl Accept"].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-medium" style={{ color:"rgba(255,255,255,0.6)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {intlRows.slice(0, 15).map((r, i) => (
                        <tr key={i} style={{ borderTop:"1px solid rgba(255,255,255,0.07)" }}>
                          <td className="px-3 py-1.5 text-white max-w-[150px] truncate">{r.name}</td>
                          <td className="px-3 py-1.5" style={{ color:"rgba(255,255,255,0.7)" }}>{r.region || "—"}</td>
                          <td className="px-3 py-1.5" style={{ color:"rgba(255,255,255,0.7)" }}>{r.aid_type || "—"}</td>
                          <td className="px-3 py-1.5" style={{ color:"rgba(255,255,255,0.7)" }}>{r.avg_aid_intl ? `$${r.avg_aid_intl}` : "—"}</td>
                          <td className="px-3 py-1.5" style={{ color:"rgba(255,255,255,0.7)" }}>{r.pct_intl_receiving_aid || "—"}%</td>
                          <td className="px-3 py-1.5" style={{ color:"rgba(255,255,255,0.7)" }}>{r.acceptance_rate ? `${Math.round(r.acceptance_rate*100)}%` : "—"}</td>
                          <td className="px-3 py-1.5" style={{ color:"rgba(255,255,255,0.7)" }}>{r.intl_acceptance_rate ? `${Math.round(r.intl_acceptance_rate*100)}%` : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {intlRows.length > 15 && <p className="text-center text-xs py-2" style={{ color:"rgba(255,255,255,0.4)" }}>Showing first 15 of {intlRows.length}</p>}
                </div>

                {intlLoading && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1" style={{ color:"rgba(255,255,255,0.65)" }}>
                      <span>Enriching… {intlProgress.done}/{intlProgress.total}</span>
                      <span>✓ {intlProgress.matched} matched · ⚠ {intlProgress.skipped} not found</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor:"rgba(255,255,255,0.12)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width:`${(intlProgress.done/intlProgress.total)*100}%`, backgroundColor:"rgba(96,165,250,0.8)" }} />
                    </div>
                  </div>
                )}

                {intlDone && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor:"rgba(52,211,153,0.15)", border:"1px solid rgba(52,211,153,0.3)" }}>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <p className="text-sm text-green-300">Done! {intlProgress.matched} schools enriched with international data. {intlProgress.skipped} not found.</p>
                    </div>
                    {intlNotFound.length > 0 && (
                      <div className="mt-2 p-3 rounded-xl" style={{ backgroundColor:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)" }}>
                        <p className="text-xs font-semibold text-red-300 mb-1">Not found in DB ({intlNotFound.length}):</p>
                        <div className="max-h-48 overflow-y-auto">
                          {intlNotFound.slice(0, 10).map((n, i) => <p key={i} className="text-xs text-red-300">• {n}</p>)}
                          {intlNotFound.length > 10 && <p className="text-xs text-red-300 mt-1">… and {intlNotFound.length - 10} more</p>}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button onClick={runIntlImport} disabled={intlLoading}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ backgroundColor:"rgba(96,165,250,0.2)", color:"rgba(147,197,253,1)", border:"1px solid rgba(96,165,250,0.4)" }}>
                  {intlLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Enriching…</>
                    : <><Globe className="w-4 h-4" /> Enrich {intlRows.length} Schools</>}
                </button>
              </>
            )}
          </Section>
        )}

        {/* ── RANKINGS TAB ───────────────────────────────────────────────────── */}
        {tab === "rankings" && (
          <Section title="US News 2026 Rankings Import" icon={Download}>
            <p className="text-xs mb-4" style={{ color:"rgba(255,255,255,0.6)" }}>
              Upload the US News National Universities or Liberal Arts Colleges CSV.
              Matching is done <strong className="text-white">by IPEDS ID first</strong>, then by name as fallback.
              Only the <strong className="text-white">2026 rank</strong> column is imported.
            </p>

            <div className="flex gap-2 mb-4">
              {[{ key:"national", label:"National Universities" }, { key:"lac", label:"Liberal Arts Colleges" }].map(t => (
                <button key={t.key} onClick={() => setRankType(t.key)}
                  className="px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={rankType === t.key
                    ? { backgroundColor:"rgba(251,191,36,0.25)", color:"rgba(252,211,77,1)", border:"1px solid rgba(251,191,36,0.5)" }
                    : { backgroundColor:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.65)", border:"1px solid rgba(255,255,255,0.15)" }
                  }>{t.label}</button>
              ))}
            </div>

            <div
              onClick={() => rankInput.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleRankFile(e.dataTransfer.files[0]); }}
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer mb-4 hover:opacity-80 transition-all"
              style={{ borderColor:"rgba(251,191,36,0.3)", backgroundColor:"rgba(251,191,36,0.05)" }}
            >
              <FileText className="w-7 h-7 mx-auto mb-2" style={{ color:"rgba(252,211,77,0.7)" }} />
              <p className="text-sm font-medium text-white mb-1">{rankFilename || "Drop US News CSV here or click to browse"}</p>
              <p className="text-xs" style={{ color:"rgba(255,255,255,0.5)" }}>CSV with IPEDS ID and 2026 column</p>
              <input ref={rankInput} type="file" accept=".csv" className="hidden" onChange={e => handleRankFile(e.target.files[0])} />
            </div>

            {rankRows.length > 0 && (
              <>
                <div className="rounded-xl overflow-hidden mb-4" style={{ border:"1px solid rgba(255,255,255,0.12)" }}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ backgroundColor:"rgba(255,255,255,0.08)" }}>
                        {["IPEDS ID","School Name","2026 Rank"].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-medium" style={{ color:"rgba(255,255,255,0.6)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rankRows.slice(0, 20).map((r, i) => (
                        <tr key={i} style={{ borderTop:"1px solid rgba(255,255,255,0.07)" }}>
                          <td className="px-3 py-1.5" style={{ color:"rgba(255,255,255,0.5)" }}>{r.ipeds}</td>
                          <td className="px-3 py-1.5 text-white max-w-[200px] truncate">{r.name}</td>
                          <td className="px-3 py-1.5 font-semibold" style={{ color:"rgba(252,211,77,1)" }}>#{r.rank}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {rankRows.length > 20 && <p className="text-center text-xs py-2" style={{ color:"rgba(255,255,255,0.4)" }}>Showing first 20 of {rankRows.length}</p>}
                </div>

                {rankLoading && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1" style={{ color:"rgba(255,255,255,0.65)" }}>
                      <span>Updating… {rankProgress.done}/{rankProgress.total}</span>
                      <span>✓ {rankProgress.matched} matched · ⚠ {rankProgress.skipped} not found</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor:"rgba(255,255,255,0.12)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width:`${(rankProgress.done/rankProgress.total)*100}%`, backgroundColor:"rgba(252,211,77,0.8)" }} />
                    </div>
                  </div>
                )}

                {rankDone && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor:"rgba(52,211,153,0.15)", border:"1px solid rgba(52,211,153,0.3)" }}>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <p className="text-sm text-green-300">Done! {rankProgress.matched} schools updated. {rankProgress.skipped} not found in DB.</p>
                    </div>
                    {rankNotFound.length > 0 && (
                      <div className="mt-2 p-3 rounded-xl" style={{ backgroundColor:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)" }}>
                        <p className="text-xs font-semibold text-red-300 mb-1">Not found in DB:</p>
                        {rankNotFound.map((n, i) => <p key={i} className="text-xs text-red-300">• {n}</p>)}
                      </div>
                    )}
                  </div>
                )}

                <button onClick={runRankImport} disabled={rankLoading}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ backgroundColor:"rgba(251,191,36,0.2)", color:"rgba(252,211,77,1)", border:"1px solid rgba(251,191,36,0.4)" }}>
                  {rankLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating rankings…</>
                    : <><Download className="w-4 h-4" /> Import {rankRows.length} Rankings</>}
                </button>
              </>
            )}
          </Section>
        )}

        {/* ── CACHE TAB ──────────────────────────────────────────────────────── */}
        {tab === "cache" && (
          <Section title="Fetch & Cache Scorecard Data (One-Time per School)" icon={RefreshCw}>
            <p className="text-xs mb-4" style={{ color:"rgba(255,255,255,0.6)" }}>
              This will search the Scorecard API <strong className="text-white">once per school</strong> in your database and save the data permanently.
              Future page loads won't need any API call — all data is stored in your backend.
              Schools already cached are skipped automatically.
            </p>

            <div className="rounded-xl p-4 mb-4" style={{ backgroundColor:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)" }}>
              <p className="text-xs font-semibold text-white mb-1">How it works</p>
              <ul className="text-xs space-y-1" style={{ color:"rgba(255,255,255,0.6)" }}>
                <li>1. Loads all schools in your database</li>
                <li>2. For each uncached school, calls Scorecard API by name (1 call per school)</li>
                <li>3. Saves enrollment, tuition, test scores, outcomes, demographics directly</li>
                <li>4. Marks school as <code className="text-purple-300">data_cached: true</code> — never fetched again</li>
              </ul>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <input id="fouryear2" type="checkbox" checked={onlyFourYear} onChange={e => setOnlyFourYear(e.target.checked)} />
              <label htmlFor="fouryear2" className="text-sm" style={{ color:"rgba(255,255,255,0.75)" }}>Only match 4-year institutions</label>
            </div>

            {cacheLog.length > 0 && (
              <div className="rounded-xl p-3 mb-4 max-h-48 overflow-y-auto" style={{ backgroundColor:"rgba(0,0,0,0.25)", border:"1px solid rgba(255,255,255,0.1)" }}>
                {cacheLog.map((line, i) => (
                  <p key={i} className="text-xs font-mono mb-0.5" style={{ color: line.startsWith("✓") ? "rgba(110,231,183,0.9)" : line.startsWith("✗") ? "rgba(239,68,68,0.9)" : "rgba(255,255,255,0.6)" }}>
                    {line}
                  </p>
                ))}
              </div>
            )}

            {cacheDone && (
              <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ backgroundColor:"rgba(52,211,153,0.15)", border:"1px solid rgba(52,211,153,0.3)" }}>
                <CheckCircle className="w-4 h-4 text-green-400" />
                <p className="text-sm text-green-300">Caching complete! All data is now stored in your backend.</p>
              </div>
            )}

            <button onClick={runFetchAndCache} disabled={cacheLoading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              style={{ backgroundColor:"rgba(255,255,255,0.88)", color:"#7a5a9d" }}>
              {cacheLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Caching… (check log above)</>
                : <><RefreshCw className="w-4 h-4" /> Start Fetch & Cache</>}
            </button>
          </Section>
        )}

        {/* ── API TAB ────────────────────────────────────────────────────────── */}
        {tab === "api" && (
          <>
            <Section title="Batch Fetch Settings" icon={Filter}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <p className="text-[11px] mb-1" style={{ color:"rgba(255,255,255,0.5)" }}>State</p>
                  <select value={filterState} onChange={e => setFilterState(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ backgroundColor:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", color:"white" }}>
                    <option value="all" style={{ background:"#7a5a9d" }}>All States</option>
                    {STATES.map(s => <option key={s} value={s} style={{ background:"#7a5a9d" }}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[11px] mb-1" style={{ color:"rgba(255,255,255,0.5)" }}>Per page</p>
                  <select value={perPage} onChange={e => setPerPage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ backgroundColor:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", color:"white" }}>
                    {[25,50,100].map(n => <option key={n} value={n} style={{ background:"#7a5a9d" }}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[11px] mb-1" style={{ color:"rgba(255,255,255,0.5)" }}>Page</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage(p => Math.max(0,p-1))} disabled={page===0} className="px-2 py-2 rounded-lg text-sm" style={{ backgroundColor:"rgba(255,255,255,0.12)", color:"white" }}>←</button>
                    <span className="text-sm text-white w-6 text-center">{page}</span>
                    <button onClick={() => setPage(p => p+1)} className="px-2 py-2 rounded-lg text-sm" style={{ backgroundColor:"rgba(255,255,255,0.12)", color:"white" }}>→</button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <input id="fouryear3" type="checkbox" checked={onlyFourYear} onChange={e => setOnlyFourYear(e.target.checked)} />
                <label htmlFor="fouryear3" className="text-sm" style={{ color:"rgba(255,255,255,0.75)" }}>Bachelor's & graduate-offering institutions only</label>
              </div>
              {total != null && <p className="text-xs mb-3" style={{ color:"rgba(255,255,255,0.5)" }}>{total.toLocaleString()} total matching</p>}
              {apiError && (
                <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ backgroundColor:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)" }}>
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <p className="text-sm text-red-300">{apiError}</p>
                </div>
              )}
              <button onClick={fetchFromScorecard} disabled={apiLoading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90"
                style={{ backgroundColor:"rgba(255,255,255,0.88)", color:"#7a5a9d" }}>
                {apiLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Fetching…</> : <><Download className="w-4 h-4" /> Fetch from Scorecard</>}
              </button>
            </Section>

            {apiResults.length > 0 && (
              <Section title={`${apiResults.length} schools ready to import`} icon={CheckCircle}>
                <button onClick={() => setShowPreview(v => !v)} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg mb-3"
                  style={{ backgroundColor:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.8)" }}>
                  {showPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {showPreview ? "Hide preview" : "Preview data"}
                </button>
                {showPreview && <PreviewTable rows={apiMapped} />}
                {apiImported > 0 && !apiImporting && (
                  <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ backgroundColor:"rgba(52,211,153,0.15)", border:"1px solid rgba(52,211,153,0.3)" }}>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <p className="text-sm text-green-300">Imported {apiImported} colleges!</p>
                  </div>
                )}
                <button onClick={importApi} disabled={apiImporting}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ backgroundColor:"rgba(110,231,183,0.2)", color:"rgba(110,231,183,1)", border:"1px solid rgba(110,231,183,0.3)" }}>
                  {apiImporting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing… ({apiImported}/{apiResults.length})</>
                    : <><CheckCircle className="w-4 h-4" /> Import {apiResults.length} Colleges</>}
                </button>
              </Section>
            )}
          </>
        )}

        {/* ── CSV TAB ────────────────────────────────────────────────────────── */}
        {tab === "csv" && (
          <Section title="Upload CSV" icon={Upload}>
            <div
              onClick={() => csvInput.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleCsvFile(e.dataTransfer.files[0]); }}
              className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer mb-4 hover:opacity-80"
              style={{ borderColor:"rgba(255,255,255,0.25)", backgroundColor:"rgba(255,255,255,0.05)" }}>
              <FileText className="w-8 h-8 mx-auto mb-3" style={{ color:"rgba(192,132,252,0.7)" }} />
              <p className="text-sm font-medium text-white mb-1">{csvFilename || "Drop CSV here"}</p>
              <input ref={csvInput} type="file" accept=".csv" className="hidden" onChange={e => handleCsvFile(e.target.files[0])} />
            </div>
            {csvRows.length > 0 && (
              <>
                <p className="text-sm text-white mb-3">{csvRows.length} rows parsed</p>
                {csvImported > 0 && (
                  <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ backgroundColor:"rgba(52,211,153,0.15)", border:"1px solid rgba(52,211,153,0.3)" }}>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <p className="text-sm text-green-300">Imported {csvImported} colleges!</p>
                  </div>
                )}
                <button onClick={async () => { setCsvImporting(true); await runBulkImport(csvRows, setCsvImported); setCsvImporting(false); }} disabled={csvImporting}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ backgroundColor:"rgba(110,231,183,0.2)", color:"rgba(110,231,183,1)", border:"1px solid rgba(110,231,183,0.3)" }}>
                  {csvImporting ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</> : <><Upload className="w-4 h-4" /> Import {csvRows.length}</>}
                </button>
              </>
            )}
          </Section>
        )}

        {/* Tips */}
        <div className="p-4 rounded-xl mt-2" style={{ backgroundColor:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)" }}>
          <p className="text-xs font-semibold mb-2 text-white">Workflow Recommendation</p>
          <ol className="text-xs space-y-1 list-decimal list-inside" style={{ color:"rgba(255,255,255,0.6)" }}>
            <li>Import schools via <strong className="text-white">Batch API</strong> (or CSV) to seed the database</li>
            <li>Use <strong className="text-white">Enrich from Files</strong> → upload your LilGrant masterfile to add intl aid data</li>
            <li>Upload <strong className="text-white">Common App Member List</strong> to flag which schools accept Common App</li>
            <li>Upload <strong className="text-white">International Admission Rates</strong> CSV for exact intl acceptance rates</li>
            <li>Use <strong className="text-white">Fetch & Cache</strong> to permanently store all Scorecard data (no more live API calls)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
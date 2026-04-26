/**
 * merge-all-international-data.js
 *
 * Merges THREE international data sources into colleges-2026-04-24.json
 * in priority order (highest priority wins on field conflicts):
 *
 *   Priority 1 (lowest)  — int-new_file.xlsx
 *   Priority 2 (highest) — Zero_EFC_-_int_data.xlsx
 *   Priority 3           — scholarship_urls.csv  (URLs only, additive)
 *
 * Run: node scripts/merge-all-international-data.js
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const DB_PATH        = path.resolve(__dirname, '../src/data/colleges-2026-04-24.json');
const INT_NEW_PATH   = path.resolve(__dirname, '../src/data/int-new_file.xlsx');
const ZERO_EFC_PATH  = path.resolve(__dirname, '../src/data/Zero_EFC_-_int_data.xlsx');
const URLS_PATH      = path.resolve(__dirname, '../src/data/scholarship_urls.csv');
const TODAY          = '2026-04-24';

// ─── Name Normalisation ───────────────────────────────────────────────────────

function norm(s) {
  if (!s) return '';
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** First 4 words longer than 3 chars — used as fuzzy key */
function sig4(normalized) {
  return normalized.split(' ').filter(w => w.length > 3).slice(0, 4).join(' ');
}

function buildLookup(colleges) {
  const exact = new Map();  // normalised name → college
  const sig4m  = new Map();  // 4-word key     → college
  for (const c of colleges) {
    const n = norm(c.name);
    if (!n) continue;
    exact.set(n, c);
    const s = sig4(n);
    if (s && !sig4m.has(s)) sig4m.set(s, c);
  }
  return { exact, sig4m };
}

function findMatch(sourceName, lookup) {
  if (!sourceName) return null;
  const sn = norm(sourceName);

  // 1. Exact normalised match
  if (lookup.exact.has(sn)) return lookup.exact.get(sn);

  // 2. Containment match (either direction)
  for (const [jn, c] of lookup.exact) {
    if (jn.includes(sn) || sn.includes(jn)) return c;
  }

  // 3. First-4-significant-words match
  const s = sig4(sn);
  if (s && lookup.sig4m.has(s)) return lookup.sig4m.get(s);

  return null;
}

// ─── Field Parsers ────────────────────────────────────────────────────────────

/** Dollar amount: strip $ and commas, return float or null */
function parseDollar(v) {
  if (v == null || String(v).trim() === '' || String(v).trim() === 'No data') return null;
  const n = parseFloat(String(v).replace(/[$,\s]/g, ''));
  return isNaN(n) || n === 0 ? null : n;
}

/**
 * Percentage: normalise to 0–1 decimal.
 * Values already ≤ 1 are kept as-is; values > 1 are divided by 100.
 * Database standard: 0.93 = 93%.
 */
function parsePct(v) {
  if (v == null || String(v).trim() === '' || String(v).trim() === 'No data') return null;
  const n = parseFloat(String(v).replace(/[%,\s]/g, ''));
  if (isNaN(n)) return null;
  return n > 1 ? n / 100 : n;
}

/** Generic scalar: null if empty or 'No data' */
function parseVal(v) {
  if (v == null) return null;
  const s = String(v).trim();
  return (s === '' || s === 'No data') ? null : s;
}

// ─── XLSX helpers ─────────────────────────────────────────────────────────────

/** Returns an array-of-arrays. Row 0 is the header row. */
function readXLSX(filePath) {
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
}

// ─── Row Mappers ──────────────────────────────────────────────────────────────

function mapIntNew(row) {
  return {
    intl_aid_type:              parseVal(row[1]),
    intl_students_with_aid:     parseVal(row[2]),
    pct_intl_receiving_aid:     parsePct(row[3]),
    avg_aid_intl:               parseDollar(row[4]),
    avg_coa_after_aid:          parseDollar(row[5]),
    data_source:                parseVal(row[6]),
    total_aid_millions:         parseDollar(row[7]),
    meets_full_need:            parseVal(row[8]),
    largest_merit_scholarship:  parseDollar(row[9]),
    scholarship_name_info:      parseVal(row[10]),
    how_to_apply_aid:           parseVal(row[11]),
    intl_notes:                 parseVal(row[12]),
    ea_offered:                 parseVal(row[13]),
    budget_category:            parseVal(row[14]),
    meets_5k_efc:               parseVal(row[15]),
  };
}

function mapZeroEFC(row) {
  return {
    budget_category:                   parseVal(row[1]),
    tuition_without_aid:               parseDollar(row[2]),
    room_board:                        parseDollar(row[3]),
    total_coa:                         parseDollar(row[4]),
    coa_data_year:                     parseVal(row[5]),
    intl_aid_type:                     parseVal(row[6]),
    intl_students_with_aid:            parseVal(row[7]),
    pct_intl_receiving_aid:            parsePct(row[8]),
    avg_aid_intl:                      parseDollar(row[9]),
    avg_coa_after_aid:                 parseDollar(row[10]),
    data_source:                       parseVal(row[11]),
    total_aid_millions:                parseDollar(row[12]),
    meets_full_need:                   parseVal(row[13]),
    largest_merit_scholarship:         parseDollar(row[14]),
    // row[15] intentionally skipped (empty name/info column)
    tuition_after_scholarship:         parseDollar(row[16]),
    total_coa_after_scholarship:       parseDollar(row[17]),
    scholarship_name:                  parseVal(row[18]),
    how_to_apply_aid:                  parseVal(row[19]),
    intl_notes:                        parseVal(row[20]),
    aid_application_award_rate:        parsePct(row[21]),
    pct_need_fully_met_firstyear:      parsePct(row[22]),
    avg_pct_need_met:                  parsePct(row[23]),
    acceptance_rate_reported:          parsePct(row[24]),
    intl_acceptance_rate:              parsePct(row[25]),
    admission_rate_year:               parseVal(row[26]),
    yield_rate:                        parsePct(row[27]),
    intl_yield:                        parsePct(row[28]),
    intl_applications_2027:            parseVal(row[29]),
    intl_admitted_2027:                parseVal(row[30]),
    intl_enrolled_2027:                parseVal(row[31]),
    intl_admission_data_source:        parseVal(row[32]),
    acceptance_rate_source:            parseVal(row[33]),
    countries_represented:             parseVal(row[34]),
    rd_acceptance_rate:                parsePct(row[35]),
    rd_acceptance_rate_year:           parseVal(row[36]),
    early_plan_offered:                parseVal(row[37]),
    ed2_offered:                       parseVal(row[38]),
  };
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────

/** Minimal RFC-4180-aware CSV parser. Returns array of arrays (row 0 = headers). */
function parseCSV(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  return lines
    .filter(l => l.trim())
    .map(line => {
      const cols = [];
      let cur = '', inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
          else inQ = !inQ;
        } else if (ch === ',' && !inQ) {
          cols.push(cur.trim()); cur = '';
        } else {
          cur += ch;
        }
      }
      cols.push(cur.trim());
      return cols;
    });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

// Load database
const rawDB = fs.readFileSync(DB_PATH, 'utf-8').replace(/^\uFEFF/, '');
const colleges = JSON.parse(rawDB);
const lookup   = buildLookup(colleges);

const zeroEFCSet = new Set();  // college object references matched by Source 2
const intNewSet  = new Set();  // college object references matched by Source 1

// ══════════════════════════════════════════════════════════════════════════════
// SOURCE 1 — int-new_file.xlsx (lowest priority)
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n=== SOURCE 1: int-new_file.xlsx ===');

if (!fs.existsSync(INT_NEW_PATH)) {
  console.log('⚠️  File not found — skipping. Place int-new_file.xlsx in src/data/ and re-run.');
} else {
  const rows1    = readXLSX(INT_NEW_PATH);
  const dataRows = rows1.slice(1).filter(r => r[0] != null);
  const total1   = dataRows.length;
  const unmatched1 = [];

  for (const row of dataRows) {
    const name    = String(row[0]).trim();
    const college = findMatch(name, lookup);
    if (!college) { unmatched1.push(name); continue; }

    const updates = mapIntNew(row);
    for (const [k, v] of Object.entries(updates)) {
      if (v !== null) college[k] = v;
    }
    intNewSet.add(college);
  }

  const matched1 = total1 - unmatched1.length;
  console.log(`Matched: ${matched1}/${total1} | Unmatched: ${unmatched1.length}`);
  if (unmatched1.length) {
    console.log('=== UNMATCHED (int-new) ===');
    unmatched1.forEach(n => console.log(`- ${n}`));
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SOURCE 2 — Zero_EFC_-_int_data.xlsx (highest priority — overwrites Source 1)
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n=== SOURCE 2: Zero_EFC_-_int_data.xlsx ===');

if (!fs.existsSync(ZERO_EFC_PATH)) {
  console.log('⚠️  File not found — skipping. Place Zero_EFC_-_int_data.xlsx in src/data/ and re-run.');
} else {
  const rows2    = readXLSX(ZERO_EFC_PATH);
  const dataRows = rows2.slice(1).filter(r => r[0] != null);
  const total2   = dataRows.length;
  const unmatched2 = [];

  for (const row of dataRows) {
    const name    = String(row[0]).trim();
    const college = findMatch(name, lookup);
    if (!college) { unmatched2.push(name); continue; }

    const updates = mapZeroEFC(row);
    // Zero EFC always wins on conflict — overwrite even if Source 1 set the field
    for (const [k, v] of Object.entries(updates)) {
      if (v !== null) college[k] = v;
    }
    zeroEFCSet.add(college);
  }

  const matched2 = total2 - unmatched2.length;
  console.log(`Matched: ${matched2}/${total2} | Unmatched: ${unmatched2.length}`);
  if (unmatched2.length) {
    console.log('=== UNMATCHED (Zero EFC) ===');
    unmatched2.forEach(n => console.log(`- ${n}`));
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SOURCE 3 — scholarship_urls.csv (additive — adds URL fields only)
// ══════════════════════════════════════════════════════════════════════════════
console.log('\n=== SOURCE 3: scholarship_urls.csv ===');

let urlsAdded = 0;

if (!fs.existsSync(URLS_PATH)) {
  console.log('⚠️  File not found — skipping.');
} else {
  const csvText = fs.readFileSync(URLS_PATH, 'utf-8');
  const csvRows = parseCSV(csvText);

  // Row 0 is header: school, scholarship_name, scholarship_url
  for (let i = 1; i < csvRows.length; i++) {
    const [school, scholarshipName, scholarshipUrl] = csvRows[i];
    if (!scholarshipUrl || !scholarshipUrl.startsWith('http')) continue;

    const college = findMatch(school, lookup);
    if (!college) continue;

    college.scholarship_url          = scholarshipUrl;
    college.scholarship_display_name = scholarshipName || null;
    urlsAdded++;
  }

  console.log(`URLs added: ${urlsAdded}`);
}

// ══════════════════════════════════════════════════════════════════════════════
// MARK DATA FRESHNESS
// ══════════════════════════════════════════════════════════════════════════════
for (const c of colleges) {
  if (zeroEFCSet.has(c)) {
    c.intl_data_tier    = 'zero_efc';
    c.intl_data_updated = TODAY;
  } else if (intNewSet.has(c)) {
    c.intl_data_tier    = 'standard';
    c.intl_data_updated = TODAY;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SAVE
// ══════════════════════════════════════════════════════════════════════════════
fs.writeFileSync(DB_PATH, JSON.stringify(colleges, null, 2), 'utf-8');

// ══════════════════════════════════════════════════════════════════════════════
// FINAL SUMMARY
// ══════════════════════════════════════════════════════════════════════════════
const standardCount = [...colleges].filter(
  c => c.intl_data_tier === 'standard'
).length;

console.log('\n=== FINAL SUMMARY ===');
console.log(`zero_efc tier:    ${zeroEFCSet.size} schools (richest data)`);
console.log(`standard tier:    ${standardCount} schools`);
console.log(`Total enriched:   ${zeroEFCSet.size + standardCount}/${colleges.length}`);
console.log('\n✅ Database written to', path.relative(process.cwd(), DB_PATH), '\n');

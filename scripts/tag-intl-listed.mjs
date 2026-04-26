/**
 * tag-intl-listed.mjs
 *
 * Adds  is_intl_listed: true/false  to every college in colleges-2026-04-24.json.
 * "true" means the school appeared in international_school_list_final.csv.
 *
 * Uses the same name-normalisation + IPEDS-override logic as merge-international-data.js
 * so the matched set is consistent.
 *
 * Run: node scripts/tag-intl-listed.mjs
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root      = path.resolve(__dirname, '..');

const INTL_CSV     = path.join(root, 'src/data/international_school_list_final.csv');
const OVERRIDE_CSV = path.join(root, 'src/data/int file - matching school name with correct id.csv');
const JSON_PATH    = path.join(root, 'src/data/colleges-2026-04-24.json');

// ── CSV parser ──────────────────────────────────────────────────────────────

function parseCsv(text) {
  const lines   = text.trim().split('\n');
  const headers = splitLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = splitLine(line);
    const row  = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ''; });
    return row;
  });
}

function splitLine(line) {
  const cols = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQ = !inQ; }
    } else if (ch === ',' && !inQ) { cols.push(cur); cur = ''; }
    else { cur += ch; }
  }
  cols.push(cur);
  return cols;
}

// ── Name normalisation (mirrors merge-international-data.js) ────────────────

function norm(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[.\u0027\u2018\u2019\u02BC]/g, '')
    .replace(/,.*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const NAME_ALIASES = {
  'manhattan college':           'manhattan university',
  'st marys university texas':   'st marys university',
  'st marys university (texas)': 'st marys university',
};

function variants(s) {
  const b     = norm(s);
  const alias = NAME_ALIASES[b];

  const stripSuffix = v => {
    let r = v.replace(/-(?:main|florham|metropolitan|lake|chillicothe|zanesville|eastern)?\s*campus$/i, '');
    r = r.replace(/-[a-z][a-z ]+$/, '');
    return r.trim();
  };

  const noSep        = b.replace(/ - /g, ' ');
  const noParens     = b.replace(/\s*\([^)]*\)\s*$/g, '').trim();
  const parensWords  = b.replace(/\(([^)]+)\)/g, '$1').replace(/\s+/g, ' ').trim();
  const noStateCode  = b.replace(/ [a-z]{2}$/, '').trim();
  const noThe        = b.startsWith('the ') ? b.slice(4) : b;

  const all = new Set([
    b, alias, noThe, noSep, norm(noSep),
    stripSuffix(b), stripSuffix(noSep),
    noParens, parensWords, noStateCode,
    b.replace(/-/g, ' '), noThe.replace(/-/g, ' '),
    b.replace(/&/g, 'and'), noThe.replace(/&/g, 'and'),
    b.replace(/&/g, ''),
    b.replace(/\band\b/g, '&'), noThe.replace(/\band\b/g, '&'),
    b.replace(/ at /g, ' '), noThe.replace(/ at /g, ' '),
    b.replace(/\bsaint\b/g, 'st'), b.replace(/\bst\b/g, 'saint'),
    b.replace(/\bmt\b/g, 'mount'), b.replace(/\bmount\b/g, 'mt'),
    b.replace(/ and conservatory$/, ''),
    b.replace(/ at \w[\w ]*$/, ''),
    b.replace(/a&t/, 'a & t state university'), b.replace(/a&t/, 'a & t'),
    b.replace(/ - .+$/, '').trim(), noSep.replace(/ - .+$/, '').trim(),
  ]);

  const cleaned = new Set();
  for (const v of all) { if (v) cleaned.add(v.replace(/\s+/g, ' ').trim()); }
  return cleaned;
}

function extractIpeds(url) {
  if (!url) return null;
  const m = url.match(/[?&](\d+)-/);
  return m ? m[1] : null;
}

// ── Load data ───────────────────────────────────────────────────────────────

const intlRows  = parseCsv(fs.readFileSync(INTL_CSV, 'utf-8'));
const overrides = parseCsv(fs.readFileSync(OVERRIDE_CSV, 'utf-8'));
const colleges  = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));

console.log(`${intlRows.length} rows in international CSV`);
console.log(`${colleges.length} colleges in JSON`);

// ── Build lookup maps ────────────────────────────────────────────────────────

const byNorm  = new Map();
for (const c of colleges) {
  for (const v of variants(c.name)) {
    if (!byNorm.has(v)) byNorm.set(v, c);
  }
}

const byIpeds = new Map();
for (const c of colleges) {
  if (c.scorecard_id) byIpeds.set(String(c.scorecard_id), c);
}

const ipedsForName = new Map();
for (const row of overrides) {
  const csvName = (row['Unmatch name - Int file'] || '').trim();
  const url     = (row['Scorecard link (For you to extract the ID)'] || '').trim();
  const ipeds   = extractIpeds(url);
  if (csvName && ipeds) ipedsForName.set(norm(csvName), ipeds);
}

console.log(`${ipedsForName.size} IPEDS overrides loaded`);

// ── Match and collect a Set of matched college IDs ──────────────────────────

const matchedIds = new Set();
const unmatched  = [];

for (const row of intlRows) {
  const csvName = (row['School Name'] || '').trim();
  if (!csvName) continue;

  let college = null;

  // Tier 1: variant name match
  for (const v of variants(csvName)) {
    if (byNorm.has(v)) { college = byNorm.get(v); break; }
  }

  // Tier 2: IPEDS override
  if (!college) {
    const n     = norm(csvName);
    const ipeds = ipedsForName.get(n);
    if (ipeds) college = byIpeds.get(ipeds) ?? null;
  }

  if (college) {
    matchedIds.add(college.id);
  } else {
    unmatched.push(csvName);
  }
}

console.log(`\nMatched : ${matchedIds.size}/${intlRows.length}`);
if (unmatched.length) {
  console.log(`Unmatched (${unmatched.length}): ${unmatched.join(', ')}`);
}

// ── Tag every college ────────────────────────────────────────────────────────

let tagged = 0;
for (const c of colleges) {
  c.is_intl_listed = matchedIds.has(c.id);
  if (c.is_intl_listed) tagged++;
}

console.log(`\nTagged ${tagged} colleges as is_intl_listed: true`);

// ── Write output ─────────────────────────────────────────────────────────────

fs.writeFileSync(JSON_PATH, JSON.stringify(colleges, null, 2));
console.log('colleges-2026-04-24.json updated.');

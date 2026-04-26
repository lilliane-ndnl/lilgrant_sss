/**
 * fetch-enrichment-fields.js
 *
 * Fetches additional fields from the College Scorecard API for every school
 * in colleges-2026-04-24.json that has a scorecard_id, using batches of 50.
 *
 * Run: node scripts/fetch-enrichment-fields.js
 */

import https from 'https';
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_PATH = path.resolve(__dirname, '../src/data/colleges-2026-04-24.json');
const API_KEY   = '2tNX6yRH58baD6mpdXyEu1mcxEaVOFQTEtKRrX4n';
const BATCH     = 50;
const DELAY_MS  = 200;

const FIELDS = [
  'id',
  'school.name',
  'school.student_faculty_ratio',
  'school.ft_faculty_rate',
  'school.carnegie_basic',
  'school.minority_serving.historically_black',
  'school.minority_serving.tribal',
  'school.minority_serving.hispanic',
  'school.minority_serving.asian_pacific_islander',
  'school.religious_affiliation',
  'latest.student.demographics.global_pct',
  'latest.student.share_firstgeneration',
  'latest.cost.roomboard.oncampus',
  'latest.cost.booksupply',
  'latest.cost.otherexpense.oncampus',
  'latest.aid.federal_loan_rate',
  'latest.student.demographics.race_ethnicity.non_resident_alien',
  'latest.student.part_time_share',
].join(',');

// ── HTTP helper ───────────────────────────────────────────────────────────────

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error: ' + e.message)); }
      });
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Field mapping ─────────────────────────────────────────────────────────────

function applyResult(college, r) {
  const set = (key, val) => {
    if (val != null) college[key] = val;
  };

  set('student_faculty_ratio',        r['school.student_faculty_ratio']);
  set('ft_faculty_rate',              r['school.ft_faculty_rate']);
  set('carnegie_basic',               r['school.carnegie_basic']);
  set('religious_affiliation',        r['school.religious_affiliation']);

  // Minority-serving flags (1 = true)
  if (r['school.minority_serving.historically_black']    != null) college.is_hbcu             = r['school.minority_serving.historically_black']    === 1;
  if (r['school.minority_serving.tribal']                != null) college.is_tribal            = r['school.minority_serving.tribal']                === 1;
  if (r['school.minority_serving.hispanic']              != null) college.is_hispanic_serving  = r['school.minority_serving.hispanic']              === 1;
  if (r['school.minority_serving.asian_pacific_islander']!= null) college.is_aapi_serving      = r['school.minority_serving.asian_pacific_islander']!== 0;

  set('pct_intl_students_scorecard',  r['latest.student.demographics.global_pct']);
  set('pct_non_resident_alien',       r['latest.student.demographics.race_ethnicity.non_resident_alien']);
  set('pct_first_generation',         r['latest.student.share_firstgeneration']);
  set('room_board_oncampus',          r['latest.cost.roomboard.oncampus']);
  set('books_supplies_cost',          r['latest.cost.booksupply']);
  set('other_expenses_oncampus',      r['latest.cost.otherexpense.oncampus']);
  set('federal_loan_rate',            r['latest.aid.federal_loan_rate']);
  set('pct_part_time',                r['latest.student.part_time_share']);
}

// ── Main ──────────────────────────────────────────────────────────────────────

const colleges  = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
const withId    = colleges.filter(c => c.scorecard_id);
const byId      = new Map(withId.map(c => [String(c.scorecard_id), c]));

console.log(`Loaded ${colleges.length} colleges — ${withId.length} have scorecard_id`);

const ids       = withId.map(c => String(c.scorecard_id));
const batches   = [];
for (let i = 0; i < ids.length; i += BATCH) batches.push(ids.slice(i, i + BATCH));

console.log(`Fetching ${batches.length} batches of up to ${BATCH} schools each…\n`);

let totalUpdated = 0;

for (let b = 0; b < batches.length; b++) {
  const batch    = batches[b];
  const batchNum = b + 1;
  const start    = b * BATCH + 1;
  const end      = Math.min(start + BATCH - 1, withId.length);

  console.log(`Fetching batch ${batchNum}/${batches.length} (schools ${start}–${end})…`);

  const url = `https://api.data.gov/ed/collegescorecard/v1/schools?id=${batch.join(',')}&api_key=${API_KEY}&fields=${FIELDS}&per_page=${BATCH}`;

  let results;
  try {
    const json = await get(url);
    results = json.results || [];
  } catch (err) {
    console.warn(`  ⚠ Batch ${batchNum} failed: ${err.message} — skipping`);
    await sleep(DELAY_MS);
    continue;
  }

  for (const r of results) {
    const college = byId.get(String(r.id));
    if (!college) continue;
    applyResult(college, r);
    totalUpdated++;
  }

  if (batchNum % 10 === 0) {
    console.log(`  Progress: ${end}/${withId.length} schools processed`);
  }

  await sleep(DELAY_MS);
}

console.log(`\nWriting updated JSON…`);
fs.writeFileSync(JSON_PATH, JSON.stringify(colleges, null, 2));
console.log(`Done! Updated ${totalUpdated} schools. Total: ${colleges.length}`);

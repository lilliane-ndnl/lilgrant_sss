import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '../src/data/colleges-2026-04-24.json');
const API_KEY   = '2tNX6yRH58baD6mpdXyEu1mcxEaVOFQTEtKRrX4n';

const MISSING = [
  // NU
  { name: 'University of Virginia',                         ipeds: 234076 },
  { name: 'Ohio State University-Columbus',                 ipeds: 204796 },
  { name: 'College of William and Mary',                    ipeds: 231624 },
  { name: 'University of Minnesota',                        ipeds: 174066 },
  { name: 'Pennsylvania State University-University Park',  ipeds: 214777 },
  { name: 'Tulane University',                              ipeds: 160755 },
  { name: 'University of Pittsburgh',                       ipeds: 215293 },
  { name: 'University of Buffalo',                          ipeds: 196088 },
  { name: 'University of Oklahoma',                         ipeds: 207500 },
  { name: 'Arizona State University-Tempe',                 ipeds: 104151 },
  { name: 'Iowa State University of Science and Technology',ipeds: 153603 },
  { name: 'University of South Carolina',                   ipeds: 218663 },
  // LAC
  { name: 'Sewanee: The University of the South',           ipeds: 220613 },
  { name: 'Hobart and William Smith Colleges',              ipeds: 191630 },
  { name: "St. John's University",                          ipeds: 174091 },
  { name: 'Linfield University',                            ipeds: 209825 },
  { name: 'Houghton University',                            ipeds: 191515 },
  { name: 'University of Puerto Rico in Cayey',             ipeds: 243744 },
  { name: 'Ave Maria University',                           ipeds: 433660 },
  { name: 'Medgar Evers College-CUNY',                      ipeds: 193654 },
  { name: 'Pennsylvania State University at Brandywine',    ipeds: 214713 },
];

const FIELDS = [
  'id',
  'school.name',
  'school.city',
  'school.state',
  'school.control',
  'school.locale',
  'school.carnegie_basic',
  'school.carnegie_size_setting',
  'school.predominant_degree',
  'school.school_url',
  'latest.student.size',
  'latest.student.grad_students',
  'latest.admissions.admission_rate.overall',
  'latest.admissions.sat_scores.25th_percentile.critical_reading',
  'latest.admissions.sat_scores.75th_percentile.critical_reading',
  'latest.admissions.sat_scores.25th_percentile.math',
  'latest.admissions.sat_scores.75th_percentile.math',
  'latest.admissions.act_scores.25th_percentile.cumulative',
  'latest.admissions.act_scores.75th_percentile.cumulative',
  'latest.cost.tuition.in_state',
  'latest.cost.tuition.out_of_state',
  'latest.cost.avg_net_price.public',
  'latest.cost.avg_net_price.private',
  'latest.aid.median_debt.completers.overall',
  'latest.aid.students_with_pell_grant',
  'latest.completion.rate_suppressed.overall',
  'latest.earnings.10_yrs_after_entry.median',
  'latest.earnings.6_yrs_after_entry.median',
  'latest.repayment.3_yr_repayment.overall',
  'latest.student.retention_rate.four_year.full_time',
  'latest.student.demographics.race_ethnicity.white',
  'latest.student.demographics.race_ethnicity.black',
  'latest.student.demographics.race_ethnicity.hispanic',
  'latest.student.demographics.race_ethnicity.asian',
  'latest.student.demographics.men',
  'latest.student.demographics.women',
].join(',');

const CONTROL_MAP = { 1: 'Public', 2: 'Private nonprofit', 3: 'Private for-profit' };
const DEGREE_MAP  = { 1: 'Certificate', 2: "Associate's", 3: "Bachelor's", 4: "Master's", 5: 'Doctoral' };

function slug(name, ipeds) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + ipeds;
}

function mapSchool(s, ipeds) {
  const undergrad = s['latest.student.size']          ?? null;
  const grad      = s['latest.student.grad_students'] ?? null;
  const total     = (undergrad != null && grad != null) ? undergrad + grad
                  : (undergrad ?? grad ?? null);

  return {
    id:                    slug(s['school.name'] || String(ipeds), ipeds),
    scorecard_id:          ipeds,
    name:                  s['school.name']                                          ?? null,
    city:                  s['school.city']                                          ?? null,
    state:                 s['school.state']                                         ?? null,
    control_type:          CONTROL_MAP[s['school.control']]                          ?? null,
    undergrad_enrollment:  undergrad,
    grad_enrollment:       grad,
    total_enrollment:      total,
    acceptance_rate:       s['latest.admissions.admission_rate.overall']             ?? null,
    sat_reading_25:        s['latest.admissions.sat_scores.25th_percentile.critical_reading'] ?? null,
    sat_reading_75:        s['latest.admissions.sat_scores.75th_percentile.critical_reading'] ?? null,
    sat_math_25:           s['latest.admissions.sat_scores.25th_percentile.math']    ?? null,
    sat_math_75:           s['latest.admissions.sat_scores.75th_percentile.math']    ?? null,
    act_25:                s['latest.admissions.act_scores.25th_percentile.cumulative'] ?? null,
    act_75:                s['latest.admissions.act_scores.75th_percentile.cumulative'] ?? null,
    tuition_in_state:      s['latest.cost.tuition.in_state']                         ?? null,
    tuition_out_of_state:  s['latest.cost.tuition.out_of_state']                     ?? null,
    avg_annual_cost:       s['latest.cost.avg_net_price.public'] ?? s['latest.cost.avg_net_price.private'] ?? null,
    median_debt_graduation:s['latest.aid.median_debt.completers.overall']            ?? null,
    pct_receiving_pell:    s['latest.aid.students_with_pell_grant']                  ?? null,
    graduation_rate:       s['latest.completion.rate_suppressed.overall']            ?? null,
    median_earnings_10yr:  s['latest.earnings.10_yrs_after_entry.median']            ?? null,
    median_earnings_6yr:   s['latest.earnings.6_yrs_after_entry.median']             ?? null,
    loan_repayment_rate:   s['latest.repayment.3_yr_repayment.overall']              ?? null,
    retention_rate:        s['latest.student.retention_rate.four_year.full_time']    ?? null,
    pct_white:             s['latest.student.demographics.race_ethnicity.white']     ?? null,
    pct_black:             s['latest.student.demographics.race_ethnicity.black']     ?? null,
    pct_hispanic:          s['latest.student.demographics.race_ethnicity.hispanic']  ?? null,
    pct_asian:             s['latest.student.demographics.race_ethnicity.asian']     ?? null,
    pct_women:             s['latest.student.demographics.women']                    ?? null,
    website_url:           s['school.school_url']                                    ?? null,
    predominant_degree:    DEGREE_MAP[s['school.predominant_degree']]                ?? null,
    us_news_rank:          null,
    wiki_image_url:        null,
    image_url:             null,
    description:           null,
    uses_common_app:       null,
    testing_policy:        null,
    ed_deadline:           null,
    ea_deadline:           null,
    rd_deadline:           null,
    intl_acceptance_rate:  null,
    avg_aid_intl:          null,
    pct_intl_students:     null,
    aid_type:              null,
    created_date:          new Date().toISOString(),
    updated_date:          new Date().toISOString(),
  };
}

const colleges = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
const added = [];

for (const { name, ipeds } of MISSING) {
  const url = `https://api.data.gov/ed/collegescorecard/v1/schools?id=${ipeds}&api_key=${API_KEY}&fields=${FIELDS}`;
  try {
    const res  = await fetch(url);
    const json = await res.json();
    const results = json?.results;
    if (!results?.length) {
      console.warn(`  ⚠ No results for ${name} (${ipeds})`);
      continue;
    }
    const record = mapSchool(results[0], ipeds);
    added.push(record);
    console.log(`  ✓ Fetched: ${record.name} (${ipeds})`);
  } catch (err) {
    console.error(`  ✗ Error fetching ${name} (${ipeds}):`, err.message);
  }
}

const updated = [...colleges, ...added];
writeFileSync(DATA_PATH, JSON.stringify(updated, null, 2), 'utf8');

console.log(`\nDone. Added ${added.length} schools. Total now: ${updated.length}`);

import https from 'https';
import fs from 'fs';

const API_KEY = '2tNX6yRH58baD6mpdXyEu1mcxEaVOFQTEtKRrX4n';
const missing = [
  { name: "Southern Utah University",    ipeds: "230603" },
  { name: "St. Mary's University (Texas)", ipeds: "228149" },
  { name: "The College of Saint Rose",   ipeds: "190716" },
  { name: "Utah State University",       ipeds: "230728" },
];

const FIELDS = [
  'id','school.name','school.city','school.state','school.control','school.school_url',
  'school.degrees_awarded.predominant','latest.student.size',
  'latest.admissions.admission_rate.overall',
  'latest.admissions.sat_scores.25th_percentile.critical_reading',
  'latest.admissions.sat_scores.75th_percentile.critical_reading',
  'latest.admissions.sat_scores.25th_percentile.math',
  'latest.admissions.sat_scores.75th_percentile.math',
  'latest.admissions.act_scores.25th_percentile.cumulative',
  'latest.admissions.act_scores.75th_percentile.cumulative',
  'latest.cost.tuition.in_state','latest.cost.tuition.out_of_state',
  'latest.cost.avg_net_price.public','latest.cost.avg_net_price.private',
  'latest.completion.rate_suppressed.overall',
  'latest.earnings.10_yrs_after_entry.median',
  'latest.student.retention_rate.four_year.full_time',
].join(',');

function fetchSchool(ipeds) {
  const url = `https://api.data.gov/ed/collegescorecard/v1/schools?id=${ipeds}&api_key=${API_KEY}&fields=${FIELDS}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data).results?.[0] || null); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

const JSON_PATH = 'src/data/colleges-2026-04-24.json';
const colleges  = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));

for (const school of missing) {
  const r = await fetchSchool(school.ipeds);
  if (!r) { console.log('NOT FOUND:', school.name); continue; }

  const record = {
    id:                   school.ipeds + '_scorecard',
    scorecard_id:         parseInt(school.ipeds),
    name:                 r['school.name'],
    city:                 r['school.city'],
    state:                r['school.state'],
    control_type:         ['', 'Public', 'Private nonprofit', 'Private for-profit'][r['school.control']] || null,
    website_url:          r['school.school_url'],
    undergrad_enrollment: r['latest.student.size'],
    acceptance_rate:      r['latest.admissions.admission_rate.overall'],
    sat_reading_25:       r['latest.admissions.sat_scores.25th_percentile.critical_reading'],
    sat_reading_75:       r['latest.admissions.sat_scores.75th_percentile.critical_reading'],
    sat_math_25:          r['latest.admissions.sat_scores.25th_percentile.math'],
    sat_math_75:          r['latest.admissions.sat_scores.75th_percentile.math'],
    act_25:               r['latest.admissions.act_scores.25th_percentile.cumulative'],
    act_75:               r['latest.admissions.act_scores.75th_percentile.cumulative'],
    tuition_in_state:     r['latest.cost.tuition.in_state'],
    tuition_out_of_state: r['latest.cost.tuition.out_of_state'],
    avg_annual_cost:      r['latest.cost.avg_net_price.public'] || r['latest.cost.avg_net_price.private'],
    graduation_rate:      r['latest.completion.rate_suppressed.overall'],
    median_earnings_10yr: r['latest.earnings.10_yrs_after_entry.median'],
    retention_rate:       r['latest.student.retention_rate.four_year.full_time'],
    us_news_rank:         null,
    image_url:            null,
    description:          null,
    created_date:         new Date().toISOString(),
    updated_date:         new Date().toISOString(),
  };

  colleges.push(record);
  console.log('Added:', record.name);
}

fs.writeFileSync(JSON_PATH, JSON.stringify(colleges, null, 2), 'utf-8');
console.log('Done! Total schools:', colleges.length);

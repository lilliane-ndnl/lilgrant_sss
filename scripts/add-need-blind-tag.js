import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_PATH  = path.join(__dirname, '../src/data/colleges-2026-04-24.json');

const NEED_BLIND_INTL = [
  { name: 'Harvard University',       ipeds: 166027 },
  { name: 'Princeton University',     ipeds: 186131 },
  { name: 'Yale University',          ipeds: 130794 },
  { name: 'MIT',                      ipeds: 166683 },
  { name: 'Dartmouth College',        ipeds: 182670 },
  { name: 'Amherst College',          ipeds: 164465 },
  { name: 'Bowdoin College',          ipeds: 161004 },
  { name: 'Georgetown University',    ipeds: 163286 },
  { name: 'University of Notre Dame', ipeds: 152080 },
  { name: 'Brown University',         ipeds: 217156 },
  { name: 'Grinnell College',         ipeds: 153384 },
];

const blindSet = new Map(NEED_BLIND_INTL.map(s => [s.ipeds, s.name]));

const colleges = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));

let tagged = 0;

for (const college of colleges) {
  if (blindSet.has(college.scorecard_id)) {
    college.need_blind_intl = true;
    console.log(`Tagged: ${blindSet.get(college.scorecard_id)}`);
    tagged++;
  } else {
    college.need_blind_intl = false;
  }
}

fs.writeFileSync(JSON_PATH, JSON.stringify(colleges, null, 2), 'utf-8');
console.log(`\nTagged ${tagged}/11 schools as need-blind for international students`);

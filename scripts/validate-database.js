/**
 * validate-database.js
 * Runs the full college database through dataValidator and prints a summary report.
 * Usage: npm run validate
 * Exit code 1 if any records have errors (usable in CI pipelines).
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { validateDatabase } from '../src/lib/dataValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// Locate the most recent colleges dataset
const dataPath = resolve(__dirname, '../src/data/colleges-2026-04-24.json');
let colleges;
try {
  // Strip UTF-8 BOM (U+FEFF) if present — Windows editors sometimes add it
  const raw = readFileSync(dataPath, 'utf-8').replace(/^\uFEFF/, '');
  colleges = JSON.parse(raw);
} catch (e) {
  console.error('\n❌  Failed to parse colleges JSON:', e.message);
  console.error('    The database file may be truncated or malformed.\n');
  process.exit(1);
}

const hr = '─'.repeat(52);

console.log('\n🔬  LilGrant — Database Validation Report');
console.log(hr);

const r = validateDatabase(colleges);

console.log(`  Total records    ${r.total.toLocaleString()}`);
console.log(`  ✅ Valid          ${r.valid.toLocaleString()}`);
console.log(`  ⚠️  With warnings  ${r.withWarnings.toLocaleString()}`);
console.log(`  ❌ With errors    ${r.withErrors.toLocaleString()}`);

if (r.duplicates.length > 0) {
  console.log(`\n  🔁 Duplicate names (${r.duplicates.length}):`);
  r.duplicates.slice(0, 10).forEach(name => console.log(`     · ${name}`));
  if (r.duplicates.length > 10)
    console.log(`     … and ${r.duplicates.length - 10} more`);
}

if (r.errorList.length > 0) {
  console.log(`\n  ❌ Records with errors (${r.errorList.length}):`);
  r.errorList.slice(0, 15).forEach(({ name, errors }) =>
    console.log(`     · ${name || '(unnamed)'}: ${errors.join('; ')}`)
  );
}

if (r.warningList.length > 0) {
  console.log(`\n  ⚠️  Records with warnings (first 10 shown):`);
  r.warningList.slice(0, 10).forEach(({ name, warnings }) =>
    console.log(`     · ${name}: ${warnings.join('; ')}`)
  );
}

console.log('\n' + hr);
if (r.withErrors === 0) {
  console.log('  ✅ All records passed validation — database is clean.\n');
} else {
  console.log(`  ❌ ${r.withErrors} record(s) have data errors. Review errorList above.\n`);
  process.exit(1);
}

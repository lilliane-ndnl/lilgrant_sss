import { readFileSync } from 'fs'

const colleges = JSON.parse(readFileSync('src/data/colleges-2026-04-24.json', 'utf8'))
const nuCsv  = readFileSync('src/data/US-News-National-University-Rankings-Top-150-Through-2026.csv', 'utf8')
const lacCsv = readFileSync('src/data/US-News-Rankings-Liberal-Arts-Colleges-Through-2026.csv', 'utf8')

// ── CSV parsing ──────────────────────────────────────────────────────────────
function parseRank(val) {
  if (!val || !val.trim()) return null
  const n = parseInt(val.trim(), 10)
  if (!isNaN(n)) return n
  const m = val.match(/\((\d+)/)
  return m ? parseInt(m[1], 10) : null
}

function parseCsv(raw) {
  return raw.trim().split('\n').slice(1).map(line => {
    const cols = []; let cur = '', inQ = false
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue }
      if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue }
      cur += ch
    }
    cols.push(cur.trim())
    return { name: cols[0]?.trim() || '', rank2026: parseRank(cols[3]) }
  }).filter(r => r.name && r.rank2026 !== null)
}

// ── Name normalisation ───────────────────────────────────────────────────────
function norm(s) {
  return (s || '').toLowerCase().replace(/[–—]/g, '-').replace(/\./g, '')
    .replace(/,.*$/, '').replace(/\s+/g, ' ').trim()
}

function variants(s) {
  const b = norm(s)
  const noThe = b.startsWith('the ') ? b.slice(4) : b
  return new Set([
    b, noThe,
    b.replace(/-/g, ' '), noThe.replace(/-/g, ' '),
    b.replace(/&/g, 'and'), noThe.replace(/&/g, 'and'),
    b.replace(/\band\b/g, '&'), noThe.replace(/\band\b/g, '&'),
    b.replace(/ at /g, ' '), noThe.replace(/ at /g, ' '),
    b.replace(/\bsaint\b/g, 'st'), b.replace(/\bst\b/g, 'saint'),
    b.replace(/ and conservatory$/, ''),
    b.replace(/ at \w[\w ]*$/, ''),
  ])
}

// ── Build college lookup ─────────────────────────────────────────────────────
const byNorm = new Map()
for (const c of colleges) {
  for (const v of variants(c.name)) {
    if (!byNorm.has(v)) byNorm.set(v, c)
  }
}

function findCollege(name) {
  for (const v of variants(name)) {
    if (byNorm.has(v)) return byNorm.get(v)
  }
  return null
}

// ── 1. Rankings coverage ─────────────────────────────────────────────────────
const nuData  = parseCsv(nuCsv)
const lacData = parseCsv(lacCsv)

const nuUnmatched  = nuData.filter(e => !findCollege(e.name))
const lacUnmatched = lacData.filter(e => !findCollege(e.name))

console.log('━━━ US NEWS RANKINGS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`NU  ranked schools in CSV : ${nuData.length}`)
console.log(`NU  matched in DB         : ${nuData.length - nuUnmatched.length}`)
console.log(`NU  NOT in DB             : ${nuUnmatched.length}`)
if (nuUnmatched.length) nuUnmatched.forEach(e => console.log(`  - "${e.name}" (rank #${e.rank2026})`))

console.log(`\nLAC ranked schools in CSV : ${lacData.length}`)
console.log(`LAC matched in DB         : ${lacData.length - lacUnmatched.length}`)
console.log(`LAC NOT in DB             : ${lacUnmatched.length}`)
if (lacUnmatched.length) lacUnmatched.forEach(e => console.log(`  - "${e.name}" (rank #${e.rank2026})`))

// ── 2. Common App coverage ───────────────────────────────────────────────────
// Check for a Common App CSV
import { existsSync } from 'fs'
const caFiles = [
  'src/data/common-app-schools.csv',
  'src/data/CommonApp.csv',
  'src/data/common_app.csv',
].filter(existsSync)

if (caFiles.length) {
  const caRaw = readFileSync(caFiles[0], 'utf8')
  const caNames = caRaw.trim().split('\n').slice(1).map(line => {
    const cols = []; let cur = '', inQ = false
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue }
      if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue }
      cur += ch
    }
    cols.push(cur.trim())
    return cols[0]?.trim() || ''
  }).filter(Boolean)

  const caUnmatched = caNames.filter(n => !findCollege(n))
  console.log(`\n━━━ COMMON APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`Common App schools in CSV : ${caNames.length}`)
  console.log(`Matched in DB             : ${caNames.length - caUnmatched.length}`)
  console.log(`NOT in DB                 : ${caUnmatched.length}`)
  if (caUnmatched.length) caUnmatched.slice(0, 20).forEach(n => console.log(`  - "${n}"`))
  if (caUnmatched.length > 20) console.log(`  ... and ${caUnmatched.length - 20} more`)
} else {
  console.log('\n━━━ COMMON APP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('No Common App CSV found in src/data/')
}

// ── 3. DB schools with uses_common_app=true ──────────────────────────────────
const caInDb = colleges.filter(c => c.uses_common_app === true)
console.log(`\nSchools in DB with uses_common_app=true: ${caInDb.length}`)

// ── 4. DB schools with a ranking ────────────────────────────────────────────
const rankedInDb = colleges.filter(c => c.us_news_rank && c.us_news_rank < 10000)
console.log(`Schools in DB with valid us_news_rank  : ${rankedInDb.length}`)
console.log(`Total schools in DB                    : ${colleges.length}`)

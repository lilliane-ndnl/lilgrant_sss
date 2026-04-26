import { readFileSync } from 'fs'

const colleges = JSON.parse(readFileSync('src/data/colleges-2026-04-24.json', 'utf8'))
const nuCsv  = readFileSync('src/data/US-News-National-University-Rankings-Top-150-Through-2026.csv', 'utf8')
const lacCsv = readFileSync('src/data/US-News-Rankings-Liberal-Arts-Colleges-Through-2026.csv', 'utf8')

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
    return { name: cols[0]?.trim() || '', ipeds: cols[2]?.trim() || '', rank2026: parseRank(cols[3]) }
  }).filter(r => r.name && r.rank2026 !== null)
}

function norm(s) {
  return (s || '').toLowerCase().replace(/[–—]/g, '-').replace(/\./g, '').replace(/,.*$/, '').replace(/\s+/g, ' ').trim()
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

const nuData  = parseCsv(nuCsv)
const lacData = parseCsv(lacCsv)

// Build lookup by normalized name
const byNorm = new Map()
for (const c of colleges) {
  for (const v of variants(c.name)) {
    if (!byNorm.has(v)) byNorm.set(v, c)
  }
}

// Build lookup by IPEDS id
const byIpeds = new Map()
for (const c of colleges) {
  if (c.ipeds_id) byIpeds.set(String(c.ipeds_id).trim(), c)
}

function check(csvData, label) {
  const unmatched = []
  for (const entry of csvData) {
    let matched = false
    for (const v of variants(entry.name)) {
      if (byNorm.has(v)) { matched = true; break }
    }
    if (!matched) {
      // Try IPEDS
      const byId = byIpeds.get(entry.ipeds)
      unmatched.push({ ...entry, ipedsMatch: byId?.name || null })
    }
  }
  console.log(`\n=== UNMATCHED ${label} (${unmatched.length}) ===`)
  for (const u of unmatched) {
    const hint = u.ipedsMatch
      ? `  ← IPEDS ${u.ipeds} matches JSON: "${u.ipedsMatch}"`
      : `  ← IPEDS ${u.ipeds} NOT in JSON`
    console.log(`  Rank #${String(u.rank2026).padEnd(3)}  "${u.name}"${hint}`)
  }
  return unmatched.length
}

const nuU  = check(nuData,  'NU')
const lacU = check(lacData, 'LAC')
console.log(`\nSummary: NU unmatched ${nuU}/${nuData.length} | LAC unmatched ${lacU}/${lacData.length}`)

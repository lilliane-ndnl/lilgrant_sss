import { readFileSync } from 'fs'
const colleges = JSON.parse(readFileSync('src/data/colleges-2026-04-24.json', 'utf8'))

const ranked = colleges.filter(c => c.us_news_rank != null && c.us_news_rank > 0)
console.log(`\nTotal with us_news_rank > 0: ${ranked.length}`)

const isLAC = c => c.predominant_degree === "Bachelor's" && (c.total_enrollment || 0) < 5000
const isNU  = c => c.predominant_degree === "Master's" || c.predominant_degree === "Doctoral" || (c.total_enrollment || 0) >= 5000

const nuPool  = ranked.filter(isNU).sort((a,b) => a.us_news_rank - b.us_news_rank)
const lacPool = ranked.filter(isLAC).sort((a,b) => a.us_news_rank - b.us_news_rank)
const neither = ranked.filter(c => !isNU(c) && !isLAC(c))

console.log(`NU pool:  ${nuPool.length}`)
console.log(`LAC pool: ${lacPool.length}`)
console.log(`Neither:  ${neither.length}  <- these are the missing schools\n`)

// Show all LAC-pool schools with their enrollment so user can spot misclassified NUs
console.log('--- LAC pool (all schools caught by LAC filter) ---')
lacPool.forEach(c => {
  console.log(`  Rank ${String(c.us_news_rank).padStart(3)}  ${c.name.padEnd(55)} enrollment=${String(c.total_enrollment || 0).padStart(6)}`)
})

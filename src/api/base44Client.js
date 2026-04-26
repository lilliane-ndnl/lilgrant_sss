import collegesData from '@/data/colleges-2026-04-24.json'

let colleges = collegesData

function meetsMinimumDataQuality(c) {
  // Always keep ranked schools regardless of data completeness
  if (c.us_news_rank && c.us_news_rank < 2000) return true

  // Always keep need-blind or schools with intl aid data
  if (c.need_blind_intl === true) return true
  if (c.need_blind_us === true) return true
  if (c.avg_aid_intl && parseFloat(c.avg_aid_intl) > 0) return true

  // Acceptance rate is MANDATORY for all other schools
  if (c.acceptance_rate == null) return false

  // Plus at least 2 more of these 4 fields:
  const score = [
    (c.tuition_out_of_state != null || c.avg_annual_cost != null),
    c.graduation_rate != null,
    c.undergrad_enrollment != null && c.undergrad_enrollment > 0,
    c.median_earnings_10yr != null,
  ].filter(Boolean).length

  return score >= 2
}

console.log(`LilGrant DB: ${collegesData.filter(meetsMinimumDataQuality).length} quality schools loaded (${collegesData.length} total)`)

export const db = {
  auth: {
    isAuthenticated: async () => false,
    me: async () => null,
    logout: () => {},
    redirectToLogin: () => {}
  },
  entities: {
    College: {
      list: async () => colleges.filter(meetsMinimumDataQuality),
      listAll: async () => colleges,
      filter: async (params) => {
        if (params?.id) return colleges.filter(c => c.id === params.id)
        return colleges.filter(meetsMinimumDataQuality)
      },
      get: async (id) => colleges.find(c => c.id === id) || null,
      create: async (data) => { const record = {...data, id: Date.now().toString()}; colleges.push(record); return record },
      update: async (id, data) => { const i = colleges.findIndex(c => c.id === id); if(i > -1) colleges[i] = {...colleges[i], ...data}; return colleges[i] },
      delete: async (id) => { colleges = colleges.filter(c => c.id !== id); return {id} }
    },
    Favorite: {
      list: async () => JSON.parse(localStorage.getItem('favorites') || '[]'),
      filter: async () => JSON.parse(localStorage.getItem('favorites') || '[]'),
      create: async (data) => { const favs = JSON.parse(localStorage.getItem('favorites') || '[]'); const record = {...data, id: Date.now().toString()}; favs.push(record); localStorage.setItem('favorites', JSON.stringify(favs)); return record },
      delete: async (id) => { const favs = JSON.parse(localStorage.getItem('favorites') || '[]').filter(f => f.id !== id); localStorage.setItem('favorites', JSON.stringify(favs)); return {id} }
    }
  }
}

export const base44 = db
export default db

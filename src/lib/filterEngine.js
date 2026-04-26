// ─── Constants ────────────────────────────────────────────────────────────────

export const STRATEGY_DIST = {
  ambitious: { reach: 4, match: 5, safety: 3 },
  balanced:  { reach: 3, match: 7, safety: 4 },
  safe:      { reach: 2, match: 6, safety: 5 },
};

const REGIONS = [
  { key: 'Northeast', states: ['ME','NH','VT','MA','RI','CT','NY','NJ','PA','MD','DE','DC'] },
  { key: 'Southeast', states: ['VA','WV','KY','TN','NC','SC','GA','FL','AL','MS','AR','LA'] },
  { key: 'Midwest',   states: ['OH','MI','IN','IL','WI','MN','IA','MO','ND','SD','NE','KS'] },
  { key: 'Southwest', states: ['TX','OK','NM','AZ'] },
  { key: 'West',      states: ['CO','WY','MT','ID','WA','OR','CA','NV','UT','AK','HI'] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRegionForState(state) {
  return REGIONS.find(r => r.states.includes(state))?.key || null;
}

function getSizeKey(enrollment) {
  if (!enrollment) return null;
  if (enrollment < 5000)  return 'small';
  if (enrollment < 15000) return 'medium';
  if (enrollment < 30000) return 'large';
  return 'very_large';
}

// ─── Exported Functions ───────────────────────────────────────────────────────

/**
 * Returns true if a college record has enough data to be useful.
 * Ranked schools, need-blind schools, and schools with intl aid always pass.
 * All others require acceptance_rate + at least 2 more fields.
 */
export function meetsMinimumDataQuality(c) {
  if (c.us_news_rank && c.us_news_rank < 2000) return true;
  if (c.need_blind_intl === true) return true;
  if (c.need_blind_us === true) return true;
  if (c.avg_aid_intl && parseFloat(c.avg_aid_intl) > 0) return true;

  if (c.acceptance_rate == null) return false;

  const score = [
    (c.tuition_out_of_state != null || c.avg_annual_cost != null),
    c.graduation_rate != null,
    c.undergrad_enrollment != null && c.undergrad_enrollment > 0,
    c.median_earnings_10yr != null,
  ].filter(Boolean).length;

  return score >= 2;
}

/**
 * Returns the best available cost estimate for a college.
 * Fallback chain: avg_coa_after_aid → avg_annual_cost → tuition_out_of_state
 */
export function calculateNetCost(college) {
  if (college.avg_coa_after_aid != null) return college.avg_coa_after_aid;
  if (college.avg_annual_cost != null)   return college.avg_annual_cost;
  if (college.tuition_out_of_state != null) return college.tuition_out_of_state;
  return null;
}

/**
 * Filters colleges to those within budget (with 20% hard cap above maxBudget).
 * Colleges with no cost data are always included (benefit of the doubt).
 */
export function filterByBudget(colleges, maxBudget) {
  if (maxBudget === null || maxBudget === undefined) return colleges;
  return colleges.filter(c => {
    const cost = calculateNetCost(c);
    if (cost == null) return true;
    return cost <= maxBudget * 1.2;
  });
}

/**
 * Filters colleges by acceptance rate range.
 * Colleges with null acceptance_rate are excluded.
 */
export function filterByAcceptanceRate(colleges, minRate, maxRate) {
  return colleges.filter(c => {
    if (c.acceptance_rate == null) return false;
    if (minRate != null && c.acceptance_rate < minRate) return false;
    if (maxRate != null && c.acceptance_rate > maxRate) return false;
    return true;
  });
}

/**
 * Scores a college against student preferences.
 * Returns { score, budgetScore, academicScore, prefScore, intlBonus, academicFit }
 *
 * Scoring breakdown:
 *   Budget    — up to 40 pts
 *   Academic  — up to 30 pts (also sets academicFit: REACH | MATCH | SAFETY)
 *   Prefs     — up to 20 pts (region, size, setting, major — 5 pts each)
 *   Intl bonus — up to 10 pts (for international students only)
 */
export function scoreCollege(college, prefs) {
  let budgetScore   = 0;
  let academicScore = 0;
  let prefScore     = 0;
  let intlBonus     = 0;
  let academicFit   = 'MATCH';

  // ── 1. Budget (40 pts) ────────────────────────────────────────────────────
  const cost = calculateNetCost(college);

  if (prefs.maxBudget === null || prefs.maxBudget === undefined) {
    budgetScore = 40;
  } else if (cost != null) {
    if      (cost <= prefs.maxBudget)            budgetScore = 40;
    else if (cost <= prefs.maxBudget * 1.1)      budgetScore = 20;
    else if (cost >  prefs.maxBudget * 1.2)      budgetScore = 0;
    else                                         budgetScore = 10;
  } else {
    budgetScore = 20; // no cost data → neutral
  }

  // ── 2. Academic fit (30 pts) ──────────────────────────────────────────────
  const studentSAT = prefs.testType === 'SAT' ? Number(prefs.sat) || 0 : 0;
  const studentACT = prefs.testType === 'ACT' ? Number(prefs.act) || 0 : 0;
  const sat25 = (college.sat_math_25 || 0) + (college.sat_reading_25 || 0);
  const sat75 = (college.sat_math_75 || 0) + (college.sat_reading_75 || 0);
  const ar    = college.acceptance_rate || 0.5;

  const fitByRate = () => {
    if (ar > 0.5)      { academicFit = 'SAFETY'; return 30; }
    if (ar >= 0.2)     { academicFit = 'MATCH';  return 20; }
                       { academicFit = 'REACH';  return 10; }
  };

  if (prefs.testType === 'Test-Optional' || (!studentSAT && !studentACT)) {
    academicScore = fitByRate();
  } else if (studentSAT) {
    if (sat25 && sat75) {
      if      (studentSAT > sat75)      { academicFit = 'SAFETY'; academicScore = 30; }
      else if (studentSAT >= sat25)     { academicFit = 'MATCH';  academicScore = 20; }
      else                              { academicFit = 'REACH';  academicScore = 10; }
    } else {
      academicScore = fitByRate();
    }
  } else if (studentACT && college.act_25 && college.act_75) {
    if      (studentACT > college.act_75)      { academicFit = 'SAFETY'; academicScore = 30; }
    else if (studentACT >= college.act_25)     { academicFit = 'MATCH';  academicScore = 20; }
    else                                       { academicFit = 'REACH';  academicScore = 10; }
  } else {
    academicScore = fitByRate();
  }

  // ── 3. Preferences (20 pts, 5 pts each) ──────────────────────────────────
  if (!prefs.regions?.length) {
    prefScore += 5;
  } else {
    const r = getRegionForState(college.state);
    if (r && prefs.regions.includes(r)) prefScore += 5;
  }

  if (!prefs.sizes?.length) {
    prefScore += 5;
  } else {
    if (prefs.sizes.includes(getSizeKey(college.undergrad_enrollment))) prefScore += 5;
  }

  if (!prefs.settings?.length) {
    prefScore += 5;
  } else {
    const settingMatch = prefs.settings.some(s =>
      college.setting?.toLowerCase().includes(s.toLowerCase())
    );
    if (settingMatch) prefScore += 5;
  }

  if (!prefs.majors?.length) {
    prefScore += 5;
  } else {
    const majorMatch = prefs.majors.some(m =>
      college.popular_programs?.some(p =>
        p?.toLowerCase().includes(m.split(' ')[0].toLowerCase())
      )
    );
    if (majorMatch) prefScore += 5;
  }

  // ── 4. Intl bonus (10 pts) ────────────────────────────────────────────────
  if (prefs.isInternational) {
    if (college.need_blind_intl === true)                         intlBonus += 3;
    if ((college.avg_aid_intl || 0) > 0)                          intlBonus += 4;
    if (String(college.meets_full_need || '').startsWith('Yes'))  intlBonus += 2;
    if ((college.pct_intl_receiving_aid || 0) > 30)               intlBonus += 1;
  }

  const score = Math.min(Math.max(budgetScore + academicScore + prefScore + intlBonus, 0), 100);
  return { score, budgetScore, academicScore, prefScore, intlBonus, academicFit };
}

/**
 * Sorts pre-scored colleges into reach / match / safety buckets.
 * Input: array of { college, score, academicFit }
 * Strategy determines how many slots each bucket gets.
 */
export function categorizeResults(scoredColleges, strategy) {
  const dist = STRATEGY_DIST[strategy] || STRATEGY_DIST.balanced;
  const reach = [], match = [], safety = [];

  for (const item of scoredColleges) {
    if      (item.academicFit === 'REACH')  reach.push(item);
    else if (item.academicFit === 'MATCH')  match.push(item);
    else                                    safety.push(item);
  }

  const byScore = (a, b) => b.score - a.score;
  reach.sort(byScore);
  match.sort(byScore);
  safety.sort(byScore);

  return {
    reach:  reach.slice(0, dist.reach),
    match:  match.slice(0, dist.match),
    safety: safety.slice(0, dist.safety),
  };
}

/**
 * Formats a dollar value into a short string like '$44k'.
 * Returns '—' for null, undefined, or 0.
 */
export function formatCurrency(value) {
  if (!value) return '—';
  return `$${Math.round(value / 1000)}k`;
}

/**
 * Sanitizes free-text search input before it reaches the filter pipeline.
 * - Strips leading/trailing whitespace
 * - Removes characters that could form HTML/script injection vectors: < > " ' `
 * - Collapses multiple internal spaces into one
 * - Truncates to 100 characters
 * Returns '' for null, undefined, or non-string input.
 */
export function sanitizeSearchInput(input) {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>"'`]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 100);
}

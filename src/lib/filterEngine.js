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
 * Returns true if a college record has enough data to be useful in the filter pipeline.
 * Ranked schools, need-blind schools, and schools with documented intl aid always pass
 * regardless of other missing fields. All others require acceptance_rate plus at least
 * 2 of: tuition/cost data, graduation rate, enrollment, median earnings.
 *
 * @param {Object}       c                    - College record from the database
 * @param {number|null}  c.us_news_rank        - US News rank; < 2000 = ranked, passes immediately
 * @param {boolean}      c.need_blind_intl     - Need-blind for international students
 * @param {boolean}      c.need_blind_us       - Need-blind for US students
 * @param {number|null}  c.avg_aid_intl        - Average intl student aid; > 0 passes immediately
 * @param {number|null}  c.acceptance_rate     - Required for all non-exempt schools
 * @returns {boolean} true if the record meets minimum data quality threshold
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
 * Returns the best available annual cost estimate for a college.
 * Fallback chain: avg_coa_after_aid → avg_annual_cost → tuition_out_of_state → null.
 * avg_coa_after_aid is preferred because it already reflects institutional aid grants.
 *
 * @param {Object}      college                    - College record
 * @param {number|null} college.avg_coa_after_aid  - Cost of attendance after aid (most accurate)
 * @param {number|null} college.avg_annual_cost     - Average annual cost (Scorecard)
 * @param {number|null} college.tuition_out_of_state - Sticker tuition (last resort)
 * @returns {number|null} Best cost estimate in dollars, or null if no data is available
 */
export function calculateNetCost(college) {
  if (college.avg_coa_after_aid != null) return college.avg_coa_after_aid;
  if (college.avg_annual_cost != null)   return college.avg_annual_cost;
  if (college.tuition_out_of_state != null) return college.tuition_out_of_state;
  return null;
}

/**
 * Filters an array of colleges to those within the student's annual budget.
 * Applies a 20% tolerance above maxBudget as the hard exclusion threshold —
 * schools slightly over budget are kept so they can receive a lower budget score
 * in scoreCollege rather than disappearing entirely.
 * Colleges with no cost data are always included (benefit of the doubt).
 *
 * @param {Object[]}    colleges  - Array of college records
 * @param {number|null} maxBudget - Maximum annual budget in dollars; null = no limit
 * @returns {Object[]} Colleges where calculateNetCost(c) <= maxBudget * 1.2, or cost is null
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
 * Filters colleges to those within an acceptance rate range.
 * Colleges with null acceptance_rate are always excluded — a missing rate
 * cannot be safely interpreted as either very selective or open admission.
 *
 * @param {Object[]}    colleges - Array of college records
 * @param {number|null} minRate  - Minimum acceptance rate as decimal (0–1); null = no minimum
 * @param {number|null} maxRate  - Maximum acceptance rate as decimal (0–1); null = no maximum
 * @returns {Object[]} Colleges with acceptance_rate in [minRate, maxRate]
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
 * Scores a college against student preferences (0–100 points).
 *
 * Scoring breakdown:
 * - Budget fit:   40pts — most important for intl students
 * - Academic fit: 30pts — determines REACH/MATCH/SAFETY tier
 * - Preferences:  20pts — region, size, setting, major (5pts each)
 * - Intl bonus:   10pts — aid availability, need-blind status
 *
 * Hard exclusion: cost > 120% of budget → budgetScore = 0
 *
 * @param {Object}   college                       - College record
 * @param {Object}   prefs                         - Student preferences
 * @param {number|null} prefs.maxBudget            - Annual budget cap in dollars; null = unlimited
 * @param {boolean}  prefs.isInternational         - Whether student is an international applicant
 * @param {'SAT'|'ACT'|'Test-Optional'} prefs.testType - Test score type being submitted
 * @param {string|number} prefs.sat                - SAT total score (used if testType = 'SAT')
 * @param {string|number} prefs.act                - ACT composite score (used if testType = 'ACT')
 * @param {string[]} prefs.regions                 - Preferred US regions; empty = no preference
 * @param {string[]} prefs.sizes                   - Preferred size keys; empty = no preference
 * @param {string[]} prefs.settings                - Preferred campus settings; empty = no preference
 * @param {string[]} prefs.majors                  - Preferred majors/programs; empty = no preference
 * @returns {{ score: number, budgetScore: number, academicScore: number,
 *             prefScore: number, intlBonus: number,
 *             academicFit: 'REACH'|'MATCH'|'SAFETY' }}
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
 * Distributes pre-scored colleges into reach / match / safety buckets.
 * Bucket sizes are determined by strategy using STRATEGY_DIST constants.
 * Within each bucket, colleges are sorted by score descending so the
 * strongest fit appears first.
 *
 * @param {{ college: Object, score: number, academicFit: 'REACH'|'MATCH'|'SAFETY' }[]} scoredColleges
 *   Array of scored college objects (typically from scoreCollege)
 * @param {'ambitious'|'balanced'|'safe'} strategy - List-building strategy
 * @returns {{ reach: Object[], match: Object[], safety: Object[] }}
 *   Categorized, sorted, and capped arrays per the strategy distribution
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
 * Formats a dollar amount into a compact display string (e.g. 44200 → '$44k').
 * Uses Math.round so 1500 → '$2k', 44200 → '$44k'. Consistent with the em-dash
 * convention used throughout the UI for missing data.
 *
 * @param {number|null|undefined} value - Dollar amount
 * @returns {string} Formatted string like '$44k', or '—' for falsy values (null, 0, undefined)
 */
export function formatCurrency(value) {
  if (!value) return '—';
  return `$${Math.round(value / 1000)}k`;
}

/**
 * Sanitizes free-text search input before it enters the filter pipeline.
 * Applied at every search onChange handler to prevent malformed queries
 * and XSS-style character injection from reaching rendered output.
 *
 * Operations (in order):
 * 1. Rejects non-string / falsy input → returns ''
 * 2. Trims leading and trailing whitespace
 * 3. Strips HTML/script injection characters: < > " ' `
 * 4. Collapses multiple consecutive spaces into a single space
 * 5. Truncates to 100 characters
 *
 * @param {*} input - Raw value from an input onChange event
 * @returns {string} Sanitized string safe to use in filter comparisons, or ''
 */
export function sanitizeSearchInput(input) {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>"'`]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 100);
}

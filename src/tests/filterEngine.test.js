import { describe, test, expect } from 'vitest';
import {
  meetsMinimumDataQuality,
  filterByBudget,
  filterByAcceptanceRate,
  scoreCollege,
  categorizeResults,
  calculateNetCost,
  formatCurrency,
} from '../lib/filterEngine';
import { validateCollegeRecord, validateDatabase } from '../lib/dataValidator';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_COLLEGES = [
  {
    id: '1', name: 'Harvard University', scorecard_id: 166027,
    acceptance_rate: 0.04, tuition_out_of_state: 62000,
    avg_annual_cost: 18000, avg_aid_intl: 75000,
    avg_coa_after_aid: 8000, graduation_rate: 0.97,
    median_earnings_10yr: 102000, undergrad_enrollment: 7000,
    us_news_rank: 3, need_blind_intl: true,
    state: 'MA', setting: 'City',
    sat_math_25: 750, sat_math_75: 800,
    act_25: 34, act_75: 36,
    popular_programs: ['Economics', 'Biology', 'Computer Science'],
  },
  {
    id: '2', name: 'State University Test', scorecard_id: 999001,
    acceptance_rate: 0.65, tuition_out_of_state: 28000,
    avg_annual_cost: 22000, avg_aid_intl: null,
    graduation_rate: 0.72, median_earnings_10yr: 52000,
    undergrad_enrollment: 25000, us_news_rank: null,
    need_blind_intl: false, state: 'OH', setting: 'Suburb',
    sat_math_25: 480, sat_math_75: 580,
    act_25: 20, act_75: 26,
    popular_programs: ['Business', 'Engineering'],
  },
  {
    id: '3', name: 'Affordable College Test', scorecard_id: 999002,
    acceptance_rate: 0.82, tuition_out_of_state: 18000,
    avg_annual_cost: 15000, avg_aid_intl: 8000,
    avg_coa_after_aid: 12000, graduation_rate: 0.68,
    median_earnings_10yr: 45000, undergrad_enrollment: 5000,
    us_news_rank: null, need_blind_intl: false,
    state: 'TX', setting: 'Town',
    sat_math_25: 430, sat_math_75: 530,
    act_25: 18, act_75: 23,
    popular_programs: ['Education', 'Nursing'],
  },
  {
    id: '4', name: 'No Data College', scorecard_id: 999003,
    acceptance_rate: null, tuition_out_of_state: null,
    avg_annual_cost: null, graduation_rate: null,
    undergrad_enrollment: null, us_news_rank: null,
    need_blind_intl: false,
  },
];

const harvard       = MOCK_COLLEGES[0];
const stateU        = MOCK_COLLEGES[1];
const affordable    = MOCK_COLLEGES[2];
const noData        = MOCK_COLLEGES[3];

// ─── meetsMinimumDataQuality ──────────────────────────────────────────────────

describe('meetsMinimumDataQuality', () => {
  test('passes ranked schools even with missing data', () => {
    expect(meetsMinimumDataQuality({ us_news_rank: 50 })).toBe(true);
  });

  test('passes need-blind schools even with missing data', () => {
    expect(meetsMinimumDataQuality({ need_blind_intl: true })).toBe(true);
  });

  test('passes schools with intl aid data', () => {
    expect(meetsMinimumDataQuality({ avg_aid_intl: 30000 })).toBe(true);
  });

  test('rejects schools with no acceptance rate', () => {
    expect(meetsMinimumDataQuality(noData)).toBe(false);
  });

  test('rejects schools with only 1 data field', () => {
    const school = {
      acceptance_rate: 0.5,
      graduation_rate: 0.7,
      // tuition, enrollment, earnings all missing → score = 1 < 2
    };
    expect(meetsMinimumDataQuality(school)).toBe(false);
  });

  test('passes schools with acceptance rate + 2 other fields', () => {
    const school = {
      acceptance_rate: 0.5,
      tuition_out_of_state: 30000,
      graduation_rate: 0.7,
    };
    expect(meetsMinimumDataQuality(school)).toBe(true);
  });
});

// ─── filterByBudget ───────────────────────────────────────────────────────────

describe('filterByBudget', () => {
  test('returns colleges within budget using avg_coa_after_aid', () => {
    // Harvard avg_coa_after_aid = 8000; budget = 10000 → include
    const result = filterByBudget([harvard], 10000);
    expect(result).toContain(harvard);
  });

  test('falls back to avg_annual_cost when avg_coa_after_aid is null', () => {
    // State U has no avg_coa_after_aid; avg_annual_cost = 22000; budget = 25000 → include
    const result = filterByBudget([stateU], 25000);
    expect(result).toContain(stateU);
  });

  test('falls back to tuition_out_of_state as last resort', () => {
    const school = { id: 'x', tuition_out_of_state: 20000 };
    expect(filterByBudget([school], 25000)).toContain(school);
  });

  test('returns all colleges when maxBudget is null (no limit)', () => {
    const result = filterByBudget(MOCK_COLLEGES, null);
    expect(result).toHaveLength(MOCK_COLLEGES.length);
  });

  test('excludes colleges with cost > maxBudget * 1.2', () => {
    // State U avg_annual_cost = 22000; budget = 15000; 22000 > 18000 → exclude
    const result = filterByBudget([stateU], 15000);
    expect(result).not.toContain(stateU);
  });

  test('does not crash when college has no cost data', () => {
    const result = filterByBudget([noData], 30000);
    expect(result).toContain(noData); // no cost data → include
  });
});

// ─── scoreCollege ─────────────────────────────────────────────────────────────

describe('scoreCollege', () => {
  const basePrefs = {
    maxBudget: 50000,
    isInternational: false,
    gpa: '3.8',
    testType: 'SAT',
    sat: '1400',
    act: '',
    regions: [],
    sizes: [],
    settings: [],
    majors: [],
  };

  test('gives max budget score when cost is within budget', () => {
    // Harvard avg_coa_after_aid = 8000 << 50000
    const result = scoreCollege(harvard, basePrefs);
    expect(result.budgetScore).toBe(40);
  });

  test('gives zero budget score when cost exceeds budget by 20%', () => {
    // State U avg_annual_cost = 22000; budget = 15000; 22000 > 18000
    const result = scoreCollege(stateU, { ...basePrefs, maxBudget: 15000 });
    expect(result.budgetScore).toBe(0);
  });

  test('classifies student as SAFETY when SAT above 75th percentile', () => {
    // Harvard sat_math_75 = 800; studentSAT 1500 > 800 (sat_reading_75 is null/0)
    const result = scoreCollege(harvard, { ...basePrefs, sat: '1500' });
    expect(result.academicFit).toBe('SAFETY');
  });

  test('classifies student as MATCH when SAT within range', () => {
    // Harvard sat_math_25 = 750, sat_math_75 = 800; studentSAT 780 → MATCH
    const result = scoreCollege(harvard, { ...basePrefs, sat: '780' });
    expect(result.academicFit).toBe('MATCH');
  });

  test('classifies student as REACH when SAT below 25th percentile', () => {
    // Harvard sat_math_25 = 750; studentSAT 700 < 750 → REACH
    const result = scoreCollege(harvard, { ...basePrefs, sat: '700' });
    expect(result.academicFit).toBe('REACH');
  });

  test('gives intl bonus points only when isInternational is true', () => {
    const intl    = scoreCollege(harvard, { ...basePrefs, isInternational: true });
    const nonIntl = scoreCollege(harvard, { ...basePrefs, isInternational: false });
    expect(intl.intlBonus).toBeGreaterThan(0);
    expect(nonIntl.intlBonus).toBe(0);
  });

  test('gives need-blind intl bonus when school is need_blind_intl', () => {
    // Harvard: need_blind_intl = true → extra 3 pts vs stateU (false)
    const prefs = { ...basePrefs, isInternational: true, sat: '700' };
    const withNeedBlind    = scoreCollege(harvard,  prefs);
    const withoutNeedBlind = scoreCollege(affordable, { ...prefs, maxBudget: 20000 });
    expect(withNeedBlind.intlBonus).toBeGreaterThanOrEqual(3);
    expect(withoutNeedBlind.intlBonus).toBeLessThan(withNeedBlind.intlBonus);
  });

  test('handles test-optional preference without crashing', () => {
    const prefs = { ...basePrefs, testType: 'Test-Optional', sat: '', act: '' };
    const result = scoreCollege(stateU, prefs);
    expect(result).toBeDefined();
    expect(typeof result.score).toBe('number');
    expect(result.academicFit).toMatch(/REACH|MATCH|SAFETY/);
  });

  test('total score never exceeds 100', () => {
    // Give best possible scenario: huge budget, need-blind, intl, all prefs match
    const prefs = {
      ...basePrefs,
      maxBudget: null,
      isInternational: true,
      sat: '1600',
      regions: ['Northeast'],
      sizes: ['small'],
      settings: ['City'],
      majors: ['Computer Science'],
    };
    const result = scoreCollege(harvard, prefs);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  test('total score never goes below 0', () => {
    const prefs = { ...basePrefs, maxBudget: 1000, sat: '400' };
    const result = scoreCollege(harvard, prefs);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});

// ─── categorizeResults ────────────────────────────────────────────────────────

describe('categorizeResults', () => {
  // Build a pool of pre-scored colleges spanning all fit categories
  const makeScored = (id, fit, score) => ({ college: { id }, score, academicFit: fit });
  const pool = [
    makeScored('r1', 'REACH',  70), makeScored('r2', 'REACH',  65),
    makeScored('r3', 'REACH',  60), makeScored('r4', 'REACH',  55),
    makeScored('r5', 'REACH',  50),
    makeScored('m1', 'MATCH',  80), makeScored('m2', 'MATCH',  75),
    makeScored('m3', 'MATCH',  72), makeScored('m4', 'MATCH',  68),
    makeScored('m5', 'MATCH',  65), makeScored('m6', 'MATCH',  63),
    makeScored('m7', 'MATCH',  60), makeScored('m8', 'MATCH',  58),
    makeScored('s1', 'SAFETY', 90), makeScored('s2', 'SAFETY', 85),
    makeScored('s3', 'SAFETY', 82), makeScored('s4', 'SAFETY', 78),
    makeScored('s5', 'SAFETY', 74), makeScored('s6', 'SAFETY', 70),
  ];

  test('balanced strategy returns more match than reach or safety', () => {
    const { reach, match, safety } = categorizeResults(pool, 'balanced');
    expect(match.length).toBeGreaterThan(reach.length);
    expect(match.length).toBeGreaterThan(safety.length);
  });

  test('ambitious strategy returns more reach schools', () => {
    const { reach } = categorizeResults(pool, 'ambitious');
    const { reach: balancedReach } = categorizeResults(pool, 'balanced');
    expect(reach.length).toBeGreaterThanOrEqual(balancedReach.length);
  });

  test('safe strategy returns more safety schools', () => {
    const { safety } = categorizeResults(pool, 'safe');
    const { reach } = categorizeResults(pool, 'safe');
    expect(safety.length).toBeGreaterThan(reach.length);
  });

  test('never returns duplicate schools across categories', () => {
    const { reach, match, safety } = categorizeResults(pool, 'balanced');
    const allIds = [
      ...reach.map(e => e.college.id),
      ...match.map(e => e.college.id),
      ...safety.map(e => e.college.id),
    ];
    const uniqueIds = new Set(allIds);
    expect(allIds.length).toBe(uniqueIds.size);
  });
});

// ─── calculateNetCost ─────────────────────────────────────────────────────────

describe('calculateNetCost', () => {
  test('prefers avg_coa_after_aid first', () => {
    // Harvard has avg_coa_after_aid = 8000
    expect(calculateNetCost(harvard)).toBe(8000);
  });

  test('falls back to avg_annual_cost', () => {
    // State U has no avg_coa_after_aid; avg_annual_cost = 22000
    expect(calculateNetCost(stateU)).toBe(22000);
  });

  test('falls back to tuition_out_of_state', () => {
    const school = { tuition_out_of_state: 30000 };
    expect(calculateNetCost(school)).toBe(30000);
  });

  test('returns null when all cost fields are null', () => {
    expect(calculateNetCost(noData)).toBeNull();
  });
});

// ─── formatCurrency ───────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  test('formats 44200 as $44k', () => {
    expect(formatCurrency(44200)).toBe('$44k');
  });

  test('formats 8000 as $8k', () => {
    expect(formatCurrency(8000)).toBe('$8k');
  });

  test('formats null as —', () => {
    expect(formatCurrency(null)).toBe('—');
  });

  test('formats 0 as —', () => {
    expect(formatCurrency(0)).toBe('—');
  });

  test('formats 1500 as $2k (rounds up)', () => {
    // Math.round(1500/1000) = Math.round(1.5) = 2
    expect(formatCurrency(1500)).toBe('$2k');
  });
});

// ─── validateCollegeRecord ────────────────────────────────────────────────────

describe('validateCollegeRecord', () => {
  test('returns valid for a complete college record', () => {
    const result = validateCollegeRecord(stateU);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('returns error when name is missing', () => {
    const result = validateCollegeRecord({ acceptance_rate: 0.5 });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('name'))).toBe(true);
  });

  test('returns error when acceptance_rate > 1', () => {
    const result = validateCollegeRecord({ name: 'Test', acceptance_rate: 1.5 });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('acceptance_rate'))).toBe(true);
  });

  test('returns error when tuition is negative', () => {
    const result = validateCollegeRecord({ name: 'Test', tuition_out_of_state: -5000 });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('negative'))).toBe(true);
  });

  test('returns warning when avg_aid_intl > tuition_out_of_state', () => {
    // Harvard: avg_aid_intl = 75000 > tuition_out_of_state = 62000
    const result = validateCollegeRecord(harvard);
    expect(result.warnings.some(w => w.includes('avg_aid_intl'))).toBe(true);
  });

  test('returns warning when graduation_rate < 0.1', () => {
    const result = validateCollegeRecord({
      name: 'Low Grad Rate U',
      graduation_rate: 0.05,
    });
    expect(result.warnings.some(w => w.includes('graduation_rate'))).toBe(true);
  });
});

// ─── validateDatabase ─────────────────────────────────────────────────────────

describe('validateDatabase', () => {
  test('counts total, valid, warnings, errors correctly', () => {
    const result = validateDatabase(MOCK_COLLEGES);
    expect(result.total).toBe(4);
    // Harvard has avg_aid_intl > tuition warning; all records have no errors
    expect(result.withErrors).toBe(0);
    expect(result.valid).toBe(4);
    expect(result.withWarnings).toBeGreaterThanOrEqual(1); // at least Harvard
  });

  test('detects duplicate school names', () => {
    const dupeSet = [
      { name: 'Twin College', acceptance_rate: 0.5, tuition_out_of_state: 20000 },
      { name: 'Twin College', acceptance_rate: 0.6, tuition_out_of_state: 21000 },
      { name: 'Unique School', acceptance_rate: 0.7 },
    ];
    const result = validateDatabase(dupeSet);
    expect(result.duplicates).toContain('Twin College');
    expect(result.duplicates).not.toContain('Unique School');
  });

  test('handles empty array without crashing', () => {
    const result = validateDatabase([]);
    expect(result.total).toBe(0);
    expect(result.valid).toBe(0);
    expect(result.duplicates).toHaveLength(0);
  });
});

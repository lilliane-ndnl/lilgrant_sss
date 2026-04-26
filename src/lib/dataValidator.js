/**
 * Validates a single college record.
 * Returns { valid: bool, warnings: string[], errors: string[] }
 *
 * Errors make the record unusable:
 *   - missing name
 *   - acceptance_rate outside [0, 1]
 *   - negative tuition values
 *
 * Warnings indicate suspicious data (record is still usable):
 *   - avg_aid_intl > tuition_out_of_state (aid exceeds stated tuition)
 *   - graduation_rate < 0.1
 *   - median_earnings_10yr < 20000
 *   - avg_coa_after_aid > total_coa (after-aid cost higher than pre-aid)
 */
export function validateCollegeRecord(college) {
  const errors   = [];
  const warnings = [];

  // ── Errors ────────────────────────────────────────────────────────────────
  if (!college.name || String(college.name).trim() === '') {
    errors.push('missing name');
  }

  if (college.acceptance_rate != null) {
    if (college.acceptance_rate < 0 || college.acceptance_rate > 1) {
      errors.push(`acceptance_rate out of range: ${college.acceptance_rate}`);
    }
  }

  if (college.tuition_out_of_state != null && college.tuition_out_of_state < 0) {
    errors.push(`tuition_out_of_state is negative: ${college.tuition_out_of_state}`);
  }
  if (college.tuition_in_state != null && college.tuition_in_state < 0) {
    errors.push(`tuition_in_state is negative: ${college.tuition_in_state}`);
  }

  // ── Warnings ──────────────────────────────────────────────────────────────
  if (
    college.avg_aid_intl != null &&
    college.tuition_out_of_state != null &&
    college.avg_aid_intl > college.tuition_out_of_state
  ) {
    warnings.push('avg_aid_intl exceeds tuition_out_of_state');
  }

  if (college.graduation_rate != null && college.graduation_rate < 0.1) {
    warnings.push(`graduation_rate suspiciously low: ${college.graduation_rate}`);
  }

  if (college.median_earnings_10yr != null && college.median_earnings_10yr < 20000) {
    warnings.push(`median_earnings_10yr suspiciously low: ${college.median_earnings_10yr}`);
  }

  if (
    college.avg_coa_after_aid != null &&
    college.total_coa != null &&
    college.avg_coa_after_aid > college.total_coa
  ) {
    warnings.push('avg_coa_after_aid exceeds total_coa');
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Runs validateCollegeRecord on every college in the array.
 * Returns aggregate statistics and lists of problem records.
 */
export function validateDatabase(colleges) {
  if (!colleges || colleges.length === 0) {
    return {
      total: 0,
      valid: 0,
      withWarnings: 0,
      withErrors: 0,
      errorList: [],
      warningList: [],
      duplicates: [],
    };
  }

  let valid        = 0;
  let withWarnings = 0;
  let withErrors   = 0;
  const errorList   = [];
  const warningList = [];

  for (const college of colleges) {
    const result = validateCollegeRecord(college);
    if (result.valid) valid++;
    if (result.errors.length > 0) {
      withErrors++;
      errorList.push({ name: college.name || '(unnamed)', errors: result.errors });
    }
    if (result.warnings.length > 0) {
      withWarnings++;
      warningList.push({ name: college.name || '(unnamed)', warnings: result.warnings });
    }
  }

  // Detect duplicate names
  const nameCounts = {};
  for (const college of colleges) {
    const n = college.name || '(unnamed)';
    nameCounts[n] = (nameCounts[n] || 0) + 1;
  }
  const duplicates = Object.entries(nameCounts)
    .filter(([, count]) => count > 1)
    .map(([name]) => name);

  return {
    total: colleges.length,
    valid,
    withWarnings,
    withErrors,
    errorList,
    warningList,
    duplicates,
  };
}

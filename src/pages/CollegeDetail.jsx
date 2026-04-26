import { db } from '@/api/base44Client';
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Loader2, ExternalLink } from "lucide-react";

import HeroBanner from "../components/college-detail/HeroBanner";
import QuickStats from "../components/college-detail/QuickStats";
import AcceptanceChart from "../components/college-detail/AcceptanceChart";
import DemographicsChart from "../components/college-detail/DemographicsChart";
import TestScoreChart from "../components/college-detail/TestScoreChart";

const TABS = [
  { key: "Overview",          icon: "🏠" },
  { key: "Admissions",        icon: "🎯" },
  { key: "Aid & Cost",        icon: "💰" },
  { key: "Academics",         icon: "📚" },
  { key: "Outcomes",          icon: "📈" },
  { key: "Campus Life",       icon: "🏘️" },
];

// ── Shared primitives ─────────────────────────────────────────────────────────

function SectionCard({ title, icon, children }) {
  return (
    <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
      {title && (
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <span>{icon}</span> {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function StatRow({ label, value, highlight, sub }) {
  if (value === "N/A" || value == null || value === "") return null;
  return (
    <div className="flex items-start justify-between gap-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <div>
        <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{label}</span>
        {sub && <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>{sub}</p>}
      </div>
      <span className="text-sm font-semibold text-right" style={{ color: highlight || "white" }}>{value}</span>
    </div>
  );
}

function ProgressBar({ label, value, color = "rgba(192,132,252,0.85)", sub }) {
  if (value == null) return null;
  const pct = Math.min(Math.round(value), 100);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.75)" }}>
        <span>{label}{sub && <span className="ml-1" style={{ color: "rgba(255,255,255,0.4)" }}>({sub})</span>}</span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function BigStat({ label, value, sub, color }) {
  if (!value || value === "N/A") return null;
  return (
    <div className="p-4 rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}>
      <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: color || "white" }}>{value}</p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{sub}</p>}
    </div>
  );
}

function DeadlineRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{label}</span>
      <span className="text-sm font-semibold px-2.5 py-0.5 rounded-lg" style={{ backgroundColor: "rgba(251,191,36,0.15)", color: "rgba(252,211,77,1)", border: "1px solid rgba(251,191,36,0.25)" }}>
        {value}
      </span>
    </div>
  );
}

function YesNoBadge({ value }) {
  const isYes = value === true || value === "Y" || value === "Yes";
  if (value == null) return null;
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
      style={isYes
        ? { backgroundColor: "rgba(110,231,183,0.18)", color: "rgba(110,231,183,1)", border: "1px solid rgba(110,231,183,0.3)" }
        : { backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.15)" }
      }>
      {isYes ? "Yes" : "No"}
    </span>
  );
}

// ── CollegeDetail page ────────────────────────────────────────────────────────

export default function CollegeDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");

  // Use listAll so bypassed quality filter doesn't hide schools we navigate to directly
  const { data: college, isLoading } = useQuery({
    queryKey: ["college", id],
    queryFn: async () => {
      const all = await db.entities.College.get(id);
      return all ?? null;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-white/60" />
      </div>
    );
  }

  if (!college) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-2xl">🏛️</p>
        <p style={{ color: "rgba(255,255,255,0.7)" }}>College not found.</p>
        <Link to="/universities" className="text-sm px-4 py-2 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white" }}>
          Back to University Hub
        </Link>
      </div>
    );
  }

  // ── Formatters ──────────────────────────────────────────────────────────────
  const fmt  = n  => n != null ? `$${Number(n).toLocaleString()}` : null;
  const fmtK = n  => n != null ? `$${Math.round(Number(n) / 1000)}k` : null;
  const pct  = n  => n != null ? `${Math.round(n * 100)}%` : null;
  const pctD = n  => n != null ? `${Math.round(n)}%` : null;   // value already 0-100
  const num  = n  => n != null ? Number(n).toLocaleString() : null;
  const ratio= n  => n != null ? `${n}:1` : null;
  const rate = n  => n != null ? `${Math.round(n * 100)}%` : null;

  const acceptColor = a =>
    a == null ? "white" :
    a < 0.1  ? "rgba(248,113,113,1)" :
    a < 0.25 ? "rgba(251,191,36,1)" :
    a < 0.5  ? "rgba(110,231,183,1)" :
    "rgba(110,231,183,0.8)";

  return (
    <div className="min-h-screen pb-16">
      <HeroBanner college={college} />
      <QuickStats college={college} />

      {/* Tab nav */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-6">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
              style={activeTab === tab.key
                ? { backgroundColor: "rgba(255,255,255,0.88)", color: "#6b4d9e" }
                : { backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.15)" }
              }
            >
              <span>{tab.icon}</span> {tab.key}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* ──────────── OVERVIEW ──────────── */}
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-0">

              {college.description && (
                <SectionCard title="About" icon="📖">
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>{college.description}</p>
                </SectionCard>
              )}

              <SectionCard title="Quick Facts" icon="⚡">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <StatRow label="Control Type"          value={college.control_type} />
                  <StatRow label="Setting"               value={college.setting ? `${college.setting} Campus` : null} />
                  <StatRow label="Gender Setting"        value={college.gender_setting} />
                  <StatRow label="Primary Focus"         value={college.primary_focus} />
                  <StatRow label="Predominant Degree"    value={college.predominant_degree} />
                  <StatRow label="Region"                value={college.region} />
                  <StatRow label="Undergrad Enrollment"  value={num(college.undergrad_enrollment)} />
                  <StatRow label="Grad Enrollment"       value={num(college.grad_enrollment)} />
                  <StatRow label="Total Enrollment"      value={num(college.total_enrollment)} />
                  <StatRow label="Student:Faculty Ratio" value={ratio(college.student_faculty_ratio)} />
                  <StatRow label="Full-time Faculty"     value={college.ft_faculty_rate != null ? `${Math.round(college.ft_faculty_rate * 100)}%` : null} />
                  <StatRow label="% Women"               value={pctD(college.pct_women)} />
                  <StatRow label="% Part-time Students"  value={pct(college.pct_part_time)} />
                  <StatRow label="% First Generation"    value={pct(college.pct_first_generation)} />
                  <StatRow label="% International"       value={
                    college.pct_intl_students_scorecard != null ? pct(college.pct_intl_students_scorecard) :
                    college.pct_intl_students           != null ? pctD(college.pct_intl_students) : null
                  } />
                  <StatRow label="Campus Housing"        value={college.campus_housing ? "Available" : null} />
                  <StatRow label="Varsity Sports"        value={college.varsity_sports ? "Yes (NCAA)" : null} />
                </div>
              </SectionCard>

              {college.popular_programs?.length > 0 && (
                <SectionCard title="Popular Programs" icon="🎓">
                  <div className="flex flex-wrap gap-2">
                    {college.popular_programs.map(p => (
                      <span key={p} className="px-3 py-1.5 rounded-lg text-xs"
                        style={{ backgroundColor: "rgba(192,132,252,0.15)", color: "rgba(220,180,255,0.9)", border: "1px solid rgba(192,132,252,0.25)" }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </SectionCard>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Acceptance at a glance */}
              <SectionCard title="Selectivity" icon="🎯">
                <div className="text-center py-2">
                  <p className="text-4xl font-bold" style={{ color: acceptColor(college.acceptance_rate) }}>
                    {college.acceptance_rate != null ? `${Math.round(college.acceptance_rate * 100)}%` : "N/A"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>acceptance rate</p>
                </div>
                {college.intl_acceptance_rate != null && (
                  <StatRow label="Intl Acceptance Rate" value={`${Math.round(college.intl_acceptance_rate * 100)}%`} highlight="rgba(96,165,250,1)" />
                )}
                <StatRow label="Testing Policy" value={college.testing_policy} />
              </SectionCard>

              {/* Key cost */}
              <SectionCard title="Estimated Cost" icon="💰">
                {[
                  { label: "Avg COA After Aid",  value: fmt(college.avg_coa_after_aid),   highlight: "rgba(110,231,183,1)", sub: "Intl-specific" },
                  { label: "Avg Net Price",       value: fmt(college.avg_annual_cost),     highlight: "rgba(110,231,183,1)", sub: "Scorecard" },
                  { label: "Avg Intl Aid / yr",   value: fmt(college.avg_aid_intl),        highlight: "rgba(192,132,252,1)" },
                  { label: "Out-of-State Tuition",value: fmt(college.tuition_out_of_state) },
                ].map(r => <StatRow key={r.label} {...r} />)}
              </SectionCard>

              {/* Website */}
              {college.website_url && (
                <a
                  href={college.website_url.startsWith("http") ? college.website_url : `https://${college.website_url}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-medium transition-opacity hover:opacity-85"
                  style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  <ExternalLink className="w-4 h-4" /> Visit Official Website
                </a>
              )}
            </div>
          </div>
        )}

        {/* ──────────── ADMISSIONS ──────────── */}
        {activeTab === "Admissions" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-0">
              <AcceptanceChart college={college} />
              <TestScoreChart college={college} />

              <SectionCard title="Acceptance Rates" icon="📊">
                <div>
                  <StatRow label="Overall Acceptance Rate"    value={rate(college.acceptance_rate)}      highlight={acceptColor(college.acceptance_rate)} />
                  <StatRow label="International Acceptance"   value={college.intl_acceptance_rate != null ? `${Math.round(college.intl_acceptance_rate * 100)}%` : null} highlight="rgba(96,165,250,1)" />
                  <StatRow label="Intl Applicants"            value={num(college.intl_applicants)} />
                  <StatRow label="Intl Admitted"              value={num(college.intl_admitted)} />
                  <StatRow label="Intl Enrolled"              value={num(college.intl_enrolled)} />
                  <StatRow label="Intl Yield Rate"            value={college.intl_yield != null ? `${Math.round(college.intl_yield * 100)}%` : null} highlight="rgba(192,132,252,1)" />
                </div>
              </SectionCard>

              <SectionCard title="Application Deadlines" icon="📅">
                <div>
                  <DeadlineRow label="Early Decision (ED)"     value={college.ed_deadline} />
                  <DeadlineRow label="Early Decision II"       value={college.ed2_deadline} />
                  <DeadlineRow label="Early Action (EA)"       value={college.ea_deadline} />
                  <DeadlineRow label="Early Action II"         value={college.ea2_deadline} />
                  <DeadlineRow label="Restrictive EA (REA)"    value={college.rea_deadline} />
                  <DeadlineRow label="Regular Decision / Rolling" value={college.rd_deadline} />
                </div>
                {!college.ed_deadline && !college.ea_deadline && !college.rd_deadline && (
                  <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>Deadline data not yet available — visit the school's website.</p>
                )}
              </SectionCard>

              <SectionCard title="Testing & Requirements" icon="📝">
                <div>
                  <StatRow label="Testing Policy"         value={college.testing_policy} highlight={
                    college.testing_policy === "Test-Optional" ? "rgba(252,211,77,1)" :
                    college.testing_policy === "Test-Free"     ? "rgba(110,231,183,1)" :
                    college.testing_policy === "Required"      ? "rgba(248,113,113,1)" : "white"
                  } />
                  <StatRow label="SAT/ACT Used"           value={college.sat_act_used} />
                  <div className="flex items-center justify-between gap-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Personal Essay Required</span>
                    {college.personal_essay_required != null && <YesNoBadge value={college.personal_essay_required} />}
                  </div>
                  <StatRow label="Teacher Recommendations" value={college.teacher_recs_required} />
                  <StatRow label="Other Recommendations"   value={college.other_recs_required} />
                  <div className="flex items-center justify-between gap-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Counselor Recommendation</span>
                    {college.counselor_rec_required != null && <YesNoBadge value={college.counselor_rec_required} />}
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Mid-Year Report Required</span>
                    {college.mid_year_report != null && <YesNoBadge value={college.mid_year_report} />}
                  </div>
                  <StatRow label="Portfolio Supplement"    value={college.supplements_portfolio} />
                  <StatRow label="Writing Supplements"     value={college.supplements_writing} />
                  <StatRow label="Intl Doc Requirements"   value={college.intl_doc_requirements} />
                </div>
              </SectionCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <SectionCard title="Application Fees" icon="💳">
                <StatRow label="US Citizens"              value={college.app_fee_us   ? `$${college.app_fee_us}`   : null} />
                <StatRow label="International Students"   value={college.app_fee_intl ? `$${college.app_fee_intl}` : null} />
                {college.uses_common_app && (
                  <div className="mt-3 px-3 py-2 rounded-xl text-xs text-center" style={{ backgroundColor: "rgba(0,107,214,0.15)", color: "rgba(147,197,253,1)", border: "1px solid rgba(0,107,214,0.25)" }}>
                    ✓ Accepts Common App
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Class Profile" icon="📐">
                <StatRow label="SAT Math (mid 50%)"     value={college.sat_math_range} />
                <StatRow label="SAT Reading (mid 50%)"  value={college.sat_reading_range} />
                <StatRow label="ACT Composite (mid 50%)" value={college.act_range} />
                <StatRow label="GPA Average"            value={college.avg_gpa} />
              </SectionCard>

              <SectionCard title="Retention" icon="🔄">
                <div className="text-center py-2">
                  <p className="text-3xl font-bold" style={{ color: "rgba(110,231,183,1)" }}>
                    {college.retention_rate != null ? `${Math.round(college.retention_rate * 100)}%` : "N/A"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>1-year retention rate</p>
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {/* ──────────── AID & COST ──────────── */}
        {activeTab === "Aid & Cost" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-0">

              {/* Aid policy banner */}
              {(college.need_blind_intl || college.need_blind_us || college.meets_full_need) && (
                <div className="rounded-2xl p-5 mb-5 flex flex-wrap gap-3" style={{ background: "linear-gradient(135deg, rgba(52,211,153,0.12), rgba(110,231,183,0.05))", border: "1px solid rgba(52,211,153,0.3)" }}>
                  {college.need_blind_intl  && <span className="text-sm font-semibold" style={{ color: "rgba(110,231,183,1)" }}>🌍 Need-Blind for International Students</span>}
                  {college.need_blind_us    && <span className="text-sm font-semibold" style={{ color: "rgba(147,197,253,1)" }}>🇺🇸 Need-Blind for US Citizens</span>}
                  {college.meets_full_need  && <span className="text-sm font-semibold" style={{ color: "rgba(110,231,183,1)" }}>✓ Meets 100% of Demonstrated Need</span>}
                </div>
              )}

              <SectionCard title="Cost Breakdown" icon="🧾">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <StatRow label="Avg COA After Aid"        value={fmt(college.avg_coa_after_aid)}       highlight="rgba(110,231,183,1)" sub="International-specific" />
                  <StatRow label="Avg Net Price (Scorecard)" value={fmt(college.avg_annual_cost)}         highlight="rgba(110,231,183,1)" />
                  <StatRow label="In-State Tuition"         value={fmt(college.tuition_in_state)} />
                  <StatRow label="Out-of-State Tuition"     value={fmt(college.tuition_out_of_state)} />
                  <StatRow label="Room & Board (on-campus)"  value={fmt(college.room_board_oncampus)} />
                  <StatRow label="Books & Supplies"         value={fmt(college.books_supplies_cost)} />
                  <StatRow label="Other On-Campus Expenses" value={fmt(college.other_expenses_oncampus)} />
                  <StatRow label="Avg Intl Aid / Year"      value={fmt(college.avg_aid_intl)}             highlight="rgba(192,132,252,1)" />
                  <StatRow label="Intl Aid Type"            value={college.intl_aid_type} />
                  <StatRow label="% Intl Receiving Aid"     value={pctD(college.pct_intl_receiving_aid)}  highlight="rgba(192,132,252,1)" />
                  <StatRow label="Largest Merit Scholarship" value={fmt(college.largest_merit_scholarship)} highlight="rgba(251,191,36,1)" />
                  <StatRow label="Pell Grant Recipients"    value={pctD(college.pct_receiving_pell)} />
                  <StatRow label="Federal Loan Rate"        value={rate(college.federal_loan_rate)} />
                  <StatRow label="Median Debt at Graduation" value={fmt(college.median_debt_graduation)} />
                  <StatRow label="3-yr Loan Repayment Rate" value={pct(college.loan_repayment_rate)} />
                </div>
              </SectionCard>

              {/* Visual aid bars */}
              {(college.pct_intl_receiving_aid != null || college.pct_receiving_pell != null || college.federal_loan_rate != null) && (
                <SectionCard title="Aid Distribution" icon="📊">
                  {college.pct_intl_receiving_aid != null && (
                    <ProgressBar label="International Students Receiving Aid" value={college.pct_intl_receiving_aid} color="rgba(192,132,252,0.85)" />
                  )}
                  {college.pct_receiving_pell != null && (
                    <ProgressBar label="Pell Grant Recipients" value={college.pct_receiving_pell} color="rgba(110,231,183,0.8)" />
                  )}
                  {college.federal_loan_rate != null && (
                    <ProgressBar label="Federal Loan Utilization" value={Math.round(college.federal_loan_rate * 100)} color="rgba(96,165,250,0.8)" />
                  )}
                  {college.loan_repayment_rate != null && (
                    <ProgressBar label="3-Year Loan Repayment Rate" value={Math.round(college.loan_repayment_rate * 100)} color="rgba(251,191,36,0.8)" />
                  )}
                </SectionCard>
              )}

              {/* How to apply for aid */}
              {college.how_to_apply_aid && (
                <SectionCard title="How to Apply for Aid" icon="📋">
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>{college.how_to_apply_aid}</p>
                </SectionCard>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <SectionCard title="At a Glance" icon="💡">
                <div className="space-y-3 py-1">
                  <div className="text-center p-3 rounded-xl" style={{ backgroundColor: "rgba(192,132,252,0.12)", border: "1px solid rgba(192,132,252,0.25)" }}>
                    <p className="text-2xl font-bold" style={{ color: "rgba(220,180,255,1)" }}>
                      {college.avg_aid_intl ? fmtK(college.avg_aid_intl) : "N/A"}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>avg intl aid / yr</p>
                  </div>
                  <div className="text-center p-3 rounded-xl" style={{ backgroundColor: "rgba(110,231,183,0.1)", border: "1px solid rgba(110,231,183,0.25)" }}>
                    <p className="text-2xl font-bold" style={{ color: "rgba(110,231,183,1)" }}>
                      {college.avg_coa_after_aid ? fmtK(college.avg_coa_after_aid) :
                       college.avg_annual_cost   ? fmtK(college.avg_annual_cost) :
                       college.tuition_out_of_state ? fmtK(college.tuition_out_of_state) : "N/A"}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>est. annual cost</p>
                  </div>
                </div>
              </SectionCard>

              {college.budget_category && (
                <SectionCard title="Budget Category" icon="🏷️">
                  <p className="text-2xl font-bold text-center py-1" style={{ color: "rgba(252,211,77,1)" }}>
                    {fmtK(college.budget_category)}
                  </p>
                  <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.45)" }}>estimated total budget / yr</p>
                </SectionCard>
              )}

              {college.website_url && (
                <a href={college.website_url.startsWith("http") ? college.website_url : `https://${college.website_url}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-medium transition-opacity hover:opacity-85"
                  style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}>
                  Check Aid on Website →
                </a>
              )}
            </div>
          </div>
        )}

        {/* ──────────── ACADEMICS ──────────── */}
        {activeTab === "Academics" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-0">
              <TestScoreChart college={college} />

              <SectionCard title="Academic Profile" icon="🏫">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <StatRow label="Predominant Degree"       value={college.predominant_degree} />
                  <StatRow label="Primary Focus"            value={college.primary_focus} />
                  <StatRow label="Student:Faculty Ratio"    value={ratio(college.student_faculty_ratio)} />
                  <StatRow label="Full-time Faculty"        value={college.ft_faculty_rate != null ? `${Math.round(college.ft_faculty_rate * 100)}%` : null} />
                  <StatRow label="1-Year Retention Rate"    value={rate(college.retention_rate)}  highlight="rgba(110,231,183,1)" />
                  <StatRow label="6-Year Graduation Rate"   value={rate(college.graduation_rate)} highlight="rgba(192,132,252,1)" />
                  <StatRow label="Testing Policy"           value={college.testing_policy} />
                  <StatRow label="SAT/ACT Used"             value={college.sat_act_used} />
                  <StatRow label="Carnegie Classification"  value={college.carnegie_basic != null ? `Code ${college.carnegie_basic}` : null} />
                </div>
              </SectionCard>

              {college.popular_programs?.length > 0 && (
                <SectionCard title="Popular Programs & Majors" icon="📚">
                  <div className="flex flex-wrap gap-2">
                    {college.popular_programs.map(p => (
                      <span key={p} className="px-3 py-1.5 rounded-lg text-sm"
                        style={{ backgroundColor: "rgba(192,132,252,0.15)", color: "rgba(220,180,255,0.9)", border: "1px solid rgba(192,132,252,0.25)" }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </SectionCard>
              )}

              <SectionCard title="Retention & Graduation" icon="🎓">
                {college.graduation_rate != null && (
                  <ProgressBar label="6-Year Graduation Rate" value={Math.round(college.graduation_rate * 100)} color="rgba(192,132,252,0.8)" />
                )}
                {college.retention_rate != null && (
                  <ProgressBar label="1-Year Retention Rate" value={Math.round(college.retention_rate * 100)} color="rgba(110,231,183,0.8)" />
                )}
              </SectionCard>
            </div>

            <div className="space-y-5">
              <SectionCard title="Test Score Ranges" icon="📐">
                <StatRow label="SAT Math (mid 50%)"      value={college.sat_math_range} />
                <StatRow label="SAT Reading (mid 50%)"   value={college.sat_reading_range} />
                <StatRow label="ACT Composite (mid 50%)" value={college.act_range} />
                <StatRow label="Avg GPA"                 value={college.avg_gpa} />
              </SectionCard>

              <SectionCard title="Graduation Rates" icon="📊">
                <div className="text-center py-2">
                  <p className="text-4xl font-bold" style={{ color: "rgba(192,132,252,1)" }}>
                    {college.graduation_rate != null ? `${Math.round(college.graduation_rate * 100)}%` : "N/A"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>6-year grad rate</p>
                </div>
                <div className="text-center py-2 mt-2">
                  <p className="text-3xl font-bold" style={{ color: "rgba(110,231,183,1)" }}>
                    {college.retention_rate != null ? `${Math.round(college.retention_rate * 100)}%` : "N/A"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>1-year retention</p>
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {/* ──────────── OUTCOMES ──────────── */}
        {activeTab === "Outcomes" && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <BigStat label="6-yr Graduation Rate" value={rate(college.graduation_rate)} sub="of enrolled students"  color="rgba(110,231,183,1)" />
              <BigStat label="1-yr Retention Rate"  value={rate(college.retention_rate)}  sub="stay after 1st year"  color="rgba(192,132,252,1)" />
              <BigStat label="Median Earnings"       value={fmtK(college.median_earnings_10yr)} sub="10 yrs after entry" color="rgba(251,191,36,1)" />
              <BigStat label="Loan Repayment"        value={pct(college.loan_repayment_rate)} sub="3-year rate"        color="rgba(96,165,250,1)" />
            </div>

            <SectionCard title="Student Success" icon="🏆">
              <div className="space-y-2 mb-4">
                {college.graduation_rate  != null && <ProgressBar label="6-Year Graduation Rate" value={Math.round(college.graduation_rate  * 100)} color="rgba(110,231,183,0.8)" />}
                {college.retention_rate   != null && <ProgressBar label="1-Year Retention Rate"  value={Math.round(college.retention_rate   * 100)} color="rgba(192,132,252,0.8)" />}
                {college.loan_repayment_rate != null && <ProgressBar label="3-Year Loan Repayment" value={Math.round(college.loan_repayment_rate * 100)} color="rgba(96,165,250,0.8)" />}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <StatRow label="Median Earnings (6yr)"    value={fmt(college.median_earnings_6yr)}   highlight="rgba(251,191,36,0.9)" />
                <StatRow label="Median Earnings (10yr)"   value={fmt(college.median_earnings_10yr)}  highlight="rgba(251,191,36,1)" />
                <StatRow label="Median Debt at Graduation" value={fmt(college.median_debt_graduation)} />
                <StatRow label="Federal Loan Rate"        value={rate(college.federal_loan_rate)} />
                <StatRow label="Pell Grant Recipients"    value={pctD(college.pct_receiving_pell)} />
                <StatRow label="% Students w/ Loans"      value={pctD(college.pct_students_with_loans)} />
              </div>
            </SectionCard>
          </div>
        )}

        {/* ──────────── CAMPUS LIFE ──────────── */}
        {activeTab === "Campus Life" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-0">
              <DemographicsChart college={college} />

              <SectionCard title="Enrollment Breakdown" icon="👥">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <StatRow label="Total Enrollment"        value={num(college.total_enrollment)} />
                  <StatRow label="Undergrad Enrollment"    value={num(college.undergrad_enrollment)} />
                  <StatRow label="Graduate Enrollment"     value={num(college.grad_enrollment)} />
                  <StatRow label="% Women"                 value={pctD(college.pct_women)}                 highlight="rgba(192,132,252,1)" />
                  <StatRow label="% International"         value={
                    college.pct_intl_students_scorecard != null ? pct(college.pct_intl_students_scorecard) :
                    college.pct_intl_students           != null ? pctD(college.pct_intl_students) : null
                  } highlight="rgba(96,165,250,1)" />
                  <StatRow label="% Non-Resident Alien"    value={pct(college.pct_non_resident_alien)}     highlight="rgba(96,165,250,0.8)" />
                  <StatRow label="% First Generation"      value={pct(college.pct_first_generation)} />
                  <StatRow label="% Part-time Students"    value={pct(college.pct_part_time)} />
                  <StatRow label="% Receiving Pell Grants" value={pctD(college.pct_receiving_pell)} />
                  <StatRow label="Gender Setting"          value={college.gender_setting} />
                </div>
              </SectionCard>

              {/* Institution flags */}
              {(college.is_hbcu || college.is_hispanic_serving || college.is_tribal || college.is_aapi_serving) && (
                <SectionCard title="Institution Designation" icon="🏛️">
                  <div className="flex flex-wrap gap-2">
                    {college.is_hbcu             && <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "rgba(239,68,68,0.18)", color: "rgba(252,165,165,1)", border: "1px solid rgba(239,68,68,0.3)" }}>Historically Black College/University (HBCU)</span>}
                    {college.is_hispanic_serving && <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "rgba(251,146,60,0.18)", color: "rgba(253,186,116,1)", border: "1px solid rgba(251,146,60,0.3)" }}>Hispanic-Serving Institution (HSI)</span>}
                    {college.is_tribal           && <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "rgba(161,120,80,0.25)", color: "rgba(217,187,155,1)", border: "1px solid rgba(161,120,80,0.35)" }}>Tribal College or University</span>}
                    {college.is_aapi_serving     && <span className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: "rgba(20,184,166,0.18)", color: "rgba(94,234,212,1)", border: "1px solid rgba(20,184,166,0.3)" }}>Asian American & Pacific Islander Serving (AANAPISI)</span>}
                  </div>
                </SectionCard>
              )}

              {/* Race/ethnicity bars */}
              {(college.pct_white != null || college.pct_asian != null || college.pct_hispanic != null || college.pct_black != null) && (
                <SectionCard title="Racial / Ethnic Breakdown" icon="🎨">
                  <div className="space-y-2">
                    {college.pct_white    != null && <ProgressBar label="White"                    value={college.pct_white}    color="rgba(148,163,184,0.8)" />}
                    {college.pct_hispanic != null && <ProgressBar label="Hispanic / Latino"        value={college.pct_hispanic} color="rgba(251,191,36,0.8)" />}
                    {college.pct_black    != null && <ProgressBar label="Black / African American" value={college.pct_black}    color="rgba(110,231,183,0.8)" />}
                    {college.pct_asian    != null && <ProgressBar label="Asian"                    value={college.pct_asian}    color="rgba(192,132,252,0.8)" />}
                    {college.pct_intl_students != null && <ProgressBar label="International" value={college.pct_intl_students} color="rgba(96,165,250,0.8)" />}
                  </div>
                </SectionCard>
              )}
            </div>

            <div className="space-y-5">
              <SectionCard title="Campus Facts" icon="🏠">
                <StatRow label="Setting"          value={college.setting ? `${college.setting} Campus` : null} />
                <StatRow label="Campus Housing"   value={college.campus_housing ? "Available" : null} />
                <StatRow label="Varsity Sports"   value={college.varsity_sports ? "Yes (NCAA)" : null} />
                <StatRow label="Primary Focus"    value={college.primary_focus} />
                <StatRow label="Religious Affil." value={college.religious_affiliation && college.religious_affiliation !== 0 ? "See hero badge" : "Non-sectarian"} />
              </SectionCard>

              <SectionCard title="International Community" icon="🌐">
                <div className="text-center py-2">
                  <p className="text-3xl font-bold" style={{ color: "rgba(96,165,250,1)" }}>
                    {college.pct_intl_students_scorecard != null
                      ? `${Math.round(college.pct_intl_students_scorecard * 100)}%`
                      : college.pct_intl_students != null
                      ? `${Math.round(college.pct_intl_students)}%`
                      : "N/A"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>international students</p>
                </div>
                {college.intl_enrolled != null && (
                  <StatRow label="Intl Students Enrolled" value={num(college.intl_enrolled)} />
                )}
              </SectionCard>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

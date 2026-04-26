import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown } from "lucide-react";

// ── Static data ───────────────────────────────────────────────────────────────

const NEED_MEETING_SCHOOLS = [
  "Amherst College", "Williams College", "Bowdoin College", "Middlebury College",
  "Vassar College", "Colby College", "Bates College", "Hamilton College",
  "Colgate University", "Trinity College", "Union College", "Wesleyan University",
  "Davidson College", "Haverford College", "Swarthmore College", "Bryn Mawr College",
  "Smith College", "Mount Holyoke College", "Wellesley College", "Grinnell College",
  "Oberlin College", "Carleton College", "Macalester College", "Reed College",
  "Colorado College", "Pomona College", "Harvey Mudd College", "Claremont McKenna College",
  "Scripps College", "Pitzer College",
  "Harvard University", "Princeton University", "Yale University", "Columbia University",
  "Massachusetts Institute of Technology", "Stanford University", "University of Pennsylvania", "Dartmouth College",
  "Brown University", "Cornell University", "Duke University", "Northwestern University",
  "Johns Hopkins University", "Rice University", "Vanderbilt University",
  "University of Notre Dame", "Georgetown University", "Wake Forest University",
];

const QS_TOP = [
  { name: "Massachusetts Institute of Technology", rank: 1,  score: "QS #1"  },
  { name: "Stanford University",                   rank: 3,  score: "QS #3"  },
  { name: "Harvard University",                    rank: 5,  score: "QS #5"  },
  { name: "California Institute of Technology",    rank: 10, score: "QS #10" },
  { name: "University of Chicago",                 rank: 13, score: "QS #13" },
  { name: "University of Pennsylvania",            rank: 15, score: "QS #15" },
  { name: "Cornell University",                    rank: 16, score: "QS #16" },
  { name: "University of California-Berkeley",     rank: 17, score: "QS #17" },
  { name: "Yale University",                       rank: 21, score: "QS #21" },
  { name: "Johns Hopkins University",              rank: 24, score: "QS #24" },
  { name: "Columbia University",                   rank: 26, score: "QS #26" },
  { name: "Princeton University",                  rank: 28, score: "QS #28" },
  { name: "Duke University",                       rank: 32, score: "QS #32" },
  { name: "Northwestern University",               rank: 35, score: "QS #35" },
  { name: "Carnegie Mellon University",            rank: 50, score: "QS #50" },
];

const USNEWS_TOP = [
  { name: "Princeton University",                  rank: 1         },
  { name: "Massachusetts Institute of Technology", rank: 2         },
  { name: "Harvard University",                    rank: 3         },
  { name: "Stanford University",                   rank: 4         },
  { name: "Yale University",                       rank: 5         },
  { name: "California Institute of Technology",    rank: "6 (tie)" },
  { name: "Duke University",                       rank: "6 (tie)" },
  { name: "Johns Hopkins University",              rank: "6 (tie)" },
  { name: "Northwestern University",               rank: "6 (tie)" },
  { name: "University of Pennsylvania",            rank: 10        },
  { name: "Dartmouth College",                     rank: 11        },
  { name: "Brown University",                      rank: 12        },
  { name: "Vanderbilt University",                 rank: 13        },
  { name: "Rice University",                       rank: 14        },
  { name: "Washington University in St Louis",     rank: 15        },
  { name: "Cornell University",                    rank: 16        },
  { name: "Notre Dame University",                 rank: 17        },
  { name: "Columbia University",                   rank: 18        },
  { name: "Georgetown University",                 rank: 19        },
  { name: "University of Michigan-Ann Arbor",      rank: 20        },
];

const LIBERAL_ARTS_TOP = [
  { name: "Williams College",          rank: 1         },
  { name: "Amherst College",           rank: 2         },
  { name: "Swarthmore College",        rank: 3         },
  { name: "Bowdoin College",           rank: "5 (tie)" },
  { name: "Pomona College",            rank: "5 (tie)" },
  { name: "Wellesley College",         rank: 7         },
  { name: "Carleton College",          rank: "8 (tie)" },
  { name: "Claremont McKenna College", rank: "8 (tie)" },
  { name: "Middlebury College",        rank: 11        },
  { name: "Vassar College",            rank: 12        },
  { name: "Colby College",             rank: 13        },
  { name: "Haverford College",         rank: 14        },
  { name: "Davidson College",          rank: 15        },
  { name: "Hamilton College",          rank: 16        },
  { name: "Colgate University",        rank: 17        },
  { name: "Grinnell College",          rank: 18        },
  { name: "Harvey Mudd College",       rank: 19        },
  { name: "Smith College",             rank: 20        },
];

const ZERO_FEE_SCHOOLS = [
  "Adams State University", "Albion College", "Albright College", "Alfred University",
  "Allegheny College", "Alma College", "Amherst College", "Andrews University",
  "Agnes Scott College", "Bard College", "Bates College", "Beloit College",
  "Bowdoin College", "Brandeis University", "Bryn Mawr College", "Carleton College",
  "Claremont McKenna College", "Colby College", "College of the Atlantic",
  "Colorado College", "Connecticut College", "Davidson College", "Denison University",
  "DePauw University", "Dickinson College", "Franklin & Marshall College",
  "Gettysburg College", "Goucher College", "Grinnell College", "Gustavus Adolphus College",
  "Hamilton College", "Hampden-Sydney College", "Hampshire College", "Haverford College",
  "Hendrix College", "Hobart and William Smith Colleges", "Kalamazoo College",
  "Kenyon College", "Knox College", "Lake Forest College", "Lawrence University",
  "Lewis & Clark College", "Luther College", "Macalester College", "Marlboro College",
  "Middlebury College", "Mills College", "Morehouse College", "Mount Holyoke College",
  "Muhlenberg College", "Oberlin College", "Occidental College", "Ohio Wesleyan University",
  "Pitzer College", "Pomona College", "Reed College", "Rhodes College",
  "Rollins College", "Saint John's College", "Sarah Lawrence College",
  "Scripps College", "Sewanee", "Skidmore College", "Smith College",
  "Spelman College", "St. Olaf College", "Swarthmore College",
  "Trinity College", "Union College", "University of Puget Sound",
  "Ursinus College", "Vassar College", "Wabash College", "Warren Wilson College",
  "Washington and Lee University", "Wellesley College", "Wesleyan University",
  "Wheaton College", "Whitman College", "Willamette University",
  "Williams College", "Wittenberg University", "Wofford College",
];

const HIGH_AID_GENEROUS = [
  { name: "Amherst College",                      avg_aid: 74000 },
  { name: "Williams College",                      avg_aid: 70000 },
  { name: "Pomona College",                        avg_aid: 66000 },
  { name: "Swarthmore College",                    avg_aid: 64000 },
  { name: "Harvard University",                    avg_aid: 62000 },
  { name: "Princeton University",                  avg_aid: 61000 },
  { name: "Yale University",                       avg_aid: 60000 },
  { name: "Massachusetts Institute of Technology", avg_aid: 57000 },
  { name: "Columbia University",                   avg_aid: 56000 },
  { name: "Dartmouth College",                     avg_aid: 55000 },
  { name: "Brown University",                      avg_aid: 54000 },
  { name: "Bowdoin College",                       avg_aid: 52000 },
  { name: "Wellesley College",                     avg_aid: 50000 },
  { name: "Vassar College",                        avg_aid: 48000 },
  { name: "Middlebury College",                    avg_aid: 46000 },
  { name: "Colby College",                         avg_aid: 44000 },
  { name: "Grinnell College",                      avg_aid: 43000 },
  { name: "Smith College",                         avg_aid: 42000 },
  { name: "Hamilton College",                      avg_aid: 41000 },
  { name: "Haverford College",                     avg_aid: 40000 },
];

const MERIT_AID_SCHOOLS = [
  { name: "University of Alabama",          note: "Full-ride Capstone scholarships"     },
  { name: "University of Miami",            note: "Stamps, Foote, Provost scholarships" },
  { name: "Case Western Reserve University",note: "Merit aid up to full tuition"        },
  { name: "University of Rochester",        note: "Renaissance Scholars program"        },
  { name: "Tulane University",              note: "Founders, Deans' scholarships"       },
  { name: "Fordham University",             note: "Presidential scholarships"           },
  { name: "Syracuse University",            note: "Chancellor's Award"                  },
  { name: "Butler University",              note: "Presidential & Director awards"      },
  { name: "Lehigh University",              note: "Asa Packer Scholarship"              },
  { name: "Drexel University",              note: "A.J. Drexel Scholarship"             },
  { name: "Northeastern University",        note: "Dean's & Provost Scholarship"        },
  { name: "Elon University",                note: "Merit scholarships available"        },
  { name: "St. John's University",          note: "Millennium Scholarship"              },
  { name: "DePaul University",              note: "Vincent de Paul Scholarship"         },
  { name: "Marquette University",           note: "Ignatius Scholarship"               },
];

// ── Static collections (no dynamic ones — those live in the Guide card) ───────

const COLLECTIONS = [
  {
    id: "meet_need",
    emoji: "💚",
    title: "Meet Full Need for International Students",
    subtitle: "These schools commit to meeting 100% of demonstrated financial need — regardless of citizenship status.",
    color: "rgba(52,211,153,0.15)",
    border: "rgba(52,211,153,0.3)",
    accent: "rgba(110,231,183,1)",
    tag: "Need-Based",
    items: NEED_MEETING_SCHOOLS,
    type: "names",
  },
  {
    id: "high_aid",
    emoji: "💰",
    title: "Most Generous International Aid",
    subtitle: "Schools averaging the highest financial aid packages for international students, sourced from the LilGrant dataset.",
    color: "rgba(96,165,250,0.12)",
    border: "rgba(96,165,250,0.3)",
    accent: "rgba(147,197,253,1)",
    tag: "Avg Aid/yr",
    items: HIGH_AID_GENEROUS,
    type: "aid",
  },
  {
    id: "qs_rank",
    emoji: "🏆",
    title: "QS World Rankings 2026 — Top US Schools",
    subtitle: "The highest-ranked US universities in the 2026 QS World University Rankings.",
    color: "rgba(251,191,36,0.12)",
    border: "rgba(251,191,36,0.3)",
    accent: "rgba(252,211,77,1)",
    tag: "QS Rank",
    items: QS_TOP,
    type: "rank_qs",
  },
  {
    id: "usnews",
    emoji: "📊",
    title: "US News National Universities 2025",
    subtitle: "Top National Universities from the US News & World Report 2025 rankings.",
    color: "rgba(192,132,252,0.12)",
    border: "rgba(192,132,252,0.3)",
    accent: "rgba(216,180,254,1)",
    tag: "US News Rank",
    items: USNEWS_TOP,
    type: "rank_usnews",
  },
  {
    id: "liberal_arts",
    emoji: "📚",
    title: "Top Liberal Arts Colleges",
    subtitle: "US News Top Liberal Arts Colleges — known for small classes, strong financial aid, and personalized education.",
    color: "rgba(244,114,182,0.12)",
    border: "rgba(244,114,182,0.28)",
    accent: "rgba(249,168,212,1)",
    tag: "LAC Rank",
    items: LIBERAL_ARTS_TOP,
    type: "rank_lac",
  },
  {
    id: "merit",
    emoji: "🎖️",
    title: "Strong Merit Aid for International Students",
    subtitle: "Schools known for awarding significant merit-based scholarships that international students can apply for.",
    color: "rgba(251,146,60,0.12)",
    border: "rgba(251,146,60,0.28)",
    accent: "rgba(253,186,116,1)",
    tag: "Merit Aid",
    items: MERIT_AID_SCHOOLS,
    type: "merit",
  },
  {
    id: "zero_fee",
    emoji: "🆓",
    title: "No Application Fee Schools",
    subtitle: "Common App member schools with $0 application fee — ideal for applying to many schools without financial barrier.",
    color: "rgba(167,243,208,0.1)",
    border: "rgba(167,243,208,0.25)",
    accent: "rgba(110,231,183,0.9)",
    tag: "Free Apply",
    items: ZERO_FEE_SCHOOLS,
    type: "names",
  },
];

// ── Internal tabs for the Financial Aid Guide card ────────────────────────────

const AID_GUIDE_TABS = [
  {
    key: "need_blind_intl",
    label: "🌍 Need-Blind Intl",
    description: "Admit international students regardless of ability to pay",
    accent: "rgba(110,231,183,1)",
    filterFn: c => c.need_blind_intl === true,
    sortFn: (a, b) => (a.us_news_rank || 9999) - (b.us_news_rank || 9999),
    extraLabel: c => c.us_news_rank && c.us_news_rank < 2000 ? `#${c.us_news_rank} US News` : null,
  },
  {
    key: "need_blind_us",
    label: "🇺🇸 Need-Blind US",
    description: "Admit US citizens regardless of financial need",
    accent: "rgba(147,197,253,1)",
    filterFn: c => c.need_blind_us === true,
    sortFn: (a, b) => (a.us_news_rank || 9999) - (b.us_news_rank || 9999),
    extraLabel: c => c.us_news_rank && c.us_news_rank < 2000 ? `#${c.us_news_rank} US News` : null,
  },
  {
    key: "golden_gate",
    label: "💛 Golden Gate",
    description: "Schools averaging $20k+ per year in aid for international students",
    accent: "rgba(252,211,77,1)",
    filterFn: c => c.avg_aid_intl && parseFloat(c.avg_aid_intl) >= 20000,
    sortFn: (a, b) => parseFloat(b.avg_aid_intl) - parseFloat(a.avg_aid_intl),
    extraLabel: c => c.avg_aid_intl ? `$${Math.round(parseFloat(c.avg_aid_intl) / 1000)}k avg/yr` : null,
  },
];

// ── Injected CSS for the gold pulse animation ─────────────────────────────────

const GOLD_PULSE_CSS = `
@keyframes goldPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(251,191,36,0); }
  50%       { box-shadow: 0 0 14px 3px rgba(251,191,36,0.28); }
}
.gold-pulse-card { animation: goldPulse 3s ease-in-out infinite; }
`;

// ── SchoolRow — shared row component ─────────────────────────────────────────

function SchoolRow({ index, name, extra, accentColor, college }) {
  return (
    <div
      className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl"
      style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="text-xs font-semibold flex-shrink-0"
          style={{ color: "rgba(255,255,255,0.35)", minWidth: 18 }}
        >
          {index}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{name}</p>
          {extra && (
            <p className="text-[11px] truncate" style={{ color: accentColor }}>{extra}</p>
          )}
        </div>
      </div>
      {college ? (
        <Link
          to={`/universities/${college.id}`}
          className="flex-shrink-0 text-[11px] px-2.5 py-1 rounded-lg transition-opacity hover:opacity-80"
          style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}
        >
          View →
        </Link>
      ) : (
        <span
          className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-lg"
          style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)" }}
        >
          Not in database
        </span>
      )}
    </div>
  );
}

// ── FinancialAidGuideCard ─────────────────────────────────────────────────────

function FinancialAidGuideCard({ colleges }) {
  const [activeTab, setActiveTab] = useState("need_blind_intl");
  const [expanded, setExpanded]   = useState(false);
  const PREVIEW = 6;

  // Pre-compute counts for each tab from the colleges prop
  const tabCounts = useMemo(() => {
    const counts = {};
    for (const tab of AID_GUIDE_TABS) {
      counts[tab.key] = colleges.filter(tab.filterFn).length;
    }
    return counts;
  }, [colleges]);

  const currentTab = AID_GUIDE_TABS.find(t => t.key === activeTab);

  // Build the school list for the active tab
  const displayItems = useMemo(() => {
    if (!currentTab) return [];
    return [...colleges]
      .filter(currentTab.filterFn)
      .sort(currentTab.sortFn)
      .map(college => ({ college }));
  }, [colleges, currentTab]);

  // Reset expand state when tab changes
  const handleTabChange = key => {
    setActiveTab(key);
    setExpanded(false);
  };

  const visible = expanded ? displayItems : displayItems.slice(0, PREVIEW);

  return (
    <>
      <style>{GOLD_PULSE_CSS}</style>
      <div
        className="rounded-2xl overflow-hidden mb-5 gold-pulse-card"
        style={{
          background: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.05))",
          border: "1px solid rgba(251,191,36,0.4)",
        }}
      >
        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">💛</span>
                <h3 className="text-lg font-bold text-white">LilGrant Financial Aid Guide</h3>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                Three curated lists to help you find schools that won't break the bank — sourced from LilGrant's verified dataset of 682 schools.
              </p>
            </div>
            <span
              className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide whitespace-nowrap"
              style={{ backgroundColor: "rgba(251,191,36,0.3)", color: "rgba(252,211,77,1)" }}
            >
              ✨ LilGrant Pick
            </span>
          </div>
        </div>

        {/* ── Internal tab strip ── */}
        <div className="px-5 pb-3">
          <div className="flex flex-wrap gap-2">
            {AID_GUIDE_TABS.map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={
                    isActive
                      ? {
                          backgroundColor: "rgba(251,191,36,0.25)",
                          color: "rgba(252,211,77,1)",
                          border: "1px solid rgba(251,191,36,0.5)",
                        }
                      : {
                          backgroundColor: "rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.55)",
                          border: "1px solid transparent",
                        }
                  }
                >
                  {tab.label}
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] leading-none"
                    style={
                      isActive
                        ? { backgroundColor: "rgba(251,191,36,0.3)", color: "rgba(252,211,77,1)" }
                        : { backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.45)" }
                    }
                  >
                    {tabCounts[tab.key] ?? "—"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active tab description */}
          {currentTab?.description && (
            <p className="mt-2 text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
              {currentTab.description}
            </p>
          )}
        </div>

        {/* ── School list ── */}
        <div className="px-5 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {visible.map(({ college }, i) => (
              <SchoolRow
                key={college.id}
                index={i + 1}
                name={college.name}
                extra={currentTab?.extraLabel(college)}
                accentColor={currentTab?.accent}
                college={college}
              />
            ))}
          </div>

          {displayItems.length > PREVIEW && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-opacity hover:opacity-80"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.75)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {expanded
                ? <><ChevronDown className="w-3.5 h-3.5" /> Show less</>
                : <><ChevronRight className="w-3.5 h-3.5" /> Show all {displayItems.length} schools</>
              }
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ── CollectionCard — for static/curated collections ───────────────────────────

function CollectionCard({ collection, colleges }) {
  const [expanded, setExpanded] = useState(false);
  const PREVIEW = 6;

  const displayItems = useMemo(() => {
    return (collection.items || []).map(item => {
      const name = typeof item === "string" ? item : item.name;
      const college = colleges.find(c =>
        c.name?.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(c.name?.toLowerCase())
      );
      return { item, college };
    });
  }, [collection, colleges]);

  const visible = expanded ? displayItems : displayItems.slice(0, PREVIEW);

  function rowExtra(item, college) {
    switch (collection.type) {
      case "aid":         return item.avg_aid ? `$${(item.avg_aid / 1000).toFixed(0)}k avg` : null;
      case "rank_qs":     return item.score ?? null;
      case "rank_usnews": return `#${item.rank} US News`;
      case "rank_lac":    return `#${item.rank} LAC`;
      case "merit":       return item.note ?? null;
      default:            return null;
    }
  }

  return (
    <div
      className="rounded-2xl overflow-hidden mb-5"
      style={{ backgroundColor: collection.color, border: `1px solid ${collection.border}` }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{collection.emoji}</span>
              <h3 className="text-base font-bold text-white">{collection.title}</h3>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
              {collection.subtitle}
            </p>
          </div>
          <span
            className="flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{ backgroundColor: "rgba(255,255,255,0.15)", color: collection.accent }}
          >
            {displayItems.length} schools
          </span>
        </div>
      </div>

      {/* School list */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {visible.map(({ item, college }, i) => {
            const name  = college?.name ?? (typeof item === "string" ? item : item.name);
            const extra = rowExtra(item, college);
            return (
              <SchoolRow
                key={i}
                index={i + 1}
                name={name}
                extra={extra}
                accentColor={collection.accent}
                college={college}
              />
            );
          })}
        </div>

        {displayItems.length > PREVIEW && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-opacity hover:opacity-80"
            style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            {expanded
              ? <><ChevronDown className="w-3.5 h-3.5 rotate-180" /> Show less</>
              : <><ChevronRight className="w-3.5 h-3.5" /> Show all {displayItems.length} schools</>
            }
          </button>
        )}
      </div>
    </div>
  );
}

// ── CuratedCollections (page section) ────────────────────────────────────────

export default function CuratedCollections({ colleges }) {
  const [activeTab, setActiveTab] = useState("all");

  const OUTER_TABS = [
    { key: "all",      label: "All Collections" },
    { key: "aid",      label: "💰 Financial Aid" },
    { key: "rankings", label: "🏆 Rankings"      },
    { key: "apply",    label: "📋 Application"   },
  ];

  // The guide card shows on "all" and "aid" tabs
  const showGuide = activeTab === "all" || activeTab === "aid";

  const filteredCollections = COLLECTIONS.filter(c => {
    if (activeTab === "all")      return true;
    if (activeTab === "aid")      return ["meet_need", "high_aid", "merit"].includes(c.id);
    if (activeTab === "rankings") return ["qs_rank", "usnews", "liberal_arts"].includes(c.id);
    if (activeTab === "apply")    return ["zero_fee"].includes(c.id);
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">📋</div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Curated School Collections</h2>
        <p className="text-sm max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.65)" }}>
          Hand-curated lists from LilGrant's research, QS World Rankings, Times Higher Education, US News, and Common App data — to help you find the right school faster.
        </p>
      </div>

      {/* Outer tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {OUTER_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={activeTab === t.key
              ? { backgroundColor: "rgba(255,255,255,0.9)", color: "#7a5a9d" }
              : { backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.2)" }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Financial Aid Guide card — always first when visible */}
      {showGuide && <FinancialAidGuideCard colleges={colleges} />}

      {/* Static collection cards */}
      {filteredCollections.map(col => (
        <CollectionCard key={col.id} collection={col} colleges={colleges} />
      ))}
    </div>
  );
}

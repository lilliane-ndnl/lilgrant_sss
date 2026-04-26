import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { CHECKLIST, CHECKLIST_META } from "@/data/dormChecklist";

// ─── XLSX Export ──────────────────────────────────────────────────────────────

function exportToXlsx() {
  const wb = XLSX.utils.book_new();

  CHECKLIST.forEach((section) => {
    const rows = [
      [`${section.emoji} ${section.label}`, "", "", "", ""],
      ["Item", "Where to Buy", "Est. Price (USD)", "Notes", "✓ Done?"],
      ...section.items.map((item) => [
        item.en,
        item.where,
        item.price,
        item.note || "",
        "",
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 46 }, { wch: 38 }, { wch: 20 }, { wch: 44 }, { wch: 10 }];
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
    const sheetName = `${section.id}. ${section.label.split(". ")[1] || section.label}`.slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  const summaryRows = [
    ["LilGrant — International Student Pre-Arrival Checklist"],
    ["by Lilliane · lilgrant.com"],
    [""],
    ["Category", "# Items"],
    ...CHECKLIST.map((s) => [`${s.emoji} ${s.label}`, s.items.length]),
    [""],
    ["TOTAL", CHECKLIST.reduce((acc, s) => acc + s.items.length, 0)],
    [""],
    ["💡 Tip: US dorm beds use XL Twin sizing — standard twin sheets from home will be too short."],
    ["💡 Tip: Most everyday supplies are available at Walmart, Target, or Amazon once you arrive."],
    ["💡 Tip: Bring a 2–3 month supply of medications — some may have different names or require prescriptions in the US."],
    ["💡 Tip: Medicated oil / balm (e.g. Tiger Balm) can be hard to find in the US — worth packing."],
  ];
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);
  summaryWs["!cols"] = [{ wch: 88 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, "📋 Overview");
  wb.SheetNames = ["📋 Overview", ...wb.SheetNames.filter((n) => n !== "📋 Overview")];
  XLSX.writeFile(wb, "LilGrant-PreArrival-Checklist.xlsx");
}

// ─── Dorm Checklist (inline resource) ────────────────────────────────────────

function CategoryTab({ section, active, onClick, doneCount }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
      style={
        active
          ? { background: "rgba(251,146,60,0.15)", color: "rgba(251,146,60,1)", border: "1px solid rgba(251,146,60,0.3)" }
          : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.1)" }
      }
    >
      <span>{section.emoji}</span>
      <span className="hidden sm:inline">{section.label.split(". ")[1] || section.label}</span>
      <span className="inline sm:hidden">{section.id}</span>
      {doneCount > 0 && (
        <span className="text-xs px-1.5 py-0.5 rounded-full font-bold ml-0.5"
          style={{ background: "rgba(52,211,153,0.2)", color: "rgba(52,211,153,1)" }}>
          {doneCount}
        </span>
      )}
    </button>
  );
}

function ChecklistItem({ item, checked, onToggle }) {
  return (
    <div
      className="flex items-start gap-3 py-3 px-3 rounded-xl transition-all cursor-pointer"
      style={{
        background: checked ? "rgba(52,211,153,0.06)" : "transparent",
        border: checked ? "1px solid rgba(52,211,153,0.2)" : "1px solid transparent",
      }}
      onClick={onToggle}
    >
      <div className="flex-shrink-0 w-5 h-5 rounded-md mt-0.5 flex items-center justify-center transition-all"
        style={checked
          ? { background: "rgba(52,211,153,1)", border: "2px solid rgba(52,211,153,1)" }
          : { background: "transparent", border: "2px solid rgba(255,255,255,0.25)" }}>
        {checked && (
          <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
            <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium leading-snug"
          style={{ color: checked ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.9)", textDecoration: checked ? "line-through" : "none" }}>
          {item.en}
        </span>
        <div className="flex flex-wrap gap-x-3 mt-1">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>🛒 {item.where}</span>
          <span className="text-xs font-medium" style={{ color: "rgba(251,146,60,1)" }}>{item.price}</span>
        </div>
        {item.note && (
          <div className="text-xs mt-1.5 px-2 py-1 rounded-lg inline-block"
            style={{ background: "rgba(251,191,36,0.1)", color: "rgba(251,191,36,0.9)" }}>
            💡 {item.note}
          </div>
        )}
      </div>
    </div>
  );
}

function DormChecklist() {
  const [activeSection, setActiveSection] = useState("A");
  const [checked, setChecked] = useState({});
  const [search, setSearch] = useState("");

  const toggle = (key) => setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  const totalItems = useMemo(() => CHECKLIST.reduce((a, s) => a + s.items.length, 0), []);
  const totalDone = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);
  const pct = Math.round((totalDone / totalItems) * 100);
  const currentSection = CHECKLIST.find((s) => s.id === activeSection);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return currentSection?.items || [];
    const q = search.toLowerCase();
    return (currentSection?.items || []).filter((item) =>
      item.en.toLowerCase().includes(q) || item.where?.toLowerCase().includes(q)
    );
  }, [currentSection, search]);

  const sectionDoneCounts = useMemo(() => {
    const counts = {};
    CHECKLIST.forEach((section) => {
      counts[section.id] = section.items.filter((item) => checked[`${section.id}-${item.en}`]).length;
    });
    return counts;
  }, [checked]);

  return (
    <div>
      {/* Progress + export row */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Packing progress</span>
            <span className="text-xs font-bold" style={{ color: totalDone > 0 ? "rgba(52,211,153,1)" : "rgba(255,255,255,0.35)" }}>
              {totalDone} / {totalItems} · {pct}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: "linear-gradient(90deg, rgba(52,211,153,1), rgba(34,197,94,1))" }} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalDone > 0 && (
            <button onClick={() => setChecked({})}
              className="px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
              Reset
            </button>
          )}
          <button onClick={exportToXlsx}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: "rgba(34,197,94,0.12)", color: "rgba(34,197,94,1)", border: "1px solid rgba(34,197,94,0.3)" }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M2 11V13C2 13.55 2.45 14 3 14H13C13.55 14 14 13.55 14 13V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M8 2V10M8 10L5 7M8 10L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download .xlsx
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4"/>
          <path d="M9.5 9.5L12.5 12.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items..."
          className="w-full pl-8 pr-3 py-2 rounded-xl text-sm"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", outline: "none" }} />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
        {CHECKLIST.map((section) => (
          <CategoryTab key={section.id} section={section} active={activeSection === section.id}
            onClick={() => { setActiveSection(section.id); setSearch(""); }}
            doneCount={sectionDoneCounts[section.id]} />
        ))}
      </div>

      {/* Items */}
      {currentSection && (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
          <div className="px-5 py-3 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <h3 className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.9)" }}>
              {currentSection.emoji} {currentSection.label}
            </h3>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              {sectionDoneCounts[currentSection.id]} / {currentSection.items.length}
            </span>
          </div>
          {currentSection.note && (
            <div className="px-5 py-2 text-xs" style={{ background: "rgba(251,191,36,0.06)", color: "rgba(251,191,36,0.8)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              💡 {currentSection.note}
            </div>
          )}
          <div className="px-3 py-2 space-y-0.5">
            {filteredItems.length === 0
              ? <p className="text-sm py-6 text-center" style={{ color: "rgba(255,255,255,0.35)" }}>No items match "{search}"</p>
              : filteredItems.map((item) => {
                  const key = `${currentSection.id}-${item.en}`;
                  return <ChecklistItem key={key} item={item} checked={!!checked[key]} onToggle={() => toggle(key)} />;
                })}
          </div>
        </div>
      )}

      <div className="mt-4 text-center">
        <Link to="/blog/pre-arrival-checklist" className="text-xs"
          style={{ color: "rgba(251,146,60,0.7)" }}>
          📖 Read the full Pre-Arrival Guide →
        </Link>
      </div>
    </div>
  );
}

// ─── Resource card definitions ────────────────────────────────────────────────
// Add new resources here as the library grows.

const RESOURCE_CATEGORIES = [
  {
    id: "arrival",
    label: "Arriving & Moving In",
    emoji: "🛬",
    resources: [
      {
        id: "dorm-checklist",
        emoji: "🧳",
        title: "Pre-Arrival Dorm Checklist",
        description: `${CHECKLIST.reduce((a, s) => a + s.items.length, 0)}-item packing guide across 5 categories — with where to buy and price estimates. Interactive + downloadable as .xlsx.`,
        tags: ["Packing", "Dorm Life", "Checklist"],
        accentColor: "rgba(251,146,60,1)",
        accentBg: "rgba(251,146,60,0.10)",
        component: <DormChecklist />,
      },
    ],
  },
  // Future categories — uncomment and populate as you add resources:
  // { id: "financial", label: "Financial Aid", emoji: "💰", resources: [] },
  // { id: "applications", label: "Applications", emoji: "📋", resources: [] },
  // { id: "visa", label: "Visa & Immigration", emoji: "🛂", resources: [] },
  // { id: "campus", label: "Campus Life", emoji: "🏫", resources: [] },
];

// ─── Resource Card ────────────────────────────────────────────────────────────

function ResourceCard({ resource }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        border: open ? `1px solid ${resource.accentColor}44` : "1px solid rgba(255,255,255,0.1)",
        background: open ? resource.accentBg : "rgba(255,255,255,0.04)",
      }}>
      {/* Card header — always visible */}
      <button className="w-full flex items-start justify-between gap-4 p-5 text-left"
        onClick={() => setOpen((o) => !o)}>
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">{resource.emoji}</span>
          <div>
            <h3 className="text-base font-bold mb-1" style={{ color: "rgba(255,255,255,0.95)" }}>
              {resource.title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              {resource.description}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {resource.tags.map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2 mt-0.5">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
            style={{
              background: open ? resource.accentBg : "rgba(255,255,255,0.08)",
              color: open ? resource.accentColor : "rgba(255,255,255,0.6)",
              border: open ? `1px solid ${resource.accentColor}44` : "1px solid rgba(255,255,255,0.12)",
            }}>
            {open ? "Close ↑" : "Open ↓"}
          </span>
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="px-5 pb-6 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {resource.component}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Resources() {
  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="relative overflow-hidden py-12 mb-10"
        style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(96,165,250,0.05) 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
        {/* Doodles */}
        <svg className="absolute top-4 right-10 opacity-10 pointer-events-none" width="90" height="50" viewBox="0 0 90 50" fill="none">
          <path d="M5,25 Q22,5 40,25 Q58,45 75,25 Q83,15 90,25" stroke="rgba(167,139,250,1)" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <circle cx="5" cy="25" r="3" fill="rgba(167,139,250,1)"/>
          <circle cx="75" cy="25" r="3" fill="rgba(96,165,250,1)"/>
        </svg>
        <svg className="absolute bottom-3 left-12 opacity-10 pointer-events-none" width="55" height="55" viewBox="0 0 55 55" fill="none">
          <path d="M8,48 L14,8 L28,32 L42,5 L48,48" stroke="rgba(251,191,36,1)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-4xl mb-3">📚</div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: "rgba(255,255,255,0.95)" }}>
            Resources
          </h1>
          <p className="text-sm leading-relaxed max-w-xl" style={{ color: "rgba(255,255,255,0.55)" }}>
            Practical tools, checklists, and guides built for international students — from first application to move-in day and beyond. More coming soon.
          </p>
        </div>
      </div>

      {/* Resource categories */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
        {RESOURCE_CATEGORIES.map((category) => (
          <section key={category.id}>
            {/* Category heading */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-lg">{category.emoji}</span>
              <h2 className="text-base font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
                {category.label}
              </h2>
              <div className="flex-1 h-px ml-2" style={{ background: "rgba(255,255,255,0.08)" }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                {category.resources.length} resource{category.resources.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Resource cards */}
            <div className="space-y-3">
              {category.resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </section>
        ))}

        {/* Coming soon placeholder */}
        <div className="rounded-2xl p-8 text-center"
          style={{ border: "1px dashed rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
          <div className="text-3xl mb-3">🔜</div>
          <p className="text-sm font-medium mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
            More resources on the way
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            Financial aid worksheets, application trackers, visa guides, and more — coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC"
];

const REGIONS = ["Northeast","Mid-Atlantic","Southeast","Midwest","Southwest","West"];

const SETTINGS = [
  { key: "City", icon: "🏙️" },
  { key: "Suburb", icon: "🏘️" },
  { key: "Town", icon: "🏡" },
  { key: "Rural", icon: "🌲" },
];

const SORT_OPTIONS = [
  { value: "selective", label: "📈 Most Selective (default)" },
  { value: "rank_asc",  label: "🏆 US News Rank" },
  { value: "cost_asc",  label: "💰 Lowest Cost" },
  { value: "aid_desc",  label: "🌍 Highest Intl Aid" },
  { value: "aid_asc",   label: "Lowest Aid" },
  { value: "pct_desc",  label: "Most % Intl Aid" },
  { value: "name_asc",  label: "Name A→Z" },
  { value: "name_desc", label: "Name Z→A" },
];

function Chip({ label, icon, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap"
      style={selected
        ? { backgroundColor: "rgba(255,255,255,0.92)", color: "#7a5a9d" }
        : { backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.78)", border: "1px solid rgba(255,255,255,0.2)" }
      }
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}

function FilterSection({ title, children }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: "rgba(255,255,255,0.45)" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function RangeSlider({ label, min, max, step, value, onChange, format }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.65)" }}>
        <span>{label}</span>
        <span className="font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>{format(value)}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-white h-1.5"
      />
      <div className="flex justify-between text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

function ActiveFilterBadge({ label, onRemove }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: "rgba(192,132,252,0.25)", color: "rgba(220,180,255,1)", border: "1px solid rgba(192,132,252,0.35)" }}
    >
      {label}
      <button onClick={onRemove} className="hover:opacity-70 transition-opacity">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

export default function UniversitySearchPanel({ filters, onFilterChange, onReset }) {
  const [open, setOpen] = useState(false);

  const handle = (key, value) => onFilterChange({ ...filters, [key]: value });

  // Count active filters (excluding search & sortBy & preset)
  const activeCount = [
    filters.state !== "all" && filters.state,
    filters.region !== "all" && filters.region,
    filters.aid_type !== "all" && filters.aid_type,
    filters.control_type !== "all" && filters.control_type,
    filters.minAid > 0,
    filters.maxCost > 0,
    filters.setting,
    filters.minAccept > 0 || filters.maxAccept < 100,
  ].filter(Boolean).length;

  // Build active filter badges
  const activeBadges = [];
  if (filters.state && filters.state !== "all") activeBadges.push({ label: `State: ${filters.state}`, key: "state", reset: "all" });
  if (filters.region && filters.region !== "all") activeBadges.push({ label: `Region: ${filters.region}`, key: "region", reset: "all" });
  if (filters.aid_type && filters.aid_type !== "all") activeBadges.push({ label: filters.aid_type, key: "aid_type", reset: "all" });
  if (filters.control_type && filters.control_type !== "all") activeBadges.push({ label: filters.control_type, key: "control_type", reset: "all" });
  if (filters.minAid > 0) activeBadges.push({ label: `Min Aid $${(filters.minAid/1000).toFixed(0)}k`, key: "minAid", reset: 0 });
  if (filters.maxCost > 0) activeBadges.push({ label: `Max Cost $${(filters.maxCost/1000).toFixed(0)}k`, key: "maxCost", reset: 0 });
  if (filters.setting) activeBadges.push({ label: `Setting: ${filters.setting}`, key: "setting", reset: "" });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-4">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {/* ── Search bar row ── */}
        <div className="flex items-center gap-3 p-3 sm:p-4">
          {/* Search input */}
          <div
            className="flex items-center gap-2.5 flex-1 px-4 py-2.5 rounded-xl"
            style={{ backgroundColor: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.22)" }}
          >
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.6)" }} />
            <input
              type="text"
              placeholder="Search by name, city, or state…"
              value={filters.search || ""}
              onChange={e => handle("search", e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "rgba(255,255,255,0.92)", caretColor: "white" }}
            />
            {filters.search && (
              <button onClick={() => handle("search", "")} className="hover:opacity-70 transition-opacity">
                <X className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.5)" }} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={filters.sortBy || "selective"}
            onChange={e => handle("sortBy", e.target.value)}
            className="hidden sm:block text-sm rounded-xl px-3 py-2.5 outline-none cursor-pointer"
            style={{ backgroundColor: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.22)", color: "rgba(255,255,255,0.85)" }}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value} style={{ backgroundColor: "#7a5a9d" }}>{o.label}</option>
            ))}
          </select>

          {/* Filters toggle */}
          <button
            onClick={() => setOpen(v => !v)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-shrink-0 relative"
            style={open || activeCount > 0
              ? { backgroundColor: "rgba(255,255,255,0.88)", color: "#7a5a9d" }
              : { backgroundColor: "rgba(255,255,255,0.13)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.22)" }
            }
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeCount > 0 && (
              <span
                className="flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold"
                style={open ? { backgroundColor: "#7a5a9d", color: "white" } : { backgroundColor: "rgba(192,132,252,0.85)", color: "white" }}
              >
                {activeCount}
              </span>
            )}
            {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* ── Active filter badges ── */}
        {activeBadges.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pb-3">
            {activeBadges.map(b => (
              <ActiveFilterBadge key={b.key} label={b.label} onRemove={() => handle(b.key, b.reset)} />
            ))}
            <button
              onClick={() => { onReset(); setOpen(false); }}
              className="text-xs underline transition-opacity hover:opacity-70"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── Expanded filter panel ── */}
        {open && (
          <div
            className="px-5 pb-5 pt-1"
            style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1 mt-4">

              {/* Column 1 */}
              <div>
                <FilterSection title="📍 Location">
                  <div className="space-y-2.5">
                    <select
                      value={filters.state || "all"}
                      onChange={e => handle("state", e.target.value)}
                      className="w-full text-sm rounded-xl px-3 py-2 outline-none cursor-pointer"
                      style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)" }}
                    >
                      <option value="all" style={{ backgroundColor: "#7a5a9d" }}>All States</option>
                      {US_STATES.map(s => <option key={s} value={s} style={{ backgroundColor: "#7a5a9d" }}>{s}</option>)}
                    </select>
                    <select
                      value={filters.region || "all"}
                      onChange={e => handle("region", e.target.value)}
                      className="w-full text-sm rounded-xl px-3 py-2 outline-none cursor-pointer"
                      style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)" }}
                    >
                      <option value="all" style={{ backgroundColor: "#7a5a9d" }}>All Regions</option>
                      {REGIONS.map(r => <option key={r} value={r} style={{ backgroundColor: "#7a5a9d" }}>{r}</option>)}
                    </select>
                  </div>
                </FilterSection>

                <FilterSection title="🏙️ Campus Setting">
                  <div className="flex flex-wrap gap-1.5">
                    {SETTINGS.map(s => (
                      <Chip
                        key={s.key}
                        label={s.key}
                        icon={s.icon}
                        selected={filters.setting === s.key}
                        onClick={() => handle("setting", filters.setting === s.key ? "" : s.key)}
                      />
                    ))}
                  </div>
                </FilterSection>
              </div>

              {/* Column 2 */}
              <div>
                <FilterSection title="🎓 Institution">
                  <div className="space-y-2.5">
                    <div>
                      <p className="text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Type</p>
                      <div className="flex flex-wrap gap-1.5">
                        {["all","Public","Private Non-Profit"].map(v => (
                          <Chip key={v} label={v === "all" ? "Any" : v === "Private Non-Profit" ? "Private" : v}
                            selected={filters.control_type === v}
                            onClick={() => handle("control_type", v)} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Financial Aid Policy</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { v: "all", label: "Any" },
                          { v: "Need-Blind", label: "🟢 Need-Blind" },
                          { v: "Need-Aware", label: "🟡 Need-Aware" },
                        ].map(o => (
                          <Chip key={o.v} label={o.label} selected={filters.aid_type === o.v}
                            onClick={() => handle("aid_type", o.v)} />
                        ))}
                      </div>
                    </div>
                  </div>
                </FilterSection>

                <FilterSection title="📊 Sort By">
                  <select
                    value={filters.sortBy || "selective"}
                    onChange={e => handle("sortBy", e.target.value)}
                    className="w-full text-sm rounded-xl px-3 py-2 outline-none cursor-pointer sm:hidden"
                    style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)" }}
                  >
                    {SORT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value} style={{ backgroundColor: "#7a5a9d" }}>{o.label}</option>
                    ))}
                  </select>
                  <div className="hidden sm:flex flex-wrap gap-1.5">
                    {SORT_OPTIONS.map(o => (
                      <Chip key={o.value} label={o.label} selected={filters.sortBy === o.value}
                        onClick={() => handle("sortBy", o.value)} />
                    ))}
                  </div>
                </FilterSection>
              </div>

              {/* Column 3 */}
              <div>
                <FilterSection title="💰 Financials">
                  <div className="space-y-4">
                    <RangeSlider
                      label="Min Intl Aid"
                      min={0} max={70000} step={2500}
                      value={filters.minAid || 0}
                      onChange={v => handle("minAid", v)}
                      format={v => v === 0 ? "Any" : `$${(v/1000).toFixed(0)}k+`}
                    />
                    <RangeSlider
                      label="Max Annual Net Cost"
                      min={0} max={80000} step={2500}
                      value={filters.maxCost || 0}
                      onChange={v => handle("maxCost", v)}
                      format={v => v === 0 ? "Any" : `≤$${(v/1000).toFixed(0)}k`}
                    />
                  </div>
                </FilterSection>

                <FilterSection title="📈 Acceptance Rate">
                  <RangeSlider
                    label="Max Acceptance Rate"
                    min={0} max={100} step={5}
                    value={filters.maxAccept ?? 100}
                    onChange={v => handle("maxAccept", v)}
                    format={v => v >= 100 ? "Any" : `≤${v}%`}
                  />
                </FilterSection>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {activeCount} filter{activeCount !== 1 ? "s" : ""} active
              </p>
              <div className="flex gap-2">
                {activeCount > 0 && (
                  <button
                    onClick={() => { onReset(); setOpen(false); }}
                    className="px-4 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                    style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.2)" }}
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "rgba(255,255,255,0.88)", color: "#7a5a9d" }}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
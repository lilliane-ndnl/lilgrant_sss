import { db } from '@/api/base44Client';
import { useDebounce } from '@/lib/useDebounce';
import React, { useState, useMemo, useEffect } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Search, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import UniversitySearchPanel from "../components/universities/UniversitySearchPanel";
import CollegeCard from "../components/universities/CollegeCard";

const TABS = [
  {
    key: "all",
    label: "All Schools",
    filter: null,
    description: null,
  },
  {
    key: "need_blind_intl",
    label: "🌍 Need-Blind Intl",
    filter: c => c.need_blind_intl === true,
    description: "Schools that admit international students regardless of financial need",
  },
  {
    key: "need_blind_us",
    label: "🇺🇸 Need-Blind US",
    filter: c => c.need_blind_us === true,
    description: "Schools that admit US citizens regardless of financial need",
  },
  {
    key: "generous_intl",
    label: "💚 Intl Aid Available",
    filter: c => c.is_intl_listed === true,
    description: "Schools with documented international financial aid — 670 schools with verified aid data",
  },
  {
    key: "affordable",
    label: "💰 Affordable",
    filter: c => {
      const cost = parseFloat(c.avg_coa_after_aid || c.avg_annual_cost || c.tuition_out_of_state || 999999);
      return cost < 40000;
    },
    description: "Schools with estimated annual cost under $40,000 (after aid if available, otherwise sticker price)",
  },
];

const DEFAULT_FILTERS = {
  search: "",
  state: "all",
  region: "all",
  aid_type: "all",
  control_type: "all",
  minAid: 0,
  maxCost: 0,
  maxAccept: 100,
  setting: "",
  sortBy: "selective",
  preset: "all",
};

const PAGE_SIZE = 24;

export default function Universities() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const queryClient = useQueryClient();

  // Debounce the search input so the filter pipeline only re-runs 300ms after
  // the user stops typing, instead of on every keystroke.
  const debouncedSearch = useDebounce(filters.search, 300);

  const { data: colleges = [], isLoading } = useQuery({
    queryKey: ["colleges"],
    queryFn: () => db.entities.College.list("-created_date", 5000),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const isAuth = await db.auth.isAuthenticated();
      if (!isAuth) return [];
      return db.entities.Favorite.list();
    },
  });

  const favCollegeIds = useMemo(
    () => new Set(favorites.map((f) => f.college_id)),
    [favorites]
  );

  const toggleFavMutation = useMutation({
    mutationFn: async (college) => {
      const isAuth = await db.auth.isAuthenticated();
      if (!isAuth) {
        db.auth.redirectToLogin(window.location.pathname);
        return;
      }
      const existing = favorites.find((f) => f.college_id === college.id);
      if (existing) {
        await db.entities.Favorite.delete(existing.id);
      } else {
        await db.entities.Favorite.create({
          college_id: college.id,
          college_name: college.name,
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
    onError: () => toast.error("Please sign in to save favorites"),
  });

  // Base pool: 4-year institutions only — computed once when colleges load
  const fourYearColleges = useMemo(
    () => colleges.filter(c =>
      !c.predominant_degree ||
      c.predominant_degree === "Bachelor's" ||
      c.predominant_degree === "Master's" ||
      c.predominant_degree === "Doctoral"
    ),
    [colleges]
  );

  // Badge counts per tab — computed once from the base pool, never recalculated on filter changes
  const tabCounts = useMemo(() => {
    const counts = { all: fourYearColleges.length };
    for (const tab of TABS) {
      if (tab.filter) counts[tab.key] = fourYearColleges.filter(tab.filter).length;
    }
    return counts;
  }, [fourYearColleges]);

  const filtered = useMemo(() => {
    // ── Step 1: apply active tab filter ──────────────────────────────────────
    const activeTab = TABS.find(t => t.key === filters.preset);
    let result = activeTab?.filter
      ? fourYearColleges.filter(activeTab.filter)
      : [...fourYearColleges];

    // ── Step 2: debounced search query ────────────────────────────────────────
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.state?.toLowerCase().includes(q)
      );
    }

    // ── Step 3: sidebar filters ───────────────────────────────────────────────
    if (filters.state !== "all")        result = result.filter(c => c.state === filters.state);
    if (filters.region !== "all")       result = result.filter(c => c.region === filters.region);
    if (filters.aid_type !== "all")     result = result.filter(c => c.aid_type === filters.aid_type);
    if (filters.control_type !== "all") result = result.filter(c => c.control_type === filters.control_type);
    if (filters.minAid > 0)             result = result.filter(c => (c.avg_aid_intl || 0) >= filters.minAid);
    if (filters.maxCost > 0)            result = result.filter(c => c.avg_annual_cost > 0 && c.avg_annual_cost <= filters.maxCost);
    if (filters.maxAccept < 100)        result = result.filter(c => c.acceptance_rate != null && (c.acceptance_rate * 100) <= filters.maxAccept);
    if (filters.setting)                result = result.filter(c => c.setting === filters.setting);

    // ── Step 4: sort ──────────────────────────────────────────────────────────
    const getAcceptRate = c => c.acceptance_rate != null ? c.acceptance_rate : 1.0;
    const getCost       = c => c.avg_coa_after_aid ?? c.avg_annual_cost ?? c.tuition_out_of_state ?? 999999;
    const getAid        = c => c.avg_aid_intl ?? -1;
    const getEarnings   = c => c.median_earnings_10yr ?? -1;

    switch (filters.sortBy) {
      case "selective":
        result.sort((a, b) => getAcceptRate(a) - getAcceptRate(b));
        break;
      case "rank_asc":
      case "rank": {
        const ranked = n => n != null && n < 2000;
        result.sort((a, b) => {
          const aR = ranked(a.us_news_rank), bR = ranked(b.us_news_rank);
          if (aR && bR) return a.us_news_rank - b.us_news_rank;
          if (aR)       return -1;
          if (bR)       return 1;
          return getAcceptRate(a) - getAcceptRate(b);
        });
        break;
      }
      case "affordable":
      case "cost_asc":
        result.sort((a, b) => getCost(a) - getCost(b));
        break;
      case "intl_aid":
      case "aid_desc":
        result.sort((a, b) => getAid(b) - getAid(a));
        break;
      case "aid_asc":
        result.sort((a, b) => getAid(a) - getAid(b));
        break;
      case "outcomes":
      case "pct_desc":
        result.sort((a, b) => getEarnings(b) - getEarnings(a));
        break;
      case "az":
      case "name_asc":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name_desc":
        result.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      default:
        result.sort((a, b) => getAcceptRate(a) - getAcceptRate(b));
    }

    return result;
  }, [
    fourYearColleges,
    debouncedSearch,
    filters.preset,
    filters.state,
    filters.region,
    filters.aid_type,
    filters.control_type,
    filters.minAid,
    filters.maxCost,
    filters.maxAccept,
    filters.setting,
    filters.sortBy,
  ]);

  // Reset pagination whenever the filtered result set changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filtered]);

  return (
    <div className="min-h-screen">
      {/* Header section — matching real site's purple header with emoji icon */}
      <div className="text-center px-4 pt-12 pb-8">
        <div className="text-6xl mb-4">🏛️</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">University Hub</h1>
        <p className="text-sm sm:text-base max-w-xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>
          Explore our comprehensive database of universities across the United States.
          Find detailed information about admission rates, enrollment, costs, and more.
          Use the search filters below to find the perfect university that matches your
          academic goals and preferences.
        </p>
      </div>

      {/* Tools row — Compare & My College List as sub-tools inside the hub */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/compare"
            className="flex items-center gap-4 p-5 rounded-xl transition-all duration-200"
            style={{ backgroundColor: "rgba(192,132,252,0.14)", border: "1px solid rgba(192,132,252,0.3)" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(192,132,252,0.22)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(192,132,252,0.14)"}
          >
            <span className="text-3xl">⚖️</span>
            <div>
              <p className="font-semibold text-white text-sm">Compare Schools</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Side-by-side comparison of up to 4 schools</p>
              <p className="text-xs mt-2" style={{ color: "rgba(192,132,252,0.9)" }}>Open Compare Tool →</p>
            </div>
          </Link>
          <Link to="/rankings"
            className="flex items-center gap-4 p-5 rounded-xl transition-all duration-200"
            style={{ backgroundColor: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(251,191,36,0.18)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(251,191,36,0.1)"}
          >
            <span className="text-3xl">🏆</span>
            <div>
              <p className="font-semibold text-white text-sm">US News Rankings 2026</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Top 150 National Universities & Liberal Arts Colleges</p>
              <p className="text-xs mt-2" style={{ color: "rgba(251,191,36,0.9)" }}>View Rankings →</p>
            </div>
          </Link>
          <Link to="/college-list-builder"
            className="flex items-center gap-4 p-5 rounded-xl transition-all duration-200"
            style={{ backgroundColor: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(251,191,36,0.18)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(251,191,36,0.1)"}
          >
            <span className="text-3xl">✨</span>
            <div>
              <p className="font-semibold text-white text-sm">AI College List Builder</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Personalized Safety / Target / Reach list</p>
              <p className="text-xs mt-2" style={{ color: "rgba(251,191,36,0.9)" }}>Build My List →</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Preset filter tabs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-4">
        <div className="flex flex-wrap gap-2">
          {TABS.map(tab => {
            const isActive = filters.preset === tab.key;
            const count = tabCounts[tab.key];
            return (
              <button
                key={tab.key}
                onClick={() => setFilters(() => ({ ...DEFAULT_FILTERS, preset: tab.key }))}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5"
                style={
                  isActive
                    ? { backgroundColor: "rgba(255,255,255,0.9)", color: "#7a5a9d", fontWeight: 600 }
                    : { backgroundColor: "transparent", color: "rgba(255,255,255,0.78)", border: "1px solid rgba(255,255,255,0.3)" }
                }
              >
                {tab.label}
                {count != null && (
                  <span
                    className="text-xs rounded-full px-1.5 py-0.5 leading-none"
                    style={
                      isActive
                        ? { backgroundColor: "rgba(122,90,157,0.18)", color: "#7a5a9d" }
                        : { backgroundColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.65)" }
                    }
                  >
                    {count.toLocaleString()}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {/* Active tab description */}
        {TABS.find(t => t.key === filters.preset)?.description && (
          <p className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
            {TABS.find(t => t.key === filters.preset).description}
          </p>
        )}
      </div>

      {/* Search + Filter Panel — white-ish panel like real site */}
      <UniversitySearchPanel filters={filters} onFilterChange={setFilters} onReset={() => setFilters(DEFAULT_FILTERS)} />

      {/* Results count */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6 mb-4">
        <p className="text-sm text-center" style={{ color: "rgba(255,255,255,0.65)" }}>
          {isLoading
            ? "Loading..."
            : filtered.length === 0
              ? "No schools match your filters"
              : `Showing ${Math.min(visibleCount, filtered.length).toLocaleString()} of ${filtered.length.toLocaleString()} schools`
          }
        </p>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-white/60" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p style={{ color: "rgba(255,255,255,0.65)" }}>No universities match your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.slice(0, visibleCount).map(college => (
                <CollegeCard
                  key={college.id}
                  college={college}
                  isFavorited={favCollegeIds.has(college.id)}
                  onToggleFavorite={() => toggleFavMutation.mutate(college)}
                />
              ))}
            </div>

            {visibleCount < filtered.length && (
              <div className="flex flex-col items-center gap-2 mt-10">
                <button
                  onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                  className="px-8 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  Load {Math.min(PAGE_SIZE, filtered.length - visibleCount)} more schools
                </button>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {filtered.length - visibleCount} remaining
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Data disclaimer */}
      <div className="text-center pb-10 px-4">
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          Data is sourced from the U.S. Department of Education, Common Application, U.S. News, and other verified sources.<br />
          LilGrant does not claim ownership of this data and presents it for informational purposes.
        </p>
      </div>
    </div>
  );
}
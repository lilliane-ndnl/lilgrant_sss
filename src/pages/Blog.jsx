import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ARTICLES, AUTHOR } from "@/data/articles";
import AuthorAvatar from "@/components/blog/AuthorAvatar";

// ─── Topic filters ─────────────────────────────────────────────────────────
// Each topic maps to a set of article-level tags. An article matches a topic
// if ANY of its tags appear in the topic's tag set.

const TOPICS = [
  {
    id: "all",
    label: "All",
    emoji: "✨",
    tags: null, // null = no filter
  },
  {
    id: "financial-aid",
    label: "Financial Aid",
    emoji: "💰",
    tags: new Set(["Financial Aid", "Award Letters", "Net Cost", "Scholarships", "Need-Blind", "School Selection", "Myths & Facts"]),
  },
  {
    id: "admissions",
    label: "Admissions",
    emoji: "🎓",
    tags: new Set(["Admissions", "Decisions", "Strategy", "IB", "A-Levels", "Transcripts", "Credentials", "Need-Blind"]),
  },
  {
    id: "deadlines",
    label: "Deadlines & Planning",
    emoji: "📅",
    tags: new Set(["May 1", "Deadlines", "Timeline", "Planning", "Grades 9–12", "Emergency Guide"]),
  },
  {
    id: "test-prep",
    label: "Standardized Tests",
    emoji: "📝",
    tags: new Set(["SAT", "ACT", "Test Prep"]),
  },
  {
    id: "after-decisions",
    label: "After Decisions",
    emoji: "🔄",
    tags: new Set(["Gap Year", "Reapply", "Next Steps", "Waitlist"]),
  },
  {
    id: "campus-life",
    label: "Campus Life",
    emoji: "🛬",
    tags: new Set(["Pre-Arrival", "Dorm Life", "Packing Guide"]),
  },
  {
    id: "visa-work",
    label: "Visa & Work",
    emoji: "💼",
    tags: new Set(["F-1 Visa", "Work Authorization", "OPT / CPT"]),
  },
];

// Pre-compute how many articles match each topic
function countForTopic(topic) {
  if (!topic.tags) return ARTICLES.length;
  return ARTICLES.filter((a) => a.tags.some((t) => topic.tags.has(t))).length;
}

// ─── Components ────────────────────────────────────────────────────────────

function TopicChip({ topic, active, onClick }) {
  const count = useMemo(() => countForTopic(topic), [topic]);
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap"
      style={
        active
          ? {
              background: "rgba(167,139,250,0.2)",
              color: "rgba(167,139,250,1)",
              border: "1px solid rgba(167,139,250,0.45)",
            }
          : {
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.55)",
              border: "1px solid rgba(255,255,255,0.1)",
            }
      }
    >
      <span>{topic.emoji}</span>
      <span>{topic.label}</span>
      <span
        className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
        style={
          active
            ? { background: "rgba(167,139,250,0.3)", color: "rgba(167,139,250,1)" }
            : { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }
        }
      >
        {count}
      </span>
    </button>
  );
}

function ArticleCard({ article, searchQuery, activeTopic }) {
  // Highlight matching tag in card when filtered by topic
  const isTagMatch = (tag) =>
    activeTopic?.tags ? activeTopic.tags.has(tag) : false;

  return (
    <Link
      to={`/blog/${article.slug}`}
      className="group block rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = `1px solid ${article.accentColor}55`;
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = `0 12px 40px ${article.accentColor}22`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Hero image */}
      <div className="relative overflow-hidden" style={{ height: 180 }}>
        <img
          src={article.heroImage}
          alt={article.heroAlt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(10,10,20,0.85) 100%)" }} />
        <div className="absolute top-3 left-3 text-xl rounded-xl px-2 py-1"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}>
          {article.emoji}
        </div>
        <div className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "rgba(255,255,255,0.8)" }}>
          {article.readTime}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {article.tags.map((t) => (
            <span
              key={t}
              className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
              style={
                isTagMatch(t)
                  ? { background: "rgba(167,139,250,0.2)", color: "rgba(167,139,250,1)", border: "1px solid rgba(167,139,250,0.3)" }
                  : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.1)" }
              }
            >
              {t}
            </span>
          ))}
        </div>

        <h2 className="text-sm font-bold mb-0.5 leading-snug" style={{ color: "rgba(255,255,255,0.95)" }}>
          {highlight(article.title, searchQuery)}
        </h2>
        <p className="text-xs font-medium mb-2" style={{ color: article.accentColor }}>
          {article.subtitle}
        </p>
        <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: "rgba(255,255,255,0.55)" }}>
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AuthorAvatar size={24} src={article.authorPhoto} />
            <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>{AUTHOR.name}</span>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: article.accentBg, color: article.accentColor, border: `1px solid ${article.accentColor}44` }}>
            Read →
          </span>
        </div>
      </div>
    </Link>
  );
}

// Simple text highlighter — wraps matched chars in a styled <mark>
function highlight(text, query) {
  if (!query || query.trim().length < 2) return text;
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(re);
  return parts.map((part, i) =>
    re.test(part)
      ? <mark key={i} style={{ background: "rgba(251,191,36,0.35)", color: "inherit", borderRadius: "2px" }}>{part}</mark>
      : part
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function Blog() {
  const [activeTopic, setActiveTopic] = useState(TOPICS[0]); // default "All"
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = ARTICLES;

    // Topic filter
    if (activeTopic.tags) {
      result = result.filter((a) => a.tags.some((t) => activeTopic.tags.has(t)));
    }

    // Search filter
    const q = search.trim().toLowerCase();
    if (q.length >= 2) {
      result = result.filter((a) =>
        a.title.toLowerCase().includes(q) ||
        a.subtitle.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [activeTopic, search]);

  return (
    <div className="min-h-screen pb-20">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden py-14 mb-8"
        style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(167,139,250,0.05) 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Doodles */}
        <svg className="absolute top-4 right-8 opacity-10 pointer-events-none" width="120" height="120" viewBox="0 0 120 120" fill="none">
          <path d="M20,60 Q40,20 60,60 Q80,100 100,60" stroke="rgba(167,139,250,1)" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <circle cx="20" cy="60" r="4" fill="rgba(167,139,250,1)"/>
          <circle cx="60" cy="60" r="4" fill="rgba(167,139,250,1)"/>
          <circle cx="100" cy="60" r="4" fill="rgba(167,139,250,1)"/>
          <path d="M50,30 L55,20 L60,30" stroke="rgba(251,191,36,1)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <svg className="absolute bottom-4 left-8 opacity-10 pointer-events-none" width="80" height="80" viewBox="0 0 80 80" fill="none">
          <path d="M10,70 L15,10 L40,50 L65,5 L70,70" stroke="rgba(52,211,153,1)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-5xl mb-4">✍️</div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: "rgba(255,255,255,0.95)" }}>
            LilGrant Blog
          </h1>
          <p className="text-sm max-w-xl mx-auto leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.55)" }}>
            Guides and insights for international students navigating US college applications and financial aid — written by someone who gets it.
          </p>

          {/* ── Search bar ──────────────────────────────────────────── */}
          <div className="relative max-w-md mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
              <path d="M11 11L14 14" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl text-sm"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.9)",
                outline: "none",
                backdropFilter: "blur(8px)",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-lg leading-none"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* ── Topic chips ─────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          {TOPICS.map((topic) => (
            <TopicChip
              key={topic.id}
              topic={topic}
              active={activeTopic.id === topic.id}
              onClick={() => setActiveTopic(topic)}
            />
          ))}
        </div>

        {/* ── Results count ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            {filtered.length === ARTICLES.length
              ? `${ARTICLES.length} articles`
              : `${filtered.length} of ${ARTICLES.length} articles`}
            {activeTopic.id !== "all" && ` · ${activeTopic.emoji} ${activeTopic.label}`}
            {search.trim().length >= 2 && ` · "${search.trim()}"`}
          </p>
          {(activeTopic.id !== "all" || search) && (
            <button
              onClick={() => { setActiveTopic(TOPICS[0]); setSearch(""); }}
              className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ── Article grid ───────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm font-medium mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
              No articles found
            </p>
            <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
              Try a different search term or topic
            </p>
            <button
              onClick={() => { setActiveTopic(TOPICS[0]); setSearch(""); }}
              className="text-xs px-4 py-2 rounded-full"
              style={{ background: "rgba(167,139,250,0.15)", color: "rgba(167,139,250,1)", border: "1px solid rgba(167,139,250,0.3)" }}
            >
              Show all articles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((article) => (
              <ArticleCard
                key={article.slug}
                article={article}
                searchQuery={search.trim()}
                activeTopic={activeTopic}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

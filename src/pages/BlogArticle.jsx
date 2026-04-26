import React, { useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getArticleBySlug, AUTHOR } from "@/data/articles";
import AuthorAvatar from "@/components/blog/AuthorAvatar";

// ─── Decorative SVG doodles ───────────────────────────────────────────────────

function DoodleSpiral({ color = "rgba(167,139,250,0.3)", size = 60 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" className="inline-block">
      <path
        d="M30,30 Q40,10 50,30 Q40,50 30,30 Q20,10 10,30 Q20,50 30,30"
        stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"
      />
    </svg>
  );
}

function DoodleStar({ color = "rgba(251,191,36,0.5)", size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block">
      <path
        d="M12 2L13.4 9.3L20 8L14.8 13.1L17.6 20L12 16.2L6.4 20L9.2 13.1L4 8L10.6 9.3Z"
        fill={color}
      />
    </svg>
  );
}

function DoodleWave({ color = "rgba(52,211,153,0.3)" }) {
  return (
    <svg width="100%" height="12" viewBox="0 0 300 12" preserveAspectRatio="none" fill="none">
      <path
        d="M0,6 Q25,0 50,6 Q75,12 100,6 Q125,0 150,6 Q175,12 200,6 Q225,0 250,6 Q275,12 300,6"
        stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"
      />
    </svg>
  );
}

function DoodleArrow({ color = "rgba(167,139,250,0.6)" }) {
  return (
    <svg width="40" height="20" viewBox="0 0 40 20" fill="none" className="inline-block">
      <path d="M2,10 Q15,4 30,10 L26,6 M30,10 L26,14" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function DoodlePencil({ color = "rgba(251,191,36,0.5)", size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="10" y="4" width="8" height="20" rx="2" fill={color} opacity="0.7"/>
      <polygon points="10,24 18,24 14,30" fill={color} opacity="0.9"/>
      <rect x="10" y="4" width="8" height="4" rx="1" fill="rgba(255,255,255,0.3)"/>
      <line x1="14" y1="8" x2="14" y2="24" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="2 2"/>
    </svg>
  );
}

function DoodleLightbulb({ color = "rgba(251,191,36,0.6)", size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="13" r="7" fill={color} opacity="0.6"/>
      <rect x="13" y="19" width="6" height="3" rx="1" fill={color} opacity="0.8"/>
      <rect x="14" y="22" width="4" height="2" rx="1" fill={color} opacity="0.5"/>
      <line x1="16" y1="4" x2="16" y2="2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="23" y1="7" x2="25" y2="5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="9" y1="7" x2="7" y2="5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function DoodleCheck({ color = "rgba(52,211,153,0.7)", size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className="inline-block flex-shrink-0 mt-0.5">
      <circle cx="10" cy="10" r="9" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5"/>
      <path d="M6,10 L9,13 L14,7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Article-specific rich components ────────────────────────────────────────

function MythCard({ mythNum, mythTitle, totalMyths, realityContent, accentColor, accentBg }) {
  return (
    <div
      className="rounded-2xl overflow-hidden mb-7 mt-2"
      style={{ border: "1px solid rgba(239,68,68,0.22)", background: "rgba(255,255,255,0.025)" }}
    >
      {/* ── Myth label band ─────────────────────────────────── */}
      <div
        className="px-5 pt-4 pb-4"
        style={{ background: "rgba(239,68,68,0.07)", borderBottom: "1px solid rgba(239,68,68,0.1)" }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full tracking-widest"
            style={{
              background: "rgba(239,68,68,0.13)",
              color: "rgba(252,129,129,1)",
              border: "1px solid rgba(239,68,68,0.28)",
            }}
          >
            ✗ &nbsp;MYTH
          </span>
          <span className="text-xs tabular-nums" style={{ color: "rgba(255,255,255,0.2)" }}>
            {mythNum} / {totalMyths}
          </span>
        </div>
        <p className="text-base font-semibold leading-snug" style={{ color: "rgba(255,255,255,0.87)" }}>
          <span
            style={{
              color: "rgba(252,129,129,0.45)",
              fontSize: "1.5em",
              lineHeight: 0.8,
              marginRight: 3,
              fontFamily: "Georgia,serif",
              verticalAlign: "-0.1em",
            }}
          >
            "
          </span>
          {mythTitle}
          <span
            style={{
              color: "rgba(252,129,129,0.45)",
              fontSize: "1.5em",
              lineHeight: 0.8,
              marginLeft: 3,
              fontFamily: "Georgia,serif",
              verticalAlign: "-0.1em",
            }}
          >
            "
          </span>
        </p>
      </div>

      {/* ── Reality section ─────────────────────────────────── */}
      <div className="px-5 pt-4 pb-2">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mb-4 tracking-widest"
          style={{
            background: "rgba(52,211,153,0.1)",
            color: "rgba(52,211,153,0.9)",
            border: "1px solid rgba(52,211,153,0.22)",
          }}
        >
          ✓ &nbsp;THE REALITY
        </span>
        {realityContent}
      </div>
    </div>
  );
}

function TipBlock({ label, body, accentColor, accentBg }) {
  return (
    <div
      className="flex gap-3 mb-4 px-4 py-3.5 rounded-xl"
      style={{
        background: accentBg,
        border: `1px solid ${accentColor.replace("1)", "0.2)")}`,
      }}
    >
      <span style={{ color: accentColor, fontSize: "1em", flexShrink: 0, marginTop: 1 }}>✦</span>
      <div className="text-sm leading-relaxed">
        <span className="font-semibold" style={{ color: "rgba(255,255,255,0.93)" }}>
          {label}
        </span>{" "}
        <span style={{ color: "rgba(255,255,255,0.7)" }}>{renderInline(body, accentColor)}</span>
      </div>
    </div>
  );
}

// ─── Markdown Parser ──────────────────────────────────────────────────────────

function parseMarkdown(raw, accentColor, accentBg) {
  const lines = raw.split("\n");
  const totalMyths = lines.filter((l) => l.startsWith("## Myth #")).length;
  const elements = [];
  let i = 0;
  let listBuffer = [];
  let tableBuffer = [];
  let inTable = false;

  function flushList() {
    if (listBuffer.length === 0) return;
    elements.push(
      <ul key={`ul-${elements.length}`} className="space-y-2 mb-5 pl-1">
        {listBuffer.map(({ text }, idx) => (
          <li key={idx} className="flex items-start gap-2.5">
            <DoodleCheck color={accentColor} size={18} />
            <span className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>
              {renderInline(text, accentColor)}
            </span>
          </li>
        ))}
      </ul>
    );
    listBuffer = [];
  }

  function flushTable() {
    if (tableBuffer.length < 2) return;
    const headers = tableBuffer[0].split("|").map((h) => h.trim()).filter(Boolean);
    const rows = tableBuffer.slice(2).map((row) =>
      row.split("|").map((c) => c.trim()).filter(Boolean)
    );
    elements.push(
      <div key={`tbl-${elements.length}`} className="overflow-x-auto mb-6 rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.06)" }}>
              {headers.map((h, hi) => (
                <th key={hi} className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.55)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {row.map((cell, ci) => (
                  <td key={ci} className="px-4 py-2.5" style={{ color: "rgba(255,255,255,0.8)" }}>
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = [];
    inTable = false;
  }

  while (i < lines.length) {
    const line = lines[i];

    // H1
    if (line.startsWith("# ")) {
      flushList(); flushTable();
      // Skip — we use the article title from metadata
      i++; continue;
    }

    // Myth card  (## Myth #N: "title")
    if (line.startsWith("## Myth #")) {
      flushList(); flushTable();
      const mythNum = (line.match(/## Myth #(\d+)/) || [])[1] || "?";
      const mythTitle = line
        .slice(line.indexOf(": ") + 2)
        .replace(/^"/, "")
        .replace(/"$/, "")
        .trim();
      i++;
      const mythLines = [];
      while (i < lines.length && lines[i].trim() !== "---" && !lines[i].startsWith("## ")) {
        mythLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && lines[i].trim() === "---") i++; // consume trailing separator
      const realityElements = parseMarkdown(mythLines.join("\n"), accentColor, accentBg);
      elements.push(
        <MythCard
          key={`myth-${mythNum}`}
          mythNum={Number(mythNum)}
          mythTitle={mythTitle}
          totalMyths={totalMyths}
          realityContent={realityElements}
          accentColor={accentColor}
          accentBg={accentBg}
        />
      );
      continue;
    }

    // H2
    if (line.startsWith("## ")) {
      flushList(); flushTable();
      const text = line.slice(3);
      const doodles = ["pencil", "star", "wave"];
      const doodleType = doodles[elements.length % 3];
      elements.push(
        <div key={`h2-${i}`} className="mt-10 mb-4">
          <div className="flex items-center gap-2 mb-1">
            {doodleType === "pencil" && <DoodlePencil color={accentColor} size={22} />}
            {doodleType === "star" && <DoodleStar color={accentColor} size={20} />}
            {doodleType === "wave" && <DoodleLightbulb color={accentColor} size={22} />}
            <h2 className="text-xl font-bold" style={{ color: "rgba(255,255,255,0.95)" }}>
              {renderInline(text, accentColor)}
            </h2>
          </div>
          <DoodleWave color={accentColor.replace("1)", "0.25)")} />
        </div>
      );
      i++; continue;
    }

    // H3
    if (line.startsWith("### ")) {
      flushList(); flushTable();
      const text = line.slice(4);
      elements.push(
        <h3 key={`h3-${i}`} className="text-base font-bold mt-6 mb-2" style={{ color: accentColor }}>
          {renderInline(text, accentColor)}
        </h3>
      );
      i++; continue;
    }

    // HR
    if (line.trim() === "---") {
      flushList(); flushTable();
      elements.push(
        <div key={`hr-${i}`} className="my-8 flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
          <DoodleStar color={accentColor} size={16} />
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
        </div>
      );
      i++; continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      flushList(); flushTable();
      const text = line.slice(2);
      elements.push(
        <blockquote
          key={`bq-${i}`}
          className="my-5 pl-4 py-4 pr-4 rounded-r-xl text-sm leading-relaxed"
          style={{
            borderLeft: `3px solid ${accentColor}`,
            background: accentBg,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          <div className="flex items-start gap-2 flex-wrap">
            <DoodleArrow color={accentColor} />
            <span className="flex-1 min-w-0">{renderInline(text, accentColor)}</span>
          </div>
        </blockquote>
      );
      i++; continue;
    }

    // List item
    if (line.startsWith("- ")) {
      flushTable();
      listBuffer.push({ text: line.slice(2) });
      i++; continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      flushList(); flushTable();
      const num = line.match(/^(\d+)\./)[1];
      const text = line.replace(/^\d+\.\s/, "");
      elements.push(
        <div key={`ol-${i}`} className="flex items-start gap-3 mb-3">
          <span
            className="flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mt-0.5"
            style={{ background: accentBg, color: accentColor, border: `1px solid ${accentColor}55` }}
          >
            {num}
          </span>
          <span className="text-sm leading-relaxed pt-0.5" style={{ color: "rgba(255,255,255,0.78)" }}>
            {renderInline(text, accentColor)}
          </span>
        </div>
      );
      i++; continue;
    }

    // Table row
    if (line.startsWith("|")) {
      flushList();
      inTable = true;
      tableBuffer.push(line);
      i++; continue;
    } else if (inTable) {
      flushTable();
    }

    // Empty line
    if (line.trim() === "") {
      flushList();
      i++; continue;
    }

    // Bold-only line (like "**About money:**")
    if (line.match(/^\*\*.*\*\*$/)) {
      flushList(); flushTable();
      const text = line.replace(/^\*\*/, "").replace(/\*\*$/, "");
      elements.push(
        <p key={`bold-${i}`} className="text-sm font-bold mt-4 mb-1.5" style={{ color: "rgba(255,255,255,0.9)" }}>
          {text}
        </p>
      );
      i++; continue;
    }

    // Tip block — **Label.** body text (bold-label paragraph with trailing content)
    const tipM = line.match(/^\*\*([^*]+\.)\*\*\s+(.+)$/);
    if (tipM) {
      flushList(); flushTable();
      elements.push(
        <TipBlock
          key={`tip-${i}`}
          label={tipM[1]}
          body={tipM[2]}
          accentColor={accentColor}
          accentBg={accentBg}
        />
      );
      i++; continue;
    }

    // Regular paragraph
    flushList(); flushTable();
    if (line.trim()) {
      elements.push(
        <p key={`p-${i}`} className="text-sm leading-relaxed mb-4"
          style={{ color: "rgba(255,255,255,0.72)", textAlign: "justify", hyphens: "auto" }}>
          {renderInline(line, accentColor)}
        </p>
      );
    }
    i++;
  }

  flushList();
  flushTable();
  return elements;
}

function InternalLink({ href, children, accent }) {
  return (
    <Link
      to={href}
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all"
      style={{
        background: accent ? `${accent.replace("1)", "0.18)")}` : "rgba(167,139,250,0.18)",
        color: accent || "rgba(167,139,250,1)",
        border: `1px solid ${accent ? accent.replace("1)", "0.35)") : "rgba(167,139,250,0.35)"}`,
        textDecoration: "none",
        verticalAlign: "middle",
        marginLeft: "4px",
      }}
    >
      {children}
    </Link>
  );
}

function renderInline(text, accentColor) {
  // Order matters: bold before italic, links before plain brackets
  const parts = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m;
  let key = 0;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) {
      parts.push(
        <strong key={key++} className="font-semibold" style={{ color: "rgba(255,255,255,0.95)" }}>
          {tok.slice(2, -2)}
        </strong>
      );
    } else if (tok.startsWith("*")) {
      parts.push(
        <em key={key++} style={{ color: "rgba(255,255,255,0.85)" }}>
          {tok.slice(1, -1)}
        </em>
      );
    } else if (tok.startsWith("`")) {
      parts.push(
        <code key={key++} className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.9)" }}>
          {tok.slice(1, -1)}
        </code>
      );
    } else if (tok.startsWith("[")) {
      const linkText = tok.match(/\[([^\]]+)\]/)[1];
      const href = tok.match(/\(([^)]+)\)/)[1];
      const isInternal = href.startsWith("/");
      if (isInternal) {
        parts.push(
          <InternalLink key={key++} href={href} accent={accentColor}>
            {linkText}
          </InternalLink>
        );
      } else {
        parts.push(
          <a key={key++} href={href} target="_blank" rel="noopener noreferrer"
            className="underline underline-offset-2 font-medium" style={{ color: accentColor || "rgba(167,139,250,1)" }}>
            {linkText}
          </a>
        );
      }
    }
    last = m.index + tok.length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : parts;
}

// ─── Main Article Page ────────────────────────────────────────────────────────

export default function BlogArticle() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const article = getArticleBySlug(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-4xl">😕</div>
        <p style={{ color: "rgba(255,255,255,0.6)" }}>Article not found.</p>
        <Link to="/blog" className="underline" style={{ color: "rgba(167,139,250,1)" }}>
          Back to Blog
        </Link>
      </div>
    );
  }

  const bodyElements = useMemo(
    () => parseMarkdown(article.raw, article.accentColor, article.accentBg),
    [article]
  );

  return (
    <div className="min-h-screen pb-20">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ height: "clamp(200px, 28vw, 340px)" }}>
        <img
          src={article.heroImage}
          alt={article.heroAlt}
          className="w-full h-full object-cover"
          style={{ objectPosition: "center 30%" }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,10,20,0.3) 0%, rgba(10,10,20,0.6) 50%, rgba(10,10,20,0.95) 100%)",
          }}
        />

        {/* Floating doodle decorations on hero */}
        <div className="absolute top-6 right-8 opacity-40 pointer-events-none">
          <DoodleSpiral color={article.accentColor} size={80} />
        </div>
        <div className="absolute bottom-12 right-16 opacity-30 pointer-events-none">
          <DoodleStar color="rgba(251,191,36,1)" size={28} />
        </div>
        <div className="absolute top-8 left-12 opacity-30 pointer-events-none">
          <DoodleStar color={article.accentColor} size={16} />
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 max-w-3xl mx-auto">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {article.tags.map((t) => (
              <span
                key={t}
                className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                style={{
                  background: "rgba(0,0,0,0.45)",
                  backdropFilter: "blur(8px)",
                  color: article.accentColor,
                  border: `1px solid ${article.accentColor}44`,
                }}
              >
                {t}
              </span>
            ))}
          </div>

          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-2"
            style={{ color: "rgba(255,255,255,0.97)" }}
          >
            {article.emoji} {article.title}
          </h1>
          <p className="text-base" style={{ color: article.accentColor }}>
            {article.subtitle}
          </p>
        </div>
      </div>

      {/* ── Article body ──────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-8">
        {/* Author + meta bar */}
        <div
          className="flex items-center justify-between py-4 mb-8"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-3">
            <AuthorAvatar size={42} src={article.authorPhoto} />
            <div>
              <div className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
                {AUTHOR.name}
              </div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                {AUTHOR.title} · {new Date(article.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            <span>📖</span>
            <span>{article.readTime}</span>
          </div>
        </div>

        {/* Doodle accent strip */}
        <div className="flex items-center gap-2 mb-8 overflow-hidden opacity-60">
          <DoodleStar color={article.accentColor} size={14} />
          <DoodleWave color={article.accentColor.replace("1)", "0.4)")} />
          <DoodleStar color={article.accentColor} size={14} />
        </div>

        {/* Article content */}
        <article className="leading-7">{bodyElements}</article>

        {/* ── Author card footer ─────────────────────────────────────── */}
        <div
          className="mt-14 rounded-2xl p-6 flex items-start gap-4"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* Decorative doodle behind avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="absolute -inset-1 rounded-full opacity-30"
              style={{ background: `radial-gradient(circle, ${article.accentColor}, transparent)` }}
            />
            <AuthorAvatar size={56} src={article.authorPhoto} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.95)" }}>
                {AUTHOR.name}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: article.accentBg, color: article.accentColor }}
              >
                Author
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              {AUTHOR.title} · Helping international students navigate US college applications and financial aid with real data and honest guidance.
            </p>
          </div>
        </div>

        {/* ── Navigation ───────────────────────────────────────────────── */}
        <div className="mt-10 flex items-center justify-between">
          <Link
            to="/blog"
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-full transition-colors"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.65)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            ← All Articles
          </Link>
          <Link
            to="/universities"
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-full transition-colors"
            style={{
              background: article.accentBg,
              color: article.accentColor,
              border: `1px solid ${article.accentColor}44`,
            }}
          >
            Explore Schools →
          </Link>
        </div>
      </div>
    </div>
  );
}

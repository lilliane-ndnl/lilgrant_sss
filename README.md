<div align="center">

# 🎓 LilGrant

### *Because every student deserves to know who will actually fund their dream.*

**The financial aid intelligence platform built for the 1.1 million international students navigating U.S. college admissions every year.**

<br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Netlify](https://img.shields.io/badge/Deployed-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://www.lilgrant.com)
[![Tests](https://img.shields.io/badge/Tests-53%2F53_Passing-brightgreen?style=for-the-badge&logo=vitest)](./src/tests/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](./LICENSE)

<br/>

**[🌐 Live Demo → www.lilgrant.com](https://www.lilgrant.com)**  &nbsp;|&nbsp;  **[📂 GitHub → lilgrant_sss](https://github.com/lilliane-ndnl/lilgrant_sss)**

</div>

---

## 🏆 Recognition

> **1st Runner-Up — "Make It Happen" Grant**
> *University of Rochester · 2026*
>
> Awarded to projects demonstrating exceptional social impact, technical execution, and real-world problem-solving. LilGrant was recognized for its data-driven approach to democratizing access to U.S. higher education for international students.

---

## 🔍 The Problem vs. The Solution

| ❌ The Problem | ✅ LilGrant's Solution |
|---|---|
| Financial aid data for international students is scattered across hundreds of PDFs and CDS forms | Single searchable database of **1,500+ U.S. colleges** enriched with international-specific aid data |
| Generic college search tools are built for U.S. citizens — international filters don't exist | **700+ institutions** tagged with need-blind/need-aware status, avg. aid amounts, and % of international students receiving aid |
| Students waste months applying to schools that will never fund them | Honest labels like *"Full-Pay School"*, *"Meets Full Need"*, *"Need Aid? Risky Apply"* surface the truth upfront |
| No tool connects financial aid data to application strategy | 21 original long-form guides cover every stage — from school selection to visa and work rules |

---

## ✨ Key Features

### 🏫 Universities Hub
Search and filter **1,500+ colleges** with international-student-specific criteria no other tool provides:
- 🎯 **Aid Type Filter** — Need-Blind vs. Need-Aware vs. Merit-Only
- 💰 **Net Cost Filter** — Average cost *after* international student aid
- 📍 Region, Setting, Acceptance Rate, Test Policy, Enrollment Size
- ⭐ **Curated Collections** — Hand-picked thematic lists (*Best for Financial Aid*, *Hidden Gems*, *Strong Merit Schools*)
- ⚡ **Performance** — Debounced search (300ms), paginated results (24/page), explicit `useMemo` dependencies — renders 24 cards instead of 2,200+ on load

### 🔬 Deep-Dive College Detail Pages
6-tab profiles for every school:
- 📊 Interactive charts: acceptance rates, test score distributions, demographics
- 🏅 Scholarship cards with award range, eligibility, and how-to-apply notes
- ⚠️ International-specific warning tags with plain-English explanations

### ⚖️ Side-by-Side Comparison Tool
Compare up to 4 schools across every metric that matters — net cost, aid type, deadlines, merit scholarships — in a single unified view.

### 🤖 AI College List Builder
A guided prompt flow that generates a personalized college list based on budget, GPA, test scores, and geographic preferences.

### 📊 Custom Rankings Engine
Sortable tables ranking schools by financial aid generosity, net cost for international students, and selectivity — separate views for National Universities and Liberal Arts Colleges.

### 📝 Editorial Content Library — 21 Original Articles
Long-form guides written for international applicants with a custom Markdown renderer featuring:
- 🃏 **Myth Cards** — Fact vs. fiction format for misconception-heavy topics
- 💡 **Tip Blocks** — Highlighted action items
- 🔗 Internal navigation links, author attribution, and decorative illustrations
- 🔍 Tag-based filtering + full-text search across all articles

### 📦 Resources Hub
- Interactive dorm packing checklist with category tabs and live progress tracking
- One-click **XLSX export** for offline use (SheetJS / client-side, no server needed)

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 18 + Vite | Component architecture, hot module replacement |
| **Routing** | React Router v6 | Client-side SPA navigation |
| **Styling** | Tailwind CSS + Radix UI (shadcn/ui) | Utility-first styling with accessible primitives |
| **Data Layer** | Static JSON (bundled) | 1,500+ colleges, zero backend latency |
| **Content** | Custom Markdown Renderer | No external library — hand-built parser with rich components |
| **Export** | SheetJS (xlsx) | Client-side Excel generation, no server |
| **Testing** | Vitest + @testing-library/react | 53 unit tests — pure functions + React hooks |
| **Deployment** | Netlify CI/CD via GitHub | Auto-deploy on every push to `main` |

---

## 📐 Architecture

```
.github/
└── PULL_REQUEST_TEMPLATE.md   # Checklist: tests, mobile, data integrity
src/
├── content/articles/          # 21 original markdown guides
├── data/
│   ├── articles.js            # Article metadata + Vite ?raw imports
│   ├── colleges-*.json        # Enriched college dataset (2,200+ schools)
│   └── dormChecklist.js       # Structured checklist data
├── lib/
│   ├── filterEngine.js        # Pure scoring/filtering functions (exported, tested)
│   ├── dataValidator.js       # College record validation + database audit
│   └── useDebounce.js         # Generic debounce hook (300ms default)
├── tests/
│   └── filterEngine.test.js   # 53 unit tests (Vitest)
├── pages/                     # Route-level components (Universities, Blog, Compare, etc.)
├── components/
│   ├── college-detail/        # 6 tab components + Recharts visualizations
│   ├── universities/          # Filter sidebar, college cards, curated collections
│   └── layout/                # Navbar, footer, app shell
└── scripts/                   # Node.js data enrichment pipeline (ESM)
```

### Data Pipeline

The college dataset was assembled from multiple public sources through a custom enrichment pipeline:

1. **IPEDS / College Scorecard API** — enrollment, tuition, test scores, graduation rates, earnings
2. **Common Data Set (Section H)** — international aid amounts, % receiving aid, aid type per institution
3. **US News Rankings (2026)** — National Universities + Liberal Arts Colleges
4. **Manual verification** — need-blind/need-aware status, scholarship details, `intl_tags` for nuanced warnings

---

## 🧪 Testing & Data Integrity

LilGrant treats financial aid data as high-stakes information — a wrong number could send a student to the wrong school. The core filtering and scoring engine is covered by a unit test suite built with Vitest.

### Run Tests
```bash
npm run test        # watch mode
npm run test:run    # single run with coverage
```

### What's Tested
| Module | Tests | Purpose |
|---|---|---|
| `filterEngine.js` | 38 tests | Budget filtering, scoring algorithm, categorization, formatting, input sanitization |
| `dataValidator.js` | 9 tests | Data quality checks, duplicate detection |
| `useDebounce.js` | 2 tests | Initial value, timer-controlled debounce via fake timers |
| `sanitizeSearchInput` | 7 tests | XSS stripping, whitespace normalization, type guards, length cap |
| **Total** | **53 / 53 passing** | |

### Data Validation
A dedicated validator runs against the full 2,200+ school dataset and flags:
- Acceptance rates outside 0–1 range
- Aid amounts exceeding total cost of attendance
- Suspiciously low graduation rates
- Duplicate school entries

---

## 🔬 Data Methodology

LilGrant's dataset was assembled through a multi-source enrichment pipeline — not a single API call.

### Sources & Trust Hierarchy

| Priority | Source | Data Points | Schools |
|---|---|---|---|
| 1 (Primary) | College Scorecard API (IPEDS) | Tuition, enrollment, test scores, earnings, demographics | 2,262 |
| 2 | Common Data Set (Section H) — manual research | Intl aid amounts, % receiving aid, aid type, scholarship details | 682 |
| 3 | US News Rankings 2026 | NU + LAC rankings | 351 |
| 4 | Common App member list | Application requirements, deadlines, fees | 1,051 |
| 5 | Manual verification | Need-blind/need-aware status, scholarship URLs | 11 need-blind intl |

### Why Manual Research for International Aid?

No public API provides international student financial aid data. The 682-school international aid dataset was built by:

1. Cross-referencing each school's Common Data Set (Section H)
2. Verifying against institutional financial aid pages
3. Flagging discrepancies with a `data_source` field per record
4. Timestamping each record with `intl_data_updated` for transparency on data freshness

### Honest Data Gaps

LilGrant displays `—` (not `N/A`) when data is genuinely unavailable, and links directly to the school's financial aid page so students can verify themselves. Schools without acceptance rate data are excluded from browsing (but retained in the database) to prevent misleading "open admission" schools from appearing in filtered results.

---

## 🗺️ Roadmap

| Status | Feature |
|---|---|
| ✅ Live | University Hub with 2,200+ schools |
| ✅ Live | International aid data for 682 schools |
| ✅ Live | College List Builder (11-step wizard) |
| ✅ Live | US News Rankings engine |
| ✅ Live | Golden Gate curated collections |
| ✅ Live | Unit test suite (Vitest — 53 tests passing) |
| ✅ Live | Universities Hub pagination (24/page + Load More) |
| ✅ Live | Debounced search + optimized `useMemo` dependencies |
| ✅ Live | Input sanitization on all search fields (XSS-safe) |
| ✅ Live | GitHub PR template with testing + data integrity checklist |
| 🔄 In Progress | Hero images via Wikipedia API |
| 📋 Planned | Scholarship database |
| 📋 Planned | Application profile / extracurricular enhancer |
| 📋 Planned | Bi-annual data refresh pipeline (March + September) |

---

## 🌐 Try It Live

Visit **[www.lilgrant.com](https://www.lilgrant.com)** to explore the full application.

> ⚠️ This repository is public for portfolio and review purposes only. Cloning, forking, or reusing any part of this codebase is not permitted. See [LICENSE](./LICENSE) for details.

---

## 💡 About the Builder

<div align="center">

**Built by Lilliane Nguyen**

*Finance & Accounting student at the University of Rochester — using technology to solve real problems at the intersection of education access and financial equity.*

As an international student herself, Lilliane went through the US college admissions process without a single tool that honestly answered the question: ***"Which schools will actually give me money?"***

LilGrant is the tool she wished had existed.

</div>

---

<div align="center">

© 2026 Lilliane Nguyen · All Rights Reserved · [www.lilgrant.com](https://www.lilgrant.com)

*Proprietary software — no reproduction or reuse permitted without written consent.*

</div>

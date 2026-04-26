# LilGrant — College Financial Aid Discovery for International Students

> **Find US colleges that will actually fund your education.**

LilGrant is a full-stack data product and editorial platform built specifically for international students navigating US college admissions and financial aid. It combines a curated database of 680+ institutions with rich filtering, school comparison, AI-assisted list building, and an original content library of 21 long-form guides.

---

## Live Demo

🌐 [lilgrant.netlify.app](https://lilgrant.netlify.app) *(Netlify — auto-deploys on push)*

---

## What It Does

Most college search tools are built for US citizens. Financial aid data for international students is scattered, incomplete, and buried in PDFs. LilGrant solves this by:

- Surfacing which schools offer need-blind vs. need-aware admissions for international students
- Showing average aid amounts, percentage of international students receiving aid, and net cost after awards
- Tagging schools with honest labels like *"Full-Pay School"*, *"Meets Full Need"*, *"Need Aid? Risky Apply"*
- Letting students filter, compare, and build a college list based on affordability — not just rankings

---

## Key Features

### 🏫 Universities Hub
- **680+ colleges** with enriched financial aid data for international students
- Filter by aid type (need-blind / need-aware / merit), region, acceptance rate, test policy, COA, setting
- Live search with instant results
- **Curated Collections** — hand-picked thematic lists (e.g. *"Best for Financial Aid"*, *"Hidden Gems"*)

### 🔍 College Detail Pages
- 6-tab deep-dive: Overview, Academics, Financial Aid, Admissions, Campus, and About
- Charts for acceptance rates, test score distributions, and demographic breakdown
- Scholarship cards with scholarship name, award range, and how-to-apply notes
- International-specific tags and honest warnings where relevant

### ⚖️ Compare Tool
- Side-by-side comparison of up to 4 schools across all key metrics
- Net cost, aid type, merit scholarships, deadlines — in one view

### 🤖 AI College List Builder
- Guided prompt flow that generates a personalized college list based on budget, GPA, test scores, and preferences

### 📊 Rankings
- Custom rankings by financial aid generosity, net cost for international students, and selectivity
- Separate tables for National Universities and Liberal Arts Colleges

### 📝 Blog — 21 Original Articles
- Long-form guides written for international applicants covering financial aid, admissions strategy, extracurriculars, essays, standardized testing, and visa/work rules
- Custom markdown renderer with rich components: **Myth Cards** (for fact-vs-myth articles), **Tip Blocks**, author attribution, doodle decorations, and internal navigation links
- Tag-based filtering and full-text search

### 📦 Resources Hub
- Interactive dorm packing checklist with category tabs and progress tracking
- One-click XLSX export for offline use
- Expandable card layout ready for future resources

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + Vite |
| **Routing** | React Router v6 |
| **Styling** | Tailwind CSS + custom inline styles |
| **UI Components** | shadcn/ui (Radix UI primitives) |
| **Data** | Static JSON (680+ colleges, enriched from IPEDS / College Scorecard / Common Data Sets) |
| **Content** | Markdown files with custom renderer (no external MD library) |
| **Export** | SheetJS (xlsx) for client-side Excel generation |
| **Deployment** | Netlify (CI/CD via GitHub) |

---

## Project Structure

```
src/
├── content/articles/     # 21 markdown articles
├── data/
│   ├── articles.js       # Article metadata + raw imports
│   ├── colleges-*.json   # Enriched college dataset (680+ schools)
│   └── dormChecklist.js  # Structured checklist data
├── pages/                # Route-level components
│   ├── Universities.jsx
│   ├── CollegeDetail.jsx
│   ├── Blog.jsx / BlogArticle.jsx
│   ├── Rankings.jsx
│   ├── Compare.jsx
│   ├── CollegeListBuilder.jsx
│   └── Resources.jsx
├── components/
│   ├── college-detail/   # 7 tab components + charts
│   ├── universities/     # Filter sidebar, college cards, collections
│   ├── blog/             # Author avatar
│   └── layout/           # Navbar, footer, app shell
└── scripts/              # Data enrichment + processing scripts
```

---

## Data Pipeline

The college dataset was built from multiple public sources and enriched through a multi-stage pipeline:

1. **Base data** — IPEDS via College Scorecard API (enrollment, tuition, test scores, graduation rates)
2. **Aid data** — Common Data Set Section H (international aid amounts, % receiving aid, aid type)
3. **Rankings** — US News National Universities and Liberal Arts Colleges (2026)
4. **Manual enrichment** — Need-blind/need-aware status, scholarship details, application deadlines, early decision policies, `intl_tags` for nuanced labeling

Scripts live in `/scripts/` and are written as ES modules for Node.js.

---

## Running Locally

```bash
git clone https://github.com/lilliane-ndnl/lilgrant_sss.git
cd lilgrant_sss
npm install
npm run dev
```

No environment variables required — all data is bundled statically.

---

## About

Built by **Lilliane Nguyen** — an international student who went through the US college admissions process and couldn't find a single tool that honestly answered the question: *"Which schools will actually give me money?"*

LilGrant is the tool she wished had existed.

---

© 2026 Lilliane Nguyen. All rights reserved.

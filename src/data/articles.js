// Article metadata — hero images sourced from Unsplash (free to use)
// Raw markdown content imported from src/content/articles/

import article1Raw from "../content/articles/article-1-decision-guide.md?raw";
import article2Raw from "../content/articles/article-2-reading-aid-letters.md?raw";
import article3Raw from "../content/articles/article-3-complete-timeline.md?raw";
import article4Raw from "../content/articles/article-4-need-blind-vs-need-aware.md?raw";
import article5Raw from "../content/articles/article-5-gap-year-or-reapply.md?raw";
import article6Raw from "../content/articles/article-6-pre-arrival-checklist.md?raw";
import article7Raw from "../content/articles/article-7-missed-may1-deadline.md?raw";
import article8Raw from "../content/articles/article-8-waitlist-guide.md?raw";
import article9Raw from "../content/articles/article-9-most-financial-aid.md?raw";
import article10Raw from "../content/articles/article-10-sat-vs-act.md?raw";
import article11Raw from "../content/articles/article-11-international-credentials.md?raw";
import article12Raw from "../content/articles/article-12-truth-about-scholarships.md?raw";
import article13Raw from "../content/articles/article-13-international-students-work.md?raw";
import article14Raw from "../content/articles/article-14-extracurriculars-that-impress.md?raw";
import article15Raw from "../content/articles/article-15-extracurriculars-with-limited-options.md?raw";
import article16Raw from "../content/articles/article-16-starting-club-for-application.md?raw";
import article17Raw from "../content/articles/article-17-summer-programs.md?raw";
import article18Raw from "../content/articles/article-18-how-us-admissions-works.md?raw";
import article19Raw from "../content/articles/article-19-college-essay-international.md?raw";
import article20Raw from "../content/articles/article-20-recommendation-letters.md?raw";
import article21Raw from "../content/articles/article-21-demonstrated-interest.md?raw";

export const AUTHOR = {
  name: "Lilliane",
  title: "Founder, LilGrant",
  defaultPhoto: "/authors/Avatar - about section.jpg",
  avatarFallback: "L",
};

export const ARTICLES = [
  {
    slug: "decision-guide",
    file: "article-1-decision-guide.md",
    title: "You Got Into Multiple US Colleges — Now What?",
    subtitle: "A Decision Guide for International Students",
    excerpt:
      "Congratulations — you got in. Maybe to two schools. Maybe to five. Now comes the part nobody prepares you for: actually choosing. For international students, this decision is more complex than it looks.",
    heroImage:
      "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=1400&q=85&auto=format&fit=crop",
    heroAlt: "Student excitedly reading college acceptance letter",
    authorPhoto: "/authors/main.jpg",
    tags: ["Decisions", "Financial Aid", "May 1"],
    readTime: "7 min read",
    date: "2026-04-25",
    emoji: "🎉",
    accentColor: "rgba(167,139,250,1)",
    accentBg: "rgba(167,139,250,0.12)",
    raw: article1Raw,
  },
  {
    slug: "reading-aid-letters",
    file: "article-2-reading-aid-letters.md",
    title: "How to Read a US Financial Aid Award Letter",
    subtitle: "A plain-English guide for international students",
    excerpt:
      "Your award letter arrived. It's got a lot of numbers on it. Before you celebrate — or despair — you need to understand what these numbers actually mean. US aid letters are notoriously confusing.",
    heroImage:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1400&q=85&auto=format&fit=crop",
    heroAlt: "Person reviewing financial documents and paperwork at a desk",
    authorPhoto: "/authors/f57acca9e3c4629a3bd54.jpg",
    tags: ["Financial Aid", "Award Letters", "Net Cost"],
    readTime: "8 min read",
    date: "2026-04-25",
    emoji: "📄",
    accentColor: "rgba(52,211,153,1)",
    accentBg: "rgba(52,211,153,0.12)",
    raw: article2Raw,
  },
  {
    slug: "complete-timeline",
    file: "article-3-complete-timeline.md",
    title: "The Complete Timeline for International Students",
    subtitle: "When to start — and what to do at every stage",
    excerpt:
      "Most international students start thinking about US college applications too late. Not by a few weeks — by a year or two. Here's the timeline that actually works, from 9th grade to visa appointment.",
    heroImage:
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1400&q=85&auto=format&fit=crop",
    heroAlt: "Notebook and calendar for planning and scheduling",
    authorPhoto: "/authors/d4dcb28b9ae61bb842f731.jpg",
    tags: ["Timeline", "Planning", "Grades 9–12"],
    readTime: "9 min read",
    date: "2026-04-25",
    emoji: "📅",
    accentColor: "rgba(251,191,36,1)",
    accentBg: "rgba(251,191,36,0.12)",
    raw: article3Raw,
  },
  {
    slug: "need-blind-vs-need-aware",
    file: "article-4-need-blind-vs-need-aware.md",
    title: "Need-Blind vs Need-Aware",
    subtitle: "What international students must know before applying",
    excerpt:
      'If you\'re researching US colleges, you\'ve seen "need-blind admissions" on school websites. For domestic students, it\'s common. For international students, it is extraordinarily rare — and the difference could change which schools you apply to.',
    heroImage:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1400&q=85&auto=format&fit=crop",
    heroAlt: "University campus gates and entrance",
    authorPhoto: "/authors/5c5a2bb104dc8582dccd11.jpg",
    tags: ["Need-Blind", "Admissions", "Financial Aid"],
    readTime: "8 min read",
    date: "2026-04-25",
    emoji: "⚖️",
    accentColor: "rgba(96,165,250,1)",
    accentBg: "rgba(96,165,250,0.12)",
    raw: article4Raw,
  },
  {
    slug: "gap-year-or-reapply",
    file: "article-5-gap-year-or-reapply.md",
    title: "Gap Year or Reapply?",
    subtitle: "A practical guide for international students who didn't get in",
    excerpt:
      "If rejection letters arrived this cycle, this article is for you. First: you're allowed to feel bad about this. Then come back here — because your options are better than you might think.",
    heroImage:
      "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1400&q=85&auto=format&fit=crop",
    heroAlt: "Traveler with backpack standing at a crossroads",
    authorPhoto: "/authors/8fd9a010887d0923506c26.jpg",
    tags: ["Gap Year", "Reapply", "Next Steps"],
    readTime: "8 min read",
    date: "2026-04-25",
    emoji: "🌱",
    accentColor: "rgba(251,146,60,1)",
    accentBg: "rgba(251,146,60,0.12)",
    raw: article5Raw,
  },
  {
    slug: "pre-arrival-checklist",
    file: "article-6-pre-arrival-checklist.md",
    title: "You Committed — Now What?",
    subtitle: "Everything international students need to prepare before arriving in the US",
    excerpt:
      "May 1 is behind you. You paid the deposit. Now begins the practical work of actually getting yourself to the US and into your dorm room — visas, documents, what to pack, and what to buy when you land.",
    heroImage:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1400&q=85&auto=format&fit=crop",
    heroAlt: "Suitcases and boxes being packed for moving into a college dorm",
    authorPhoto: "/authors/65fa0662-43be-4a11-a469-36c0d8a13dde (1).jpg",
    tags: ["Pre-Arrival", "Dorm Life", "Packing Guide"],
    readTime: "6 min read",
    date: "2026-04-25",
    emoji: "🧳",
    accentColor: "rgba(251,146,60,1)",
    accentBg: "rgba(251,146,60,0.12)",
    raw: article6Raw,
  },
  {
    slug: "missed-may1-deadline",
    file: "article-7-missed-may1-deadline.md",
    title: "Missed the May 1 Deadline?",
    subtitle: "Here's exactly what international students should do next",
    excerpt:
      "Every year, a handful of students miss National Decision Day — and every year, most of them panic unnecessarily. Missing the May 1 enrollment deadline is serious, but it is rarely the end of the road.",
    heroImage:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1400&q=85&auto=format&fit=crop",
    heroAlt: "Clock and calendar showing urgency of a deadline",
    authorPhoto: "/authors/baeb940abb673a3963766.jpg",
    tags: ["May 1", "Deadlines", "Emergency Guide"],
    readTime: "6 min read",
    date: "2026-04-25",
    emoji: "⏰",
    accentColor: "rgba(239,68,68,1)",
    accentBg: "rgba(239,68,68,0.10)",
    raw: article7Raw,
  },
  {
    slug: "waitlist-guide",
    file: "article-8-waitlist-guide.md",
    title: "Waitlisted at a US College?",
    subtitle: "What international students should actually do next",
    excerpt:
      "Getting waitlisted is one of the most frustrating outcomes in college admissions. It's not a yes. It's not a no. It's a 'we'll let you know' with no guaranteed timeline — here's how to handle it strategically.",
    heroImage:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1400&q=85&auto=format&fit=crop",
    heroAlt: "Person at a desk looking at their laptop, waiting for news",
    authorPhoto: "/authors/a974d266fa0b7b55221a36.jpg",
    tags: ["Waitlist", "Admissions", "Strategy"],
    readTime: "7 min read",
    date: "2026-04-25",
    emoji: "⏳",
    accentColor: "rgba(245,158,11,1)",
    accentBg: "rgba(245,158,11,0.10)",
    raw: article8Raw,
  },
  {
    slug: "most-financial-aid",
    file: "article-9-most-financial-aid.md",
    title: "Which US Colleges Give the Most Aid to International Students?",
    subtitle: "What the data actually shows",
    excerpt:
      "Many students assume financial aid is off-limits if you're not a US citizen. Others assume every school offers it equally. Neither is true. A defined group of US colleges offer genuinely generous aid — and knowing which changes how you build your list.",
    heroImage:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1400&q=85&auto=format&fit=crop",
    heroAlt: "Financial charts and money representing college financial aid",
    authorPhoto: "/authors/9e1a991eb173302d696234.jpg",
    tags: ["Financial Aid", "Data", "School Selection"],
    readTime: "8 min read",
    date: "2026-04-25",
    emoji: "💰",
    accentColor: "rgba(52,211,153,1)",
    accentBg: "rgba(52,211,153,0.10)",
    raw: article9Raw,
  },
  {
    slug: "sat-vs-act",
    file: "article-10-sat-vs-act.md",
    title: "SAT vs ACT for International Students",
    subtitle: "Which test should you actually take?",
    excerpt:
      "The SAT vs ACT question comes up early and often — and most advice online is written for American students. The calculus is different when test availability varies by country, your math runs ahead of the US curriculum, or English is your second language.",
    heroImage:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1400&q=85&auto=format&fit=crop",
    heroAlt: "Student studying at a desk preparing for standardized tests",
    authorPhoto: "/authors/e2f655567a3bfb65a22a13.jpg",
    tags: ["SAT", "ACT", "Test Prep"],
    readTime: "7 min read",
    date: "2026-04-25",
    emoji: "📝",
    accentColor: "rgba(96,165,250,1)",
    accentBg: "rgba(96,165,250,0.10)",
    raw: article10Raw,
  },
  {
    slug: "international-credentials",
    file: "article-11-international-credentials.md",
    title: "IB, A-Levels, CBSE, or Gaokao?",
    subtitle: "How US colleges evaluate international student transcripts",
    excerpt:
      "One of the most common anxieties for international students: does my transcript even make sense to them? The short answer is yes — but how they're evaluated varies by curriculum. Here's a breakdown of every major system.",
    heroImage:
      "https://images.unsplash.com/photo-1529539795054-3c162aab037a?w=1400&q=85&auto=format&fit=crop",
    heroAlt: "Globe and diplomas representing international education systems",
    authorPhoto: "/authors/93b1916bb8063958601740.jpg",
    tags: ["IB", "A-Levels", "Transcripts", "Credentials"],
    readTime: "8 min read",
    date: "2026-04-25",
    emoji: "🌐",
    accentColor: "rgba(34,211,238,1)",
    accentBg: "rgba(34,211,238,0.10)",
    raw: article11Raw,
  },
  {
    slug: "truth-about-scholarships",
    file: "article-12-truth-about-scholarships.md",
    title: "The Truth About Scholarships for International Students",
    subtitle: "What's real, what's a myth, and what actually works",
    excerpt:
      "Search 'scholarships for international students' and you'll find hundreds of results. Some of it is real. A lot of it is noise. And a small portion is outright misleading. This guide separates fact from fiction.",
    heroImage:
      "https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=1400&q=85&auto=format&fit=crop",
    heroAlt: "Stack of books and scholarship documents on a desk",
    authorPhoto: "/authors/f2ebaa25824803165a5927.jpg",
    tags: ["Scholarships", "Financial Aid", "Myths & Facts"],
    readTime: "8 min read",
    date: "2026-04-25",
    emoji: "🔍",
    accentColor: "rgba(167,139,250,1)",
    accentBg: "rgba(167,139,250,0.10)",
    raw: article12Raw,
  },
  {
    slug: "international-students-work",
    file: "article-13-international-students-work.md",
    title: "Can International Students Work in the US?",
    subtitle: "F-1 visa work rules explained clearly",
    excerpt:
      "Work authorization is one of the most misunderstood topics for international students on F-1 visas. Getting it wrong has real consequences. Here's a clear, accurate overview of what F-1 students can and cannot do.",
    heroImage:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=85&auto=format&fit=crop",
    heroAlt: "Modern office workspace representing professional work environment",
    authorPhoto: "/authors/b071355a1a379b69c22625.jpg",
    tags: ["F-1 Visa", "Work Authorization", "OPT / CPT"],
    readTime: "9 min read",
    date: "2026-04-25",
    emoji: "💼",
    accentColor: "rgba(74,222,128,1)",
    accentBg: "rgba(74,222,128,0.10)",
    raw: article13Raw,
  },
  {
    slug: "extracurriculars-that-impress",
    file: "article-14-extracurriculars-that-impress.md",
    title: "Extracurricular Activities That Actually Impress US Admissions",
    subtitle: "What international students commonly get wrong",
    excerpt:
      "Ask admissions officers what extracurriculars they actually want to see and you'll hear something very different from what most international applicants assume. Here's what matters, what doesn't, and how to think about it.",
    heroImage:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&q=85&auto=format&fit=crop",
    heroAlt: "Students collaborating together on a group project",
    authorPhoto: "/authors/main.jpg",
    tags: ["Extracurriculars", "Admissions", "Activities"],
    readTime: "7 min read",
    date: "2026-04-26",
    emoji: "🏆",
    accentColor: "rgba(251,146,60,1)",
    accentBg: "rgba(251,146,60,0.10)",
    raw: article14Raw,
  },
  {
    slug: "extracurriculars-limited-options",
    file: "article-15-extracurriculars-with-limited-options.md",
    title: "Building a Strong Extracurricular Profile When Your School Offers Almost Nothing",
    subtitle: "For international students without the usual options",
    excerpt:
      "What do you do about extracurriculars when your school simply doesn't have them? This is the reality for thousands of international applicants — and almost no college prep content addresses it honestly.",
    heroImage:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1400&q=85&auto=format&fit=crop",
    heroAlt: "Student working independently and studying at a library",
    authorPhoto: "/authors/f57acca9e3c4629a3bd54.jpg",
    tags: ["Extracurriculars", "Limited Resources", "Activities"],
    readTime: "7 min read",
    date: "2026-04-26",
    emoji: "💪",
    accentColor: "rgba(74,222,128,1)",
    accentBg: "rgba(74,222,128,0.10)",
    raw: article15Raw,
  },
  {
    slug: "starting-club-for-application",
    file: "article-16-starting-club-for-application.md",
    title: "Can You Start a Club Just for Your College Application?",
    subtitle: "The honest answer — and what actually works",
    excerpt:
      "Every year, thousands of students start clubs in 11th grade. Many meet twice and disappear. Admissions officers know this pattern. Here's the honest answer on whether founding something for your application is a real strategy.",
    heroImage:
      "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=1400&q=85&auto=format&fit=crop",
    heroAlt: "Group of young people working together and starting something new",
    authorPhoto: "/authors/d4dcb28b9ae61bb842f731.jpg",
    tags: ["Extracurriculars", "Authenticity", "Strategy"],
    readTime: "6 min read",
    date: "2026-04-26",
    emoji: "🤔",
    accentColor: "rgba(251,191,36,1)",
    accentBg: "rgba(251,191,36,0.10)",
    raw: article16Raw,
  },
  {
    slug: "summer-programs",
    file: "article-17-summer-programs.md",
    title: "Summer Programs for International Students: What's Actually Worth It",
    subtitle: "And what's just expensive branding",
    excerpt:
      "Every spring, students receive glossy emails about pre-college programs at Harvard, Stanford, and MIT — for $6,000–$12,000 for a few weeks. Here's what you need to know before you or your family spend that money.",
    heroImage:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1400&q=85&auto=format&fit=crop",
    heroAlt: "University campus during summer with students on the grounds",
    authorPhoto: "/authors/5c5a2bb104dc8582dccd11.jpg",
    tags: ["Summer Programs", "Strategy", "Pre-College"],
    readTime: "7 min read",
    date: "2026-04-26",
    emoji: "☀️",
    accentColor: "rgba(245,158,11,1)",
    accentBg: "rgba(245,158,11,0.10)",
    raw: article17Raw,
  },
  {
    slug: "how-us-admissions-works",
    file: "article-18-how-us-admissions-works.md",
    title: "How US College Admissions Actually Works",
    subtitle: "A plain-English guide for international students",
    excerpt:
      "If you grew up in a system where university admission is determined by an exam score, US college admissions will feel like a different planet. No cutoffs. No formula. Two students with identical scores can have completely different outcomes. Here's how it actually works.",
    heroImage:
      "https://images.unsplash.com/photo-1562774053-701939374585?w=1400&q=85&auto=format&fit=crop",
    heroAlt: "University building corridor representing the college admissions process",
    authorPhoto: "/authors/8fd9a010887d0923506c26.jpg",
    tags: ["Admissions", "Holistic Review", "Guide"],
    readTime: "8 min read",
    date: "2026-04-26",
    emoji: "🎓",
    accentColor: "rgba(167,139,250,1)",
    accentBg: "rgba(167,139,250,0.10)",
    raw: article18Raw,
  },
  {
    slug: "college-essay-international",
    file: "article-19-college-essay-international.md",
    title: "How to Write a US College Essay When Your Life Doesn't Sound \"American\"",
    subtitle: "Writing from your world, not theirs",
    excerpt:
      "At some point, almost every international student wonders: will they understand this story? Will a school in Massachusetts care about something set in rural Vietnam or suburban Seoul? Here's why you're asking the wrong question.",
    heroImage:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1400&q=85&auto=format&fit=crop",
    heroAlt: "Person writing thoughtfully in a journal or notebook",
    authorPhoto: "/authors/baeb940abb673a3963766.jpg",
    tags: ["College Essay", "Personal Statement", "Writing"],
    readTime: "8 min read",
    date: "2026-04-26",
    emoji: "✍️",
    accentColor: "rgba(236,72,153,1)",
    accentBg: "rgba(236,72,153,0.10)",
    raw: article19Raw,
  },
  {
    slug: "recommendation-letters",
    file: "article-20-recommendation-letters.md",
    title: "What US College Recommendation Letters Actually Need to Say",
    subtitle: "A guide for international students and their teachers",
    excerpt:
      "In many countries, a recommendation letter is a formal document — polished sentences, official language, stamp. In US college admissions, this kind of letter actively works against the student who submitted it.",
    heroImage:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1400&q=85&auto=format&fit=crop",
    heroAlt: "Teacher and student having a meaningful conversation in a classroom",
    authorPhoto: "/authors/a974d266fa0b7b55221a36.jpg",
    tags: ["Recommendation Letters", "Teachers", "Application"],
    readTime: "8 min read",
    date: "2026-04-26",
    emoji: "📬",
    accentColor: "rgba(96,165,250,1)",
    accentBg: "rgba(96,165,250,0.10)",
    raw: article20Raw,
  },
  {
    slug: "demonstrated-interest",
    file: "article-21-demonstrated-interest.md",
    title: "Demonstrated Interest: Does It Actually Matter for International Students?",
    subtitle: "A clear-eyed breakdown of what's worth doing from abroad",
    excerpt:
      "\"Demonstrated interest\" sounds more consequential than it usually is — but at specific schools it matters enough to understand. Here's what it means and what actions are worth taking from thousands of miles away.",
    heroImage:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1400&q=85&auto=format&fit=crop",
    heroAlt: "Students walking on a university campus",
    authorPhoto: "/authors/9e1a991eb173302d696234.jpg",
    tags: ["Demonstrated Interest", "Admissions Strategy", "School Selection"],
    readTime: "6 min read",
    date: "2026-04-26",
    emoji: "👋",
    accentColor: "rgba(34,211,238,1)",
    accentBg: "rgba(34,211,238,0.10)",
    raw: article21Raw,
  },
];

export function getArticleBySlug(slug) {
  return ARTICLES.find((a) => a.slug === slug) || null;
}

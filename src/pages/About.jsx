import { db } from '@/api/base44Client';
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Send, Loader2, CheckCircle } from "lucide-react";

const FAQ = [
  {
    q: "How is LilGrant different from other scholarship platforms?",
    a: "LilGrant aims to provide a uniquely user-friendly, focused, and supportive experience, created with a deep understanding of the student journey—especially for international students. We prioritize clarity, direct links to official opportunities, and a curated approach to help reduce overwhelm.",
  },
  {
    q: "How often are scholarships updated on LilGrant?",
    a: "The scholarship data on LilGrant is updated periodically once a week. We strive to keep the information as current and accurate as possible.",
  },
  {
    q: "Is LilGrant free to use?",
    a: "Absolutely! LilGrant is completely free for students to use to find scholarship information and resources. Our goal is to make scholarship discovery more accessible to everyone.",
  },
  {
    q: "Can I submit a scholarship to be listed on LilGrant?",
    a: "Yes, please! If you know of a scholarship that could benefit fellow students and isn't yet listed, we encourage you to share it via the contact form below.",
  },
];

const TOPICS = [
  "General Question",
  "Scholarship Submission",
  "University Data Issue",
  "Partnership Inquiry",
  "Bug Report",
  "Other",
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden mb-3"
      style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}
    >
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-medium text-white pr-4">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.6)" }} />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.6)" }} />
        }
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>{a}</p>
        </div>
      )}
    </div>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", topic: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handle = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inputStyle = {
    backgroundColor: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.22)",
    borderRadius: "10px",
    color: "rgba(255,255,255,0.92)",
    padding: "10px 14px",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    caretColor: "white",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await db.integrations.Core.SendEmail({
        to: "lillianenguyen161@gmail.com",
        from_name: `LilGrant Contact — ${form.name}`,
        subject: `[LilGrant] ${form.topic ? `[${form.topic}] ` : ""}${form.subject}`,
        body: `Name: ${form.name}\nEmail: ${form.email}\nTopic: ${form.topic || "N/A"}\nSubject: ${form.subject}\n\nMessage:\n${form.message}`,
      });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}
      >
        <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(110,231,183,1)" }} />
        <p className="font-semibold text-white mb-1">Message sent!</p>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.68)" }}>
          Thanks for reaching out, {form.name}. We'll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-6 sm:p-7 space-y-4"
      style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>Your Name *</label>
          <input
            type="text"
            placeholder="Lilliane Nguyen"
            value={form.name}
            onChange={e => handle("name", e.target.value)}
            style={inputStyle}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>Your Email *</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => handle("email", e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>Topic</label>
        <select
          value={form.topic}
          onChange={e => handle("topic", e.target.value)}
          style={{ ...inputStyle, appearance: "auto", cursor: "pointer" }}
        >
          <option value="" style={{ backgroundColor: "#7a5a9d" }}>Select a topic...</option>
          {TOPICS.map(t => <option key={t} value={t} style={{ backgroundColor: "#7a5a9d" }}>{t}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>Subject *</label>
        <input
          type="text"
          placeholder="Brief subject line"
          value={form.subject}
          onChange={e => handle("subject", e.target.value)}
          style={inputStyle}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>Message *</label>
        <textarea
          rows={5}
          placeholder="Write your message here..."
          value={form.message}
          onChange={e => handle("message", e.target.value)}
          style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6" }}
        />
      </div>

      {error && (
        <p className="text-xs" style={{ color: "rgba(252,165,165,0.95)" }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-opacity disabled:opacity-60"
        style={{ backgroundColor: "rgba(255,255,255,0.85)", color: "#7a5a9d" }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

export default function About() {
  return (
    <div className="min-h-screen pt-10 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Author photo + intro */}
        <div className="flex flex-col items-center mb-10">
          <img
            src="/authors/Avatar - about section.jpg"
            alt="Lilliane Nguyen"
            className="w-28 h-28 rounded-full object-cover mb-4"
            style={{ border: "3px solid rgba(255,255,255,0.35)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
          />
          <h1 className="text-3xl font-bold text-white mb-1">About LilGrant</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>by Lilliane Nguyen</p>
        </div>

        {/* Story */}
        <div className="space-y-4 mb-12 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.82)" }}>
          <p>
            Lilliane Nguyen is an international student at the University of Rochester, pursuing a degree in Business.
            Like many international students, she has faced the weight of financial uncertainty and the often-unspoken
            gaps in support that accompany studying far from home.
          </p>
          <p>
            LilGrant began as more than a project — it is a purpose-driven initiative shaped by lived experience.
          </p>
          <p>
            Without access to federal grants, loans, or the full spectrum of aid available to domestic peers,
            international students frequently face a silent struggle — one that adds invisible pressure to an already
            demanding journey. LilGrant was created as a response to that challenge, born from a belief that no
            student should feel alone in the search for opportunity.
          </p>
          <p>
            At its core, LilGrant is a platform designed to make scholarship discovery accessible, transparent, and
            empowering. It's a space built not just for finding funding, but for fostering hope — for helping students
            turn barriers into bridges.
          </p>
          <p>
            Whether you're looking for financial assistance or simply need guidance in the maze of applications and
            deadlines, LilGrant is here to support you. Because your dreams are valid, your ambitions are powerful,
            and your journey deserves to be met with resources — not roadblocks.
          </p>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-5" style={{ color: "rgba(192,132,252,0.95)" }}>
            Frequently Asked Questions
          </h2>
          {FAQ.map(faq => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "rgba(192,132,252,0.95)" }}>
            Get in Touch!
          </h2>
          <p className="text-sm mb-5 leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
            Your questions, feedback, and scholarship suggestions are incredibly valuable. Fill out the form below
            and we'll get back to you as soon as possible.
          </p>
          <ContactForm />
        </div>

      </div>
    </div>
  );
}
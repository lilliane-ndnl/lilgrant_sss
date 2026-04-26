import React from "react";
import { Link } from "react-router-dom";

export default function Scholarships() {
  return (
    <div className="min-h-screen pt-10 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="text-6xl mb-6">🎓</div>
        <h1 className="text-3xl font-bold text-white mb-4">Scholarships</h1>
        <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(255,255,255,0.78)" }}>
          Discover financial aid opportunities designed for international students.
          We're building a comprehensive, hand-picked database of 400+ scholarship opportunities.
          Check back soon!
        </p>
        <Link
          to="/universities"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-colors"
          style={{
            backgroundColor: "rgba(255,255,255,0.14)",
            color: "rgba(255,255,255,0.88)",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          Explore University Hub →
        </Link>
      </div>
    </div>
  );
}
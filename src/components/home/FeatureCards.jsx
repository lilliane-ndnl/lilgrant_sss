import React from "react";
import { Link } from "react-router-dom";

const FEATURES = [
  // Scholarship Discovery card temporarily hidden
  // { emoji: "🎓", title: "Scholarship Discovery", link: "/scholarships", ... }
  {
    emoji: "🏫",
    title: "University Hub",
    description:
      "Explore more than 4,000 U.S. institutions. Our database is specifically curated to provide international students with the detailed insights on academics, cost, and career outcomes needed to find the perfect fit.",
    stats: [
      { value: "4000+", label: "Schools" },
      { value: "1000+", label: "Programs" },
    ],
    link: "/universities",
    linkLabel: "Browse Universities →",
  },
  {
    emoji: "📚",
    title: "Guidance & Resources",
    description:
      "From application checklists to tips for navigating student life in the U.S. — including dorm shopping, budgeting, and career advice — our resources are here to support you at every step.",
    stats: [
      { value: "100+", label: "Resources" },
      { value: "24/7", label: "Support" },
    ],
    link: "/resources",
    linkLabel: "Browse Resources →",
  },
];

export default function FeatureCards() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <h2
          className="text-2xl sm:text-3xl font-bold text-center mb-10"
          style={{ color: "rgba(255,255,255,0.95)" }}
        >
          Discover Your Path
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((feature) => (
            <Link
              key={feature.title}
              to={feature.link}
              className="group block rounded-2xl p-7 transition-all duration-300"
              style={{
                backgroundColor: "rgba(255,255,255,0.09)",
                border: "1px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.14)";
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.25)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.09)";
                e.currentTarget.style.border = "1px solid rgba(255,255,255,0.15)";
              }}
            >
              <div className="text-3xl mb-4">{feature.emoji}</div>

              <h3
                className="text-lg font-semibold mb-3"
                style={{ color: "rgba(255,255,255,0.95)" }}
              >
                {feature.title}
              </h3>

              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: "rgba(255,255,255,0.72)" }}
              >
                {feature.description}
              </p>

              {/* Stats */}
              <div className="flex gap-6 mb-5">
                {feature.stats.map((stat) => (
                  <div key={stat.label}>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "rgba(255,255,255,0.95)" }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <span
                className="text-sm font-medium transition-opacity group-hover:opacity-100"
                style={{ color: "rgba(192,132,252,0.9)" }}
              >
                {feature.linkLabel}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
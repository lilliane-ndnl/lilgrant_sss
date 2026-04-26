import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const TYPEWRITER_TEXT = "Discover LilGrant";

export default function HeroSection() {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (displayed.length < TYPEWRITER_TEXT.length) {
      const timeout = setTimeout(() => {
        setDisplayed(TYPEWRITER_TEXT.slice(0, displayed.length + 1));
      }, 80);
      return () => clearTimeout(timeout);
    } else {
      setDone(true);
    }
  }, [displayed]);

  return (
    <section className="flex flex-col items-center justify-center text-center px-4 pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* Main heading */}
      <h1
        className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight fade-in-up fade-in-up-1"
        style={{ letterSpacing: "-0.01em" }}
      >
        Unlock Your Future
      </h1>

      {/* Typewriter gradient line */}
      <h2 className="mt-2 text-4xl sm:text-5xl md:text-6xl font-bold fade-in-up fade-in-up-2" style={{ minHeight: "1.2em" }}>
        <span
          style={{
            background: "linear-gradient(90deg, #c084fc 0%, #a78bfa 35%, #93c5fd 70%, #f0abfc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {displayed}
        </span>
        <span
          className="cursor-blink"
          style={{
            WebkitTextFillColor: "initial",
            color: "rgba(192,132,252,0.85)",
            marginLeft: "2px",
          }}
        >
          |
        </span>
      </h2>

      {/* Subtitle */}
      <p
        className="mt-8 text-base sm:text-lg max-w-2xl leading-relaxed fade-in-up fade-in-up-3"
        style={{ color: "rgba(255,255,255,0.82)", fontWeight: 400 }}
      >
        Beyond admissions, LilGrant empowers international students to succeed.
        Discover your perfect university from over 4,000 profiles, secure funding
        with our curated scholarship database, and master student life with resources
        designed for you.
      </p>

      {/* CTA Button — glassmorphic pill matching real site */}
      <div className="mt-10 fade-in-up fade-in-up-4">
        <Link
          to="/universities"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-medium transition-all duration-300"
          style={{
            backgroundColor: "rgba(255,255,255,0.14)",
            color: "rgba(255,255,255,0.88)",
            border: "1px solid rgba(255,255,255,0.22)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.22)";
            e.currentTarget.style.color = "rgba(255,255,255,1)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.14)";
            e.currentTarget.style.color = "rgba(255,255,255,0.88)";
          }}
        >
          Begin Your Journey →
        </Link>
      </div>
    </section>
  );
}
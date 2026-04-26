import React from "react";

export default function Footer() {
  return (
    <footer className="text-center py-10 px-4" style={{ color: "rgba(255,255,255,0.55)" }}>
      <p className="text-sm italic mb-1">
        Lovingly made by{" "}
        <a
          href="https://www.linkedin.com/in/lilliane-nguyen/"
          target="_blank"
          rel="noopener noreferrer"
          className="italic underline transition-opacity hover:opacity-80"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          Lilliane
        </a>
      </p>
      <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
        © 2025 LilGrant. All Rights Reserved.
      </p>
    </footer>
  );
}
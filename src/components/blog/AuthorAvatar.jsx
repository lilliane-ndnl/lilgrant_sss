import React, { useState } from "react";
import { AUTHOR } from "@/data/articles";

export default function AuthorAvatar({ size = 36, src }) {
  const [failed, setFailed] = useState(false);
  const photoSrc = src || AUTHOR.defaultPhoto || null;

  if (failed || !photoSrc) {
    return (
      <div
        className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
          color: "white",
          fontSize: size * 0.4,
          border: "2px solid rgba(167,139,250,0.5)",
        }}
      >
        {AUTHOR.avatarFallback}
      </div>
    );
  }

  return (
    <img
      src={photoSrc}
      alt={AUTHOR.name}
      className="rounded-full object-cover flex-shrink-0"
      style={{
        width: size,
        height: size,
        border: "2px solid rgba(167,139,250,0.5)",
      }}
      onError={() => setFailed(true)}
    />
  );
}

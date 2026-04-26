import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, MapPin } from "lucide-react";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80";

function getCampusImage(college) {
  return college.wiki_image_url || college.image_url || FALLBACK_IMG;
}

function getLogoUrl(websiteUrl) {
  if (!websiteUrl) return null;
  try {
    const url = websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`;
    const domain = new URL(url).hostname.replace("www.", "");
    return `https://logo.clearbit.com/${domain}`;
  } catch {
    return null;
  }
}

// IPEDS religious affiliation codes → display name
const RELIGIOUS_AFFILIATION = {
  22: "Roman Catholic", 23: "United Methodist", 24: "Presbyterian",
  25: "Baptist", 26: "Jewish", 27: "Lutheran", 28: "Quaker",
  29: "Episcopal", 30: "Seventh-day Adventist", 31: "United Church of Christ",
  33: "Muslim", 34: "LDS / Mormon", 35: "Assembly of God",
  36: "Christian", 37: "Church of the Nazarene", 38: "Disciples of Christ",
  40: "Other Protestant", 41: "Independent / Non-Denominational",
  42: "Salvation Army", 45: "Nondenominational Protestant",
  47: "Conservative Baptist", 48: "Evangelical Covenant",
  50: "African Methodist Episcopal", 52: "Reformed / Calvinist",
  53: "Interdenominational", 57: "Free Methodist",
  61: "Jesuit", 80: "Mennonite", 81: "Brethren",
};

function Badge({ children, bg, color, border }) {
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: bg, color, border: `1px solid ${border}` }}
    >
      {children}
    </span>
  );
}

export default function HeroBanner({ college }) {
  const logoUrl   = getLogoUrl(college.website_url);
  const campusImg = getCampusImage(college);

  const religionCode = college.religious_affiliation;
  const religionName = religionCode && religionCode !== 0
    ? (RELIGIOUS_AFFILIATION[religionCode] ?? `Religiously Affiliated`)
    : null;

  return (
    <div className="relative mb-6">
      {/* Campus image */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <img
          src={campusImg}
          alt={college.name}
          className="w-full h-full object-cover scale-105"
          style={{ filter: "brightness(0.55)" }}
          onError={e => { e.target.src = "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&q=80"; }}
        />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, rgba(60,20,100,0.15) 0%, rgba(50,10,90,0.7) 60%, rgba(40,5,80,0.92) 100%)"
        }} />

        {/* Back button */}
        <div className="absolute top-5 left-5 sm:left-8">
          <Link
            to="/universities"
            className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl transition-all hover:opacity-90"
            style={{ color: "rgba(255,255,255,0.9)", backgroundColor: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
        </div>

        {/* Logo */}
        {logoUrl && (
          <div
            className="absolute top-5 right-5 sm:right-8 w-14 h-14 rounded-2xl overflow-hidden shadow-2xl"
            style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.3)", padding: "6px" }}
          >
            <img
              src={logoUrl}
              alt={`${college.name} logo`}
              className="w-full h-full object-contain"
              onError={e => { e.target.parentElement.style.display = "none"; }}
            />
          </div>
        )}

        {/* College name & meta */}
        <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 pb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-2 drop-shadow-lg">
            {college.name}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            {(college.city || college.state) && (
              <span className="flex items-center gap-1 text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                <MapPin className="w-3.5 h-3.5" />
                {[college.city, college.state].filter(Boolean).join(", ")}
              </span>
            )}
            {college.control_type && (
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>· {college.control_type}</span>
            )}
            {college.setting && (
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>· {college.setting} Campus</span>
            )}
          </div>
        </div>
      </div>

      {/* Badges bar */}
      <div
        className="mx-4 sm:mx-8 lg:mx-auto max-w-5xl -mt-6 relative z-10 rounded-2xl px-4 sm:px-6 py-4 flex flex-wrap gap-2 items-center"
        style={{ backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}
      >
        {/* Need-Blind badges */}
        {college.need_blind_intl && (
          <Badge bg="rgba(52,211,153,0.22)" color="rgba(110,231,183,1)" border="rgba(52,211,153,0.4)">
            🌍 Need-Blind Intl
          </Badge>
        )}
        {college.need_blind_us && (
          <Badge bg="rgba(96,165,250,0.2)" color="rgba(147,197,253,1)" border="rgba(96,165,250,0.4)">
            🇺🇸 Need-Blind US
          </Badge>
        )}

        {/* Meets full need */}
        {college.meets_full_need && (
          <Badge bg="rgba(110,231,183,0.18)" color="rgba(110,231,183,1)" border="rgba(110,231,183,0.3)">
            ✓ Meets Full Need
          </Badge>
        )}

        {/* Institution type badges */}
        {college.is_hbcu && (
          <Badge bg="rgba(239,68,68,0.18)" color="rgba(252,165,165,1)" border="rgba(239,68,68,0.35)">
            HBCU
          </Badge>
        )}
        {college.is_hispanic_serving && (
          <Badge bg="rgba(251,146,60,0.2)" color="rgba(253,186,116,1)" border="rgba(251,146,60,0.35)">
            Hispanic Serving
          </Badge>
        )}
        {college.is_tribal && (
          <Badge bg="rgba(161,120,80,0.25)" color="rgba(217,187,155,1)" border="rgba(161,120,80,0.4)">
            Tribal College
          </Badge>
        )}
        {college.is_aapi_serving && (
          <Badge bg="rgba(20,184,166,0.2)" color="rgba(94,234,212,1)" border="rgba(20,184,166,0.35)">
            AAPI Serving
          </Badge>
        )}

        {/* Common App */}
        {college.uses_common_app && (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: "rgba(0,107,214,0.18)", color: "rgba(147,197,253,1)", border: "1px solid rgba(0,107,214,0.3)" }}
          >
            <svg width="11" height="11" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#0065D3"/><path d="M8 16.5C8 12.36 11.36 9 15.5 9c2.1 0 3.99.84 5.37 2.2l-2.14 2.14A4 4 0 0 0 15.5 12 4.5 4.5 0 0 0 11 16.5a4.5 4.5 0 0 0 4.5 4.5c2.1 0 3.59-1.07 4.1-2.5H15.5v-2.5H22c.07.4.1.82.1 1.25C22.1 20.9 19.2 24 15.5 24 11.36 24 8 20.64 8 16.5Z" fill="white"/></svg>
            Common App
          </span>
        )}

        {/* Testing policy */}
        {college.testing_policy === "Test-Optional" && (
          <Badge bg="rgba(251,191,36,0.18)" color="rgba(252,211,77,1)" border="rgba(251,191,36,0.35)">
            Test-Optional
          </Badge>
        )}
        {college.testing_policy === "Test-Free" && (
          <Badge bg="rgba(110,231,183,0.15)" color="rgba(110,231,183,1)" border="rgba(110,231,183,0.3)">
            Test-Free
          </Badge>
        )}

        {/* US News rank */}
        {college.us_news_rank && college.us_news_rank < 2000 && (
          <Badge bg="rgba(251,191,36,0.18)" color="rgba(252,211,77,1)" border="rgba(251,191,36,0.3)">
            🏆 US News #{college.us_news_rank}
          </Badge>
        )}

        {/* Religious affiliation */}
        {religionName && (
          <Badge bg="rgba(255,255,255,0.1)" color="rgba(255,255,255,0.7)" border="rgba(255,255,255,0.2)">
            ✝ {religionName}
          </Badge>
        )}

        {/* intl_aid_notes tags */}
        {college.intl_aid_notes && college.intl_aid_notes.split(";").map(t => t.trim()).filter(Boolean).map(tag => (
          <Badge key={tag} bg="rgba(192,132,252,0.18)" color="rgba(220,180,255,0.9)" border="rgba(192,132,252,0.25)">
            {tag.replace(/_/g, " ")}
          </Badge>
        ))}

        <div className="flex-1" />

        {/* Visit website */}
        {college.website_url && (
          <a
            href={college.website_url.startsWith("http") ? college.website_url : `https://${college.website_url}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-opacity hover:opacity-80"
            style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.25)" }}
          >
            <ExternalLink className="w-3 h-3" /> Visit Website
          </a>
        )}
      </div>
    </div>
  );
}

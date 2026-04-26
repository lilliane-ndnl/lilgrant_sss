import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  // { label: "Scholarships", path: "/scholarships" }, // temporarily hidden
  { label: "University Hub", path: "/universities" },
  { label: "Resources", path: "/resources" },
  { label: "Blog", path: "/blog" },
  { label: "About", path: "/about" },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: "transparent" }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-bold tracking-tight"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            LilGrant
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm transition-colors duration-200"
                  style={{
                    color: isActive ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.72)",
                    fontWeight: isActive ? 500 : 400,
                  }}
                  onMouseEnter={e => (e.target.style.color = "rgba(255,255,255,0.95)")}
                  onMouseLeave={e => (e.target.style.color = isActive ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.72)")}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Avatar Button (right side — matches the circle on the real site) */}
          <div className="hidden md:flex items-center">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
              style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
            >
              <User className="w-4 h-4" style={{ color: "rgba(255,255,255,0.8)" }} />
            </div>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.8)" }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ backgroundColor: "rgba(120,80,160,0.97)" }}
          >
            <div className="px-6 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm rounded-lg transition-colors"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
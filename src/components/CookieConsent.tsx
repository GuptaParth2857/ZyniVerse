"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const COOKIE_KEY = "zyniverse_cookies";
const COOKIE_VERSION = "1.0";

export type CookieConsentValue = "accepted" | "rejected" | "analytics_only";

function getStoredConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(COOKIE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    if (parsed.version !== COOKIE_VERSION) return null;
    return parsed.value as CookieConsentValue;
  } catch {
    return null;
  }
}

export function getCookieConsent(): CookieConsentValue | null {
  return getStoredConsent();
}

export function hasAnalyticsConsent(): boolean {
  const consent = getStoredConsent();
  return consent === "accepted" || consent === "analytics_only";
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const consent = getStoredConsent();
      if (!consent) setVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  function saveConsent(value: CookieConsentValue) {
    localStorage.setItem(
      COOKIE_KEY,
      JSON.stringify({ value, version: COOKIE_VERSION, timestamp: Date.now() })
    );
    setVisible(false);
    setExpanded(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-3 sm:p-4"
        >
          <div className="cookie-banner mx-auto max-w-5xl relative rounded-2xl overflow-hidden">
            {/* RGB animated border */}
            <div className="cookie-rgb-border absolute inset-0 rounded-2xl" />
            <div className="absolute inset-[1.5px] rounded-2xl bg-[#0c0b14]/95 backdrop-blur-2xl" />

            <div className="relative z-10 px-5 py-4 sm:px-6 sm:py-5">
              {/* Main row */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Left: icon + text */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="cookie-icon-ring shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a10 10 0 1010 10 4 4 0 01-5-5 4 4 0 01-5-5A10 10 0 0012 2z" />
                      <circle cx="8" cy="10" r="1" fill="var(--color-magenta)" stroke="none" />
                      <circle cx="12" cy="15" r="1" fill="var(--color-cyan)" stroke="none" />
                      <circle cx="16" cy="11" r="1" fill="var(--color-amber)" stroke="none" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white/90 mb-0.5">We value your privacy</p>
                    <p className="text-xs text-[var(--color-mute)] leading-relaxed">
                      We use cookies to enhance your experience, analyze site traffic, and personalize content.
                      By continuing, you agree to our{" "}
                      <Link href="/privacy" className="text-[var(--color-cyan)] hover:text-[var(--color-magenta)] transition-colors font-medium">Privacy Policy</Link>{" "}
                      and{" "}
                      <Link href="/terms" className="text-[var(--color-cyan)] hover:text-[var(--color-magenta)] transition-colors font-medium">Terms of Service</Link>.
                    </p>
                  </div>
                </div>

                {/* Right: buttons */}
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => setExpanded((o) => !o)}
                    className="cookie-btn-secondary px-3 py-2 text-xs font-semibold rounded-xl border border-white/10 text-[var(--color-mute)] hover:border-[var(--color-cyan)]/50 hover:text-white/80 transition-all"
                  >
                    {expanded ? "Less" : "Customize"}
                  </button>
                  <button
                    onClick={() => saveConsent("rejected")}
                    className="cookie-btn-secondary px-4 py-2 text-xs font-semibold rounded-xl border border-white/10 text-[var(--color-mute)] hover:border-[var(--color-magenta)]/50 hover:text-white/80 transition-all"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={() => saveConsent("accepted")}
                    className="cookie-btn-accept px-5 py-2 text-xs font-bold rounded-xl text-black transition-all relative overflow-hidden group"
                  >
                    <span className="relative z-10">Accept All</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-cyan)] via-[var(--color-magenta)] to-[var(--color-cyan)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>

              {/* Expanded: cookie categories */}
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          name: "Essential",
                          desc: "Required for the site to function. Cannot be disabled.",
                          required: true,
                          color: "var(--color-cyan)",
                          icon: (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                          ),
                        },
                        {
                          name: "Analytics",
                          desc: "Help us understand how visitors interact with our site.",
                          required: false,
                          color: "var(--color-magenta)",
                          icon: (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
                          ),
                        },
                        {
                          name: "Personalization",
                          desc: "Remember your preferences and provide tailored content.",
                          required: false,
                          color: "var(--color-amber)",
                          icon: (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                          ),
                        },
                      ].map((cat) => (
                        <div
                          key={cat.name}
                          className="rounded-xl border border-white/5 bg-white/[0.02] p-3"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span style={{ color: cat.color }}>{cat.icon}</span>
                              <span className="text-xs font-semibold text-white/80">{cat.name}</span>
                              {cat.required && (
                                <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-[var(--color-mute)]">
                                  Required
                                </span>
                              )}
                            </div>
                            <div
                              className={`w-8 h-4 rounded-full flex items-center px-0.5 transition-colors ${
                                cat.required
                                  ? "bg-[var(--color-cyan)]/30 cursor-not-allowed"
                                  : "bg-white/10 cursor-pointer hover:bg-white/15"
                              }`}
                            >
                              <div
                                className={`w-3 h-3 rounded-full transition-transform ${
                                  cat.required ? "bg-[var(--color-cyan)] translate-x-4" : "bg-white/40 translate-x-0"
                                }`}
                              />
                            </div>
                          </div>
                          <p className="text-[10px] text-[var(--color-mute)] leading-relaxed">{cat.desc}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => saveConsent("analytics_only")}
                        className="cookie-btn-accept px-4 py-2 text-xs font-bold rounded-xl text-black transition-all relative overflow-hidden group"
                      >
                        <span className="relative z-10">Accept Essential Only</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-cyan)] via-[var(--color-magenta)] to-[var(--color-cyan)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <span className="text-[10px] text-[var(--color-mute)]">
                        You can change your preferences anytime in Settings.
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

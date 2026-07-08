"use client";

import { useState, useRef, useEffect } from "react";
import { getCurrentLocale, setLocale, getAvailableLocales } from "@/lib/i18n";
import type { Language } from "@/lib/i18n";

const FLAGS: Record<Language, string> = {
  en: "🇺🇸",
  hi: "🇮🇳",
  ta: "🇮🇳",
  te: "🇮🇳",
};

const SHORT: Record<Language, string> = {
  en: "EN",
  hi: "HI",
  ta: "TA",
  te: "TE",
};

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = getCurrentLocale();
  const locales = getAvailableLocales();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(code: Language) {
    if (code === current) { setOpen(false); return; }
    setLocale(code);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors border border-[var(--color-line)] hover:border-[var(--color-cyan)]/40"
        aria-label="Switch language"
      >
        <span className="text-sm leading-none">{FLAGS[current]}</span>
        <span className="hidden sm:inline font-mono tracking-wide">{SHORT[current]}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-0.5">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 w-44 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl backdrop-blur-xl overflow-hidden z-50">
          {locales.map((l) => (
            <button
              key={l.code}
              onClick={() => handleSelect(l.code)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5 ${
                l.code === current ? "text-[var(--color-cyan)]" : "text-[var(--color-mute)]"
              }`}
            >
              <span className="text-base leading-none">{FLAGS[l.code]}</span>
              <div className="flex flex-col items-start">
                <span className="text-xs font-semibold">{l.name}</span>
                <span className="text-[10px] opacity-60">{l.nativeName}</span>
              </div>
              {l.code === current && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

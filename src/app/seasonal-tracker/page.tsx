"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SeasonalTrackerDashboard from "@/components/SeasonalTrackerDashboard";

const SEASONS = ["WINTER", "SPRING", "SUMMER", "FALL"] as const;

export default function SeasonalTrackerPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const defaultSeason = currentMonth <= 3 ? "WINTER" : currentMonth <= 6 ? "SPRING" : currentMonth <= 9 ? "SUMMER" : "FALL";

  const [year, setYear] = useState(currentYear);
  const [season, setSeason] = useState<"WINTER" | "SPRING" | "SUMMER" | "FALL">(defaultSeason);
  const [yearOpen, setYearOpen] = useState(false);
  const yearRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!yearOpen) return;
    const handler = (e: MouseEvent) => {
      if (yearRef.current && !yearRef.current.contains(e.target as Node)) setYearOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [yearOpen]);

  function navigateSeason(delta: number) {
    const idx = SEASONS.indexOf(season);
    let newIdx = idx + delta;
    let newYear = year;
    if (newIdx < 0) { newIdx = 3; newYear -= 1; }
    if (newIdx > 3) { newIdx = 0; newYear += 1; }
    setSeason(SEASONS[newIdx] as "WINTER" | "SPRING" | "SUMMER" | "FALL");
    setYear(newYear);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="text-center mb-8">
        <div className="neon-rgb-border inline-block rounded-xl px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📋</span>
            <h1 className="font-display text-3xl font-bold sm:text-4xl bg-gradient-to-r from-[var(--color-cyan)] via-[var(--color-magenta)] to-[var(--color-violet)] bg-clip-text text-transparent">
              Seasonal Tracker
            </h1>
          </div>
        </div>
        <p className="mt-3 text-sm text-[var(--color-mute)]">
          Track your anime watching progress for each season
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        <div className="flex items-center gap-2">
          <button onClick={() => navigateSeason(-1)}
            className="neon-rgb-border flex items-center justify-center rounded-lg size-9 text-sm text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-all"
            aria-label="Previous season">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button onClick={() => navigateSeason(1)}
            className="neon-rgb-border flex items-center justify-center rounded-lg size-9 text-sm text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-all"
            aria-label="Next season">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>

        <div className="flex rounded-xl neon-rgb-border overflow-x-auto">
          {SEASONS.map((s) => (
            <button key={s} onClick={() => setSeason(s as "WINTER" | "SPRING" | "SUMMER" | "FALL")}
              className={`px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap ${
                season === s ? "text-black" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
              }`}
              style={season === s ? { background: "var(--color-cyan)" } : {}}
            >{{ WINTER: "Winter", SPRING: "Spring", SUMMER: "Summer", FALL: "Fall" }[s]}</button>
          ))}
        </div>

        <div ref={yearRef} className="relative">
          <div className="neon-rgb-border rounded-xl">
            <button onClick={() => setYearOpen(!yearOpen)}
              className="flex items-center gap-2 rounded-xl bg-transparent px-4 py-2 text-sm outline-none whitespace-nowrap">
              {year}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={`transition-transform ${yearOpen ? "rotate-180" : ""}`}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
          {yearOpen && (
            <div className="absolute left-0 top-full mt-1 z-50 max-h-60 overflow-y-auto rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] backdrop-blur-xl shadow-xl">
              {Array.from({ length: 15 }, (_, i) => currentYear - i + 2).sort((a, b) => b - a).map((y) => (
                <button key={y} onClick={() => { setYear(y); setYearOpen(false); }}
                  className={`block w-full px-4 py-1.5 text-left text-sm transition-colors whitespace-nowrap ${
                    year === y ? "text-black bg-[var(--color-cyan)]" : "text-[var(--color-mute)] hover:bg-[var(--color-hover)]"
                  }`}>{y}</button>
              ))}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-[var(--color-line)]" />

        <Link href="/seasonal"
          className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 text-sm font-semibold text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:border-[var(--color-cyan)]/30 transition-all">
          Browse Seasonal
        </Link>
      </div>

      <motion.div key={`${season}-${year}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <SeasonalTrackerDashboard season={season} year={year} />
      </motion.div>
    </div>
  );
}

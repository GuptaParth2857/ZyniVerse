"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getSuggestions } from "@/lib/anilist";
import type { Suggestion } from "@/lib/anilist";

const PRESETS = [
  { name: "Naruto", episodes: 720, filler: 41 },
  { name: "Naruto Shippuden", episodes: 500, filler: 44 },
  { name: "One Piece", episodes: 1120, filler: 12 },
  { name: "Bleach", episodes: 366, filler: 45 },
  { name: "Dragon Ball Z", episodes: 291, filler: 16 },
  { name: "Boruto", episodes: 290, filler: 80 },
  { name: "Detective Conan", episodes: 1150, filler: 38 },
  { name: "Black Clover", episodes: 170, filler: 30 },
];

export default function FillerTimeCalculator() {
  const [total, setTotal] = useState<number>(0);
  const [fillerPct, setFillerPct] = useState<number>(0);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [loadingFiller, setLoadingFiller] = useState(false);
  const [realData, setRealData] = useState<{ total: number; fillerPercent: number } | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setSuggestions([]);
      setShowSuggestions(false);
      setSearching(false);
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {      try {
        const res = await getSuggestions(query.trim());
        setSuggestions(res);
        setShowSuggestions(res.length > 0);
      } catch { setSuggestions([]); setShowSuggestions(false); }
      setSearching(false);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  async function selectAnime(s: Suggestion) {
    setSelectedTitle(s.title);
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setRealData(null);

    if (!s.id) return;
    setLoadingFiller(true);
    try {
      const res = await fetch(`/api/filler/${s.id}?title=${encodeURIComponent(s.title)}`);
      const data = await res.json();
      if (data?.found) {
        const fd = data as { total: number; fillerPercent: number };
        const anilistEps = s.episodes || 0;
        const plausible = fd.total > 0 && anilistEps > 0 && Math.abs(fd.total - anilistEps) <= Math.max(12, anilistEps * 0.2);
        if (plausible) {
          setTotal(fd.total);
          setFillerPct(fd.fillerPercent);
          setRealData(fd);
        } else {
          setTotal(anilistEps || fd.total);
          setFillerPct(0);
        }
      } else {
        setTotal(s.episodes || 0);
        setFillerPct(0);
      }
    } catch {
      setTotal(s.episodes || 0);
      setFillerPct(0);
    }
    setLoadingFiller(false);
  }

  const fillerEps = useMemo(() => Math.round((total * fillerPct) / 100), [total, fillerPct]);
  const savedHours = useMemo(() => Math.round(fillerEps * 0.42 * 10) / 10, [fillerEps]);
  const savedDays = useMemo(() => Math.round((savedHours / 24) * 10) / 10, [savedHours]);
  const watchHours = useMemo(() => Math.round(total * 0.42 * 10) / 10, [total]);
  const cleanHours = useMemo(() => Math.round((watchHours - savedHours) * 10) / 10, [watchHours, savedHours]);

  const fillerColor = fillerPct >= 60 ? "var(--color-magenta)" : fillerPct >= 30 ? "var(--color-amber)" : "var(--color-cyan)";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="text-center mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Tool</p>
        <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block mt-2">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Filler Time Calculator</h1>
        </div>
        <p className="mt-3 text-sm text-[var(--color-mute)] max-w-lg mx-auto">
          Search any anime for its real episode count, or use a preset — see exactly how many hours you&apos;d save skipping filler.
        </p>
      </div>

      {/* Real anime search */}
      <div ref={searchRef} className="relative mb-8">
        <p className="text-xs font-semibold text-[var(--color-mute)] mb-3 uppercase tracking-wider">
          Step 1 — Search a real anime
        </p>
        <div className="flex items-center gap-2 rounded-xl neon-rgb-border bg-[var(--color-panel)] px-4 py-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)] shrink-0">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="e.g. One Piece, Naruto, Solo Leveling..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-mute)]/60 text-[var(--color-ink)]"
          />
          {searching && (
            <svg className="animate-spin h-4 w-4 text-[var(--color-cyan)] shrink-0" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </div>

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50 border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl"
            >
              <div className="max-h-72 overflow-y-auto">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => selectAnime(s)}
                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors border-b border-[var(--color-line)]/50 last:border-0 group"
                  >
                    {s.poster ? (
                      <div className="relative h-12 w-9 rounded-md overflow-hidden border border-[var(--color-line)] shrink-0">
                        <Image src={s.poster} alt="" fill className="object-cover" sizes="36px" />
                      </div>
                    ) : (
                      <div className="h-12 w-9 rounded-md bg-gradient-to-br from-[var(--color-cyan)]/10 to-[var(--color-magenta)]/10 border border-[var(--color-line)] shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate group-hover:text-[var(--color-cyan)] transition-colors">{s.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--color-mute)] mt-0.5">
                        {s.format && <span className="rounded-full bg-white/5 px-1.5 py-0.5">{s.format}</span>}
                        {s.year && <span>{s.year}</span>}
                        {s.episodes && <span>{s.episodes} ep</span>}
                      </div>
                    </div>
                    <span className="text-[10px] text-[var(--color-cyan)] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">Use →</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loadingFiller && (
          <p className="mt-2 text-[11px] text-[var(--color-cyan)] flex items-center gap-1.5">
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Fetching real filler data for {selectedTitle}...
          </p>
        )}
        {selectedTitle && !loadingFiller && realData && (
          <p className="mt-2 text-[11px] text-[var(--color-cyan)] flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
            Loaded <strong>real data</strong> for <strong>{selectedTitle}</strong> — {realData.total} episodes, {realData.fillerPercent}% filler.
          </p>
        )}
        {selectedTitle && !loadingFiller && !realData && (
          <p className="mt-2 text-[11px] text-[var(--color-amber)] flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /></svg>
            No filler guide found for {selectedTitle} — set episodes & filler % manually.
          </p>
        )}
      </div>

      {/* Presets */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-[var(--color-mute)] mb-3 uppercase tracking-wider">Quick Select</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => { setTotal(p.episodes); setFillerPct(p.filler); setSelectedTitle(null); setRealData(null); }}
              className="rounded-full neon-rgb-border bg-[var(--color-panel)] px-3 py-1.5 text-xs font-semibold hover:border-[var(--color-cyan)]/40 transition-colors"
            >
              {p.name} ({p.filler}%)
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-mute)] mb-1.5">Total Episodes</label>
          <input
            type="number"
            min={0}
            value={total || ""}
            onChange={(e) => setTotal(Number(e.target.value))}
            placeholder="e.g. 720"
            className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm font-mono outline-none focus:border-[var(--color-cyan)]/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--color-mute)] mb-1.5">Filler %</label>
          <input
            type="number"
            min={0}
            max={100}
            value={fillerPct || ""}
            onChange={(e) => setFillerPct(Number(e.target.value))}
            placeholder="e.g. 41"
            className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 text-sm font-mono outline-none focus:border-[var(--color-cyan)]/50 transition-colors"
          />
        </div>
      </div>

      {/* Slider */}
      <div className="mb-10">
        <label className="block text-xs font-semibold text-[var(--color-mute)] mb-2">
          Filler Percentage: <span style={{ color: fillerColor }}>{fillerPct}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={fillerPct}
          onChange={(e) => setFillerPct(Number(e.target.value))}
          className="w-full accent-[var(--color-magenta)]"
        />
        <div className="flex justify-between text-[9px] text-[var(--color-mute)] mt-1">
          <span>Canon 100%</span>
          <span>50/50</span>
          <span>All Filler</span>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="rounded-2xl neon-rgb-border bg-[var(--color-panel)] p-6 sm:p-8"
          >
            <h2 className="font-display text-xl font-bold mb-5 text-center">Results</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="text-center rounded-xl bg-[var(--color-void)] p-4">
                <p className="font-display text-2xl font-bold text-[var(--color-magenta)]">{fillerEps.toLocaleString()}</p>
                <p className="text-[10px] text-[var(--color-mute)] mt-0.5">Filler Episodes</p>
              </div>
              <div className="text-center rounded-xl bg-[var(--color-void)] p-4">
                <p className="font-display text-2xl font-bold text-[var(--color-cyan)]">{savedHours.toLocaleString()}</p>
                <p className="text-[10px] text-[var(--color-mute)] mt-0.5">Hours Saved</p>
              </div>
              <div className="text-center rounded-xl bg-[var(--color-void)] p-4">
                <p className="font-display text-2xl font-bold text-[var(--color-amber)]">{savedDays.toLocaleString()}</p>
                <p className="text-[10px] text-[var(--color-mute)] mt-0.5">Days Saved</p>
              </div>
              <div className="text-center rounded-xl bg-[var(--color-void)] p-4">
                <p className="font-display text-2xl font-bold text-[var(--color-magenta)]">{cleanHours.toLocaleString()}</p>
                <p className="text-[10px] text-[var(--color-mute)] mt-0.5">Canon Hours</p>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-[10px] text-[var(--color-mute)] mb-1">
                <span>Canon: {100 - fillerPct}%</span>
                <span>Filler: {fillerPct}%</span>
              </div>
              <div className="h-4 rounded-full bg-[var(--color-line)] overflow-hidden flex">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${100 - fillerPct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-cyan)]"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${fillerPct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[var(--color-magenta)]/70 to-[var(--color-magenta)]"
                />
              </div>
            </div>

            <p className="text-xs text-[var(--color-mute)] text-center">
              {total && fillerEps > 0 ? (
                <>Based on ~25 min per episode. Skip <strong className="text-[var(--color-magenta)]">{fillerEps.toLocaleString()} filler episodes</strong> to save <strong className="text-[var(--color-cyan)]">{savedHours.toLocaleString()} hours</strong> ({savedDays.toLocaleString()} days) of your life.</>
              ) : (
                <>Zero filler? A true canon-only anime. Respect. 🫡</>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <div className="mt-10 text-center">
        <Link href="/filler" className="rounded-full bg-[var(--color-magenta)] px-5 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity">
          Browse Full Filler List →
        </Link>
      </div>
    </div>
  );
}

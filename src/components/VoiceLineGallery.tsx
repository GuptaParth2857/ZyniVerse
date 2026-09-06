"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import VoiceLineCard from "./VoiceLineCard";
import { NeonFilterShell, NeonSelect } from "./NeonSelect";
import type { VoiceLine } from "@/lib/voice-lines";

const TYPE_OPTIONS = [
  { value: "", label: "All Types", emoji: "✨" },
  { value: "iconic", label: "Iconic", emoji: "⚡" },
  { value: "funny", label: "Funny", emoji: "😄" },
  { value: "inspiring", label: "Inspiring", emoji: "💪" },
  { value: "sad", label: "Sad", emoji: "🥺" },
  { value: "badass", label: "Badass", emoji: "😎" },
  { value: "romantic", label: "Romantic", emoji: "💖" },
];

const LANG_OPTIONS = [
  { value: "", label: "All Languages" },
  { value: "english", label: "English" },
  { value: "japanese", label: "Japanese" },
  { value: "hindi", label: "Hindi" },
  { value: "tamil", label: "Tamil" },
  { value: "telugu", label: "Telugu" },
];

const CARD_EASE = [0.22, 1, 0.36, 1] as const;

export default function VoiceLineGallery() {
  const [lines, setLines] = useState<VoiceLine[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [charFilter, setCharFilter] = useState("");
  const [langFilter, setLangFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [charOptions, setCharOptions] = useState<{ name: string; count: number }[]>([]);
  const [quoteOfDay, setQuoteOfDay] = useState<VoiceLine | null>(null);

  const limit = 20;

  useEffect(() => {
    fetch("/api/voice-lines/daily")
      .then((r) => r.json())
      .then((d) => setQuoteOfDay(d.line))
      .catch(() => {});
    fetch("/api/voice-lines/characters")
      .then((r) => r.json())
      .then((d) => setCharOptions(d.characters))
      .catch(() => {});
  }, []);

  const fetchLines = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (charFilter) params.set("character", charFilter);
    if (langFilter) params.set("language", langFilter);
    if (typeFilter) params.set("type", typeFilter);
    params.set("page", String(page));
    params.set("limit", String(limit));

    try {
      const res = await fetch(`/api/voice-lines?${params}`);
      const data = await res.json();
      setLines(data.lines);
      setTotal(data.total);
    } catch {
      setLines([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, charFilter, langFilter, typeFilter, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLines();
  }, [fetchLines]);

  function handleRandom() {
    setLoading(true);
    fetch("/api/voice-lines/random")
      .then((r) => r.json())
      .then((d) => {
        setLines([d.line]);
        setTotal(1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  function handleReset() {
    setSearch("");
    setCharFilter("");
    setLangFilter("");
    setTypeFilter("");
    setPage(1);
  }

  const totalPages = Math.ceil(total / limit);
  const isFiltered = !!(search || charFilter || langFilter || typeFilter);

  const filterBase =
    "w-full bg-transparent text-sm outline-none text-[var(--color-ink)] placeholder:text-[var(--color-mute)]";

  return (
    <div className="space-y-8">
      {/* ─────────── QUOTE OF THE DAY ─────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: CARD_EASE }}
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-magenta)]/40 bg-[var(--color-magenta)]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-magenta)] shadow-[0_0_16px_rgba(255,64,146,0.25)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-magenta)] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-magenta)]" />
            </span>
            ✦ Quote of the Day
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-[var(--color-magenta)]/40 to-transparent" />
        </div>
        {quoteOfDay && <VoiceLineCard line={quoteOfDay} index={0} />}
      </motion.div>

      {/* ─────────── FILTERS ─────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: CARD_EASE }}
        className="glass-panel sticky top-20 z-30 p-3 lg:top-16"
      >
        <div className="flex flex-wrap items-stretch gap-3">
          <NeonFilterShell className="flex-1 min-w-[220px]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-3.5 shrink-0 text-[var(--color-mute)] group-focus-within:text-[var(--color-magenta)] transition-colors">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search quotes, characters, anime..."
              className={`${filterBase} flex-1 py-3 pr-4`}
            />
          </NeonFilterShell>

          <NeonSelect
            value={charFilter}
            onChange={(v) => { setCharFilter(v); setPage(1); }}
            placeholder="All Characters"
            panelClassName="min-w-[320px]"
            options={[{ value: "", label: "All Characters" }, ...charOptions.map((c) => ({ value: c.name, label: c.name, badge: String(c.count) }))]}
          />

          <NeonSelect
            value={langFilter}
            onChange={(v) => { setLangFilter(v); setPage(1); }}
            placeholder="All Languages"
            options={LANG_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />

          <NeonFilterShell>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={handleRandom}
              className="px-4 py-2.5 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:text-white"
            >
              <span className="bg-gradient-to-r from-[#ff00e6] via-[var(--color-cyan)] to-[var(--color-magenta)] bg-clip-text text-transparent">🎲 Random Quote</span>
            </motion.button>
          </NeonFilterShell>
        </div>

        {/* Type pills */}
        <div className="mt-3 flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => { setTypeFilter(o.value); setPage(1); }}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                typeFilter === o.value
                  ? "border-[var(--color-cyan)] bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] shadow-[0_0_14px_rgba(0,255,224,0.2)]"
                  : "border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]/60 hover:text-[var(--color-cyan)]"
              }`}
            >
              <span className="mr-1">{o.emoji}</span>
              {o.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Active filter chips */}
      {isFiltered && (
        <div className="flex flex-wrap items-center gap-2">
          {search && (
            <button onClick={() => { setSearch(""); setPage(1); }} className="glass-tag">
              🔍 {search}
              <span className="ml-1 text-white">×</span>
            </button>
          )}
          {charFilter && (
            <button onClick={() => { setCharFilter(""); setPage(1); }} className="glass-tag">
              👤 {charFilter}
              <span className="ml-1 text-white">×</span>
            </button>
          )}
          {langFilter && (
            <button onClick={() => { setLangFilter(""); setPage(1); }} className="glass-tag">
              🌐 {LANG_OPTIONS.find((o) => o.value === langFilter)?.label}
              <span className="ml-1 text-white">×</span>
            </button>
          )}
          {typeFilter && (
            <button onClick={() => { setTypeFilter(""); setPage(1); }} className="glass-tag">
              {TYPE_OPTIONS.find((o) => o.value === typeFilter)?.emoji} {TYPE_OPTIONS.find((o) => o.value === typeFilter)?.label}
              <span className="ml-1 text-white">×</span>
            </button>
          )}
          <button onClick={handleReset} className="text-[11px] font-medium text-[var(--color-cyan)] hover:underline">
            Clear all
          </button>
        </div>
      )}

      {/* ─────────── CONTENT ─────────── */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="shimmer h-1.5 w-8 rounded-full" />
                <div className="shimmer h-4 w-16 rounded-full" />
              </div>
              <div className="space-y-2.5">
                <div className="shimmer h-4 w-full rounded" />
                <div className="shimmer h-4 w-4/5 rounded" />
                <div className="shimmer h-4 w-3/5 rounded" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="shimmer h-4 w-24 rounded" />
                <div className="shimmer h-4 w-16 rounded" />
              </div>
              <div className="mt-4 flex gap-2 border-t border-[var(--color-line)] pt-3">
                <div className="shimmer h-8 w-20 rounded-md" />
                <div className="shimmer h-8 w-20 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : lines.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: CARD_EASE }}
          className="glass-panel flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 animate-[spin_6s_linear_infinite] rounded-3xl border-2 border-dashed border-[var(--color-violet)]/40" />
            <span className="text-5xl">💬</span>
          </div>
          <p className="font-display text-xl font-bold text-white">No quotes found</p>
          <p className="mt-2 max-w-sm text-sm text-[var(--color-mute)]">
            {isFiltered
              ? "Try adjusting your filters or search — there may be no voice lines matching yet."
              : "The library is empty. Check back soon for more iconic anime quotes!"}
          </p>
          {isFiltered && (
            <button
              onClick={handleReset}
              className="neon-banner-btn mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-[var(--color-void)]"
            >
              Clear all filters
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: CARD_EASE }}
        >
          <div className="mb-4 flex items-center gap-3">
            <p className="text-sm text-[var(--color-mute)]">
              Showing <span className="font-semibold text-[var(--color-cyan)]">{lines.length}</span> of{" "}
              <span className="font-semibold text-[var(--color-cyan)]">{total}</span> quotes
            </p>
            <span className="h-px flex-1 bg-gradient-to-r from-[var(--color-line)] to-transparent" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lines.map((l, i) => (
              <VoiceLineCard key={l.id} line={l} index={i} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="neon-btn btn-magnetic rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-[var(--color-mute)] transition-colors hover:text-[var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-30"
              >
                ← Previous
              </button>
              <span className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2.5 text-sm font-mono text-[var(--color-cyan)]">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="neon-btn btn-magnetic rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-[var(--color-mute)] transition-colors hover:text-[var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

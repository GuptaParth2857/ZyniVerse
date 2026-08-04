"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import VoiceLineCard from "./VoiceLineCard";
import { CardGridSkeleton } from "./Skeletons";
import { NeonFilterShell, NeonSelect } from "./NeonSelect";
import type { VoiceLine } from "@/lib/voice-lines";

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "iconic", label: "Iconic" },
  { value: "funny", label: "Funny" },
  { value: "inspiring", label: "Inspiring" },
  { value: "sad", label: "Sad" },
  { value: "badass", label: "Badass" },
  { value: "romantic", label: "Romantic" },
];

const LANG_OPTIONS = [
  { value: "", label: "All Languages" },
  { value: "english", label: "English" },
  { value: "japanese", label: "Japanese" },
  { value: "hindi", label: "Hindi" },
  { value: "tamil", label: "Tamil" },
  { value: "telugu", label: "Telugu" },
];

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

  const filterBase =
    "w-full bg-transparent text-sm outline-none text-[var(--color-ink)] placeholder:text-[var(--color-mute)]";

  return (
    <div className="space-y-8">
      {quoteOfDay && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-full border border-[var(--color-magenta)]/40 bg-[var(--color-magenta)]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-magenta)] shadow-[0_0_16px_rgba(255,64,146,0.25)]">
              ✦ Quote of the Day
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-[var(--color-magenta)]/40 to-transparent" />
          </div>
          <VoiceLineCard line={quoteOfDay} index={0} />
        </motion.div>
      )}

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

      <div className="flex flex-wrap gap-2">
        {TYPE_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => { setTypeFilter(o.value); setPage(1); }}
            className={`rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              typeFilter === o.value
                ? "border-[var(--color-cyan)] bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] shadow-[0_0_14px_rgba(0,255,224,0.2)]"
                : "border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]/60 hover:text-[var(--color-cyan)]"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {loading ? (
        <CardGridSkeleton count={8} />
      ) : lines.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/50 px-6 py-16">
          <p className="text-lg text-[var(--color-mute)]">No quotes found</p>
          <p className="text-sm text-[var(--color-mute)]/70">Try a different search or clear your filters.</p>
          <button
            onClick={handleReset}
            className="rounded-xl border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-5 py-2.5 text-sm font-semibold text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/20 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <p className="text-sm text-[var(--color-mute)]">
              Showing <span className="font-semibold text-[var(--color-cyan)]">{lines.length}</span> of{" "}
              <span className="font-semibold text-[var(--color-cyan)]">{total}</span> quotes
            </p>
            <span className="h-px flex-1 bg-gradient-to-r from-[var(--color-line)] to-transparent" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lines.map((l, i) => (
              <VoiceLineCard key={l.id} line={l} index={i} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-2.5 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:border-[var(--color-cyan)]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← Previous
              </button>
              <span className="rounded-xl bg-[var(--color-panel)] border border-[var(--color-line)] px-4 py-2.5 text-sm text-[var(--color-cyan)]">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-2.5 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:border-[var(--color-cyan)]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import VoiceLineCard from "./VoiceLineCard";
import { CardGridSkeleton } from "./Skeletons";
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

  return (
    <div className="space-y-8">
      {quoteOfDay && (
        <div className="rounded-2xl border border-[var(--color-magenta)]/30 bg-gradient-to-br from-[var(--color-panel)] to-[var(--color-void)] p-6 sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-magenta)]">
            Quote of the Day
          </p>
          <VoiceLineCard line={quoteOfDay} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search quotes, characters, anime..."
          className="flex-1 min-w-[200px] rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors"
        />
        <select
          value={charFilter}
          onChange={(e) => { setCharFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors"
        >
          <option value="">All Characters</option>
          {charOptions.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name} ({c.count})
            </option>
          ))}
        </select>
        <select
          value={langFilter}
          onChange={(e) => { setLangFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors"
        >
          {LANG_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          onClick={handleRandom}
          className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-sm text-[var(--color-cyan)] hover:bg-cyan-500/10 transition-colors"
        >
          Random Quote
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TYPE_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => { setTypeFilter(o.value); setPage(1); }}
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
              typeFilter === o.value
                ? "border-[var(--color-cyan)] bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]"
                : "border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {loading ? (
        <CardGridSkeleton count={8} />
      ) : lines.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <p className="text-lg text-[var(--color-mute)]">No quotes found</p>
          <button
            onClick={handleReset}
            className="rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-cyan)] hover:bg-cyan-500/10 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-[var(--color-mute)]">
            Showing {lines.length} of {total} quotes
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lines.map((l) => (
              <VoiceLineCard key={l.id} line={l} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm text-[var(--color-mute)]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

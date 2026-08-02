"use client";

import { useState, useEffect, useMemo } from "react";
import { getIndianVoiceActors } from "@/lib/voice-actors";
import type { VoiceActor } from "@/lib/voice-actors";
import VoiceActorCard from "@/components/VoiceActorCard";
import { PageTransition } from "@/components/PageTransition";

const LANGUAGES = ["All", "Hindi", "Tamil", "Telugu"] as const;

export default function IndianVoiceActorsClient() {
  const [actors, setActors] = useState<VoiceActor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeLang, setActiveLang] = useState<string>("All");

  useEffect(() => {
    getIndianVoiceActors()
      .then(setActors)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = actors;
    if (activeLang !== "All") {
      list = list.filter((a) => a.languages?.includes(activeLang));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.roles.some(
            (r) =>
              r.characterName.toLowerCase().includes(q) ||
              r.animeTitle.toLowerCase().includes(q)
          )
      );
    }
    return list;
  }, [actors, activeLang, search]);

  const langCounts = useMemo(() => {
    const counts: Record<string, number> = { All: actors.length, Hindi: 0, Tamil: 0, Telugu: 0 };
    for (const a of actors) {
      for (const l of a.languages || []) {
        if (l in counts) counts[l]++;
      }
    }
    return counts;
  }, [actors]);

  return (
    <PageTransition>
      <div className="mx-auto min-h-[80vh] max-w-7xl px-4 py-10 sm:px-6">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
            <h1 className="font-display text-4xl sm:text-5xl font-bold">
              Indian Voice{" "}
              <span className="bg-gradient-to-r from-[var(--color-magenta)] via-[var(--color-cyan)] to-[var(--color-violet)] bg-clip-text text-transparent">
                Actors
              </span>
            </h1>
          </div>
          <p className="mt-3 text-[var(--color-mute)] text-sm max-w-xl mx-auto">
            The real artists behind your favourite Hindi, Tamil &amp; Telugu anime dubs.
            Verified from Crunchyroll, Sony YAY!, Muse India, Amazon Prime &amp; Cartoon Network credits.
          </p>
        </div>

        {/* Search + Language Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          {/* Search — Neon RGB Border */}
          <div className="relative flex-1 w-full sm:max-w-md group">
            <div className="absolute -inset-[2px] rounded-xl opacity-70 group-focus-within:opacity-100 transition-opacity duration-300">
              <div className="va-neon-search-border absolute inset-0 rounded-xl" />
            </div>
            <div className="relative flex items-center gap-2 rounded-xl border border-transparent bg-[var(--color-panel)] px-4 py-2.5">
              <svg className="w-4 h-4 text-[var(--color-mute)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, character or anime..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-mute)]/50"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-[var(--color-mute)] hover:text-[var(--color-ink)] text-xs transition-colors">
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Language Tabs */}
          <div className="flex gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  activeLang === lang
                    ? "bg-[var(--color-magenta)] text-black shadow-[0_0_12px_rgba(255,45,120,0.4)]"
                    : "neon-rgb-border bg-[var(--color-panel)] text-[var(--color-mute)] hover:border-[var(--color-magenta)]/50 hover:text-[var(--color-ink)]"
                }`}
              >
                {lang}
                <span className="ml-1.5 text-[10px] opacity-60">{langCounts[lang]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-[var(--color-panel)] border border-[var(--color-line)]">
                <div className="aspect-square bg-[var(--color-void)] rounded-t-xl" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-[var(--color-line)] rounded w-3/4" />
                  <div className="h-2 bg-[var(--color-line)] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--color-mute)] text-sm">No voice actors found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((actor) => (
              <VoiceActorCard key={actor.id} actor={actor} neon />
            ))}
          </div>
        )}

        {/* Stats */}
        {!loading && (
          <div className="mt-12 text-center">
            <p className="text-xs text-[var(--color-mute)]">
              {filtered.length} voice actor{filtered.length !== 1 ? "s" : ""} displayed
              {activeLang !== "All" && ` • Filtered by ${activeLang}`}
              {search && ` • Searching "${search}"`}
            </p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

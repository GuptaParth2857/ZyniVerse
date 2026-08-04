"use client";

import { useState, useEffect, useMemo } from "react";
import { getGlobalVoiceActors } from "@/lib/global-voice-actors";
import type { VoiceActor } from "@/lib/voice-actors";
import VoiceActorCard from "@/components/VoiceActorCard";
import TiltCard from "@/components/TiltCard";
import { PageTransition } from "@/components/PageTransition";
import NativeBannerAd from "@/components/NativeBannerAd";

const LANGUAGES = ["All", "Japanese", "English"] as const;

export default function VoiceActorsClient() {
  const [actors, setActors] = useState<VoiceActor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeLang, setActiveLang] = useState<string>("All");

  useEffect(() => {
    getGlobalVoiceActors()
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
          a.nativeName?.toLowerCase().includes(q) ||
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
    const counts: Record<string, number> = { All: actors.length, Japanese: 0, English: 0 };
    for (const a of actors) {
      for (const l of a.languages || []) {
        if (l in counts) counts[l]++;
      }
    }
    return counts;
  }, [actors]);

  const totalRoles = useMemo(
    () => actors.reduce((sum, a) => sum + a.roles.length, 0),
    [actors]
  );

  const stats = useMemo(
    () => [
      { label: "Voice Actors", value: actors.length },
      { label: "Anime Roles", value: totalRoles },
      { label: "Languages", value: LANGUAGES.length - 1 },
      { label: "Shows Covered", value: new Set(actors.flatMap((a) => a.roles.map((r) => r.animeTitle))).size },
    ],
    [actors, totalRoles]
  );

  return (
    <PageTransition>
      <div className="mx-auto min-h-[80vh] max-w-7xl px-4 py-10 sm:px-6">
        {/* Hero */}
        <div className="relative text-center mb-8">
          <div
            className="pointer-events-none absolute left-1/2 top-0 -z-10 h-64 w-[min(90vw,640px)] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(255,45,120,0.35), rgba(0,229,255,0.25), transparent 70%)" }}
          />
          <div className="neon-rgb-border inline-block rounded-xl px-4 py-2">
            <h1 className="font-display text-4xl font-bold sm:text-5xl">
              Voice{" "}
              <span className="bg-gradient-to-r from-[var(--color-magenta)] via-[var(--color-cyan)] to-[var(--color-violet)] bg-clip-text text-transparent">
                Actors
              </span>
            </h1>
          </div>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--color-mute)]">
            Japanese seiyuu &amp; English dub artists behind your favourite anime.
            Curated from AniList across 20+ iconic shows.
          </p>

          {/* Stats strip */}
          {!loading && actors.length > 0 && (
            <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-2 sm:gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]/70 px-4 py-2 text-center backdrop-blur"
                >
                  <div className="bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-cyan)] bg-clip-text font-mono text-lg font-bold text-transparent">
                    {s.value}
                  </div>
                  <div className="text-[9px] uppercase tracking-widest text-[var(--color-mute)]">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search + Language Filter */}
        <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row">
          {/* Search */}
          <div className="relative flex w-full flex-1 items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2.5 transition-colors focus-within:border-[var(--color-magenta)] sm:max-w-md">
            <svg className="h-4 w-4 shrink-0 text-[var(--color-mute)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, character or anime..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ outline: "none" }}
              className="w-full bg-transparent text-sm text-[var(--color-ink)] placeholder:text-[var(--color-mute)]/50"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-xs text-[var(--color-mute)] transition-colors hover:text-[var(--color-ink)]">
                ✕
              </button>
            )}
          </div>

          {/* Language Tabs */}
          <div className="flex flex-wrap gap-2">
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]">
                <div className="aspect-[3/4] rounded-t-xl bg-[var(--color-void)]" />
                <div className="space-y-2 p-3">
                  <div className="h-3 w-3/4 rounded bg-[var(--color-line)]" />
                  <div className="h-2 w-1/2 rounded bg-[var(--color-line)]" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-[var(--color-mute)]">No voice actors found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filtered.map((actor, i) => (
              <TiltCard key={actor.id} index={i}>
                <VoiceActorCard actor={actor} neon />
              </TiltCard>
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

        <div className="mx-auto max-w-7xl pb-6 mt-8">
          <NativeBannerAd />
        </div>
      </div>
    </PageTransition>
  );
}

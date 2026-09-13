"use client";

import { useState, useEffect } from "react";
import { bestTitle } from "@/lib/anilist";
import AZAnimeCard, { AZCardSkeleton } from "@/components/AZAnimeCard";
import { PageTransition } from "@/components/PageTransition";
import NativeBannerAd from "@/components/NativeBannerAd";
import type { Media } from "@/lib/anilist";

const LETTERS = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

const HERO_TAGS = [
  { label: "Anime", emoji: "🎬", color: "#22d3ee" },
  { label: "Manga", emoji: "📖", color: "#f97316" },
  { label: "Fan Favorites", emoji: "💜", color: "#a78bfa" },
  { label: "Trending", emoji: "🔥", color: "#ef4444" },
];

const HERO_STATS = [
  { icon: "🔤", label: "27 Letters" },
  { icon: "🎬", label: "30 Per Page" },
  { icon: "⭐", label: "Popular Picks" },
];

const TICKER_ITEMS = [
  { label: "Shonen", emoji: "🍥", color: "#facc15" },
  { label: "Action", emoji: "⚔️", color: "#f87171" },
  { label: "Isekai", emoji: "💫", color: "#60a5fa" },
  { label: "Romance", emoji: "💖", color: "#f472b6" },
  { label: "Comedy", emoji: "🤣", color: "#4ade80" },
  { label: "Slice of Life", emoji: "👑", color: "#34d399" },
  { label: "Fantasy", emoji: "🔮", color: "#a78bfa" },
  { label: "Seinen", emoji: "🕶️", color: "#22d3ee" },
  { label: "Horror", emoji: "😱", color: "#94a3b8" },
  { label: "Sports", emoji: "🏀", color: "#fb923c" },
];

export default function AZPage() {
  const [activeLetter, setActiveLetter] = useState<string>("A");
  const [results, setResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setResults([]);
    setPage(1);
    /* eslint-enable react-hooks/set-state-in-effect */

    const query = activeLetter === "#" ? "" : activeLetter;

    fetch(`/api/anilist/search-media?search=${encodeURIComponent(query)}&sort=POPULARITY_DESC&perPage=30&page=1`)
      .then((r) => r.json())
      .then((d: { media: Media[]; pageInfo: { total: number } }) => {
        if (cancelled) return;
        const filtered = activeLetter === "#"
          ? d.media.filter((m) => !/^[a-zA-Z]/.test(bestTitle(m.title)[0] || ""))
          : d.media.filter((m) => bestTitle(m.title)[0]?.toUpperCase() === activeLetter);
        setResults(filtered);
        setTotalPages(Math.ceil(d.pageInfo.total / 30));
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [activeLetter]);

  useEffect(() => {
    if (page <= 1) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    const query = activeLetter === "#" ? "" : activeLetter;

    fetch(`/api/anilist/search-media?search=${encodeURIComponent(query)}&sort=POPULARITY_DESC&perPage=30&page=${page}`)
      .then((r) => r.json())
      .then((d: { media: Media[]; pageInfo: { total: number } }) => {
        if (cancelled) return;
        const filtered = activeLetter === "#"
          ? d.media.filter((m) => !/^[a-zA-Z]/.test(bestTitle(m.title)[0] || ""))
          : d.media.filter((m) => bestTitle(m.title)[0]?.toUpperCase() === activeLetter);
        setResults((prev) => [...prev, ...filtered]);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [page, activeLetter]);

  return (
    <PageTransition>
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6">
        {/* Background glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] opacity-40 blur-[120px]"
          style={{
            background:
              "radial-gradient(50% 50% at 25% 20%, rgba(138,92,255,0.5), transparent 70%), radial-gradient(50% 50% at 75% 15%, rgba(255,45,120,0.4), transparent 70%), radial-gradient(40% 40% at 50% 80%, rgba(41,242,224,0.25), transparent 70%)",
          }}
        />

        {/* ─────────── HERO ─────────── */}
        <section className="neon-rgb-border relative overflow-hidden rounded-3xl bg-[var(--color-panel)]/60 py-14 text-center backdrop-blur-sm sm:py-16">
          <div className="neon-banner-card pointer-events-none absolute inset-0" />

          {/* Top shine line */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

          {/* Scanline sweep */}
          <div aria-hidden className="scanline-sweep" />

          {/* HUD corner brackets */}
          <div aria-hidden className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-[var(--color-cyan)]/50" />
          <div aria-hidden className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-[var(--color-cyan)]/50" />
          <div aria-hidden className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-[var(--color-magenta)]/50" />
          <div aria-hidden className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-[var(--color-magenta)]/50" />

          {/* Floating emojis (desktop) */}
          <span aria-hidden className="pointer-events-none absolute left-10 top-10 hidden text-3xl opacity-40 float-anim md:block">🔤</span>
          <span aria-hidden className="pointer-events-none absolute right-12 top-14 hidden text-3xl opacity-40 float-anim md:block" style={{ animationDelay: "0.9s" }}>📚</span>
          <span aria-hidden className="pointer-events-none absolute bottom-12 left-14 hidden text-2xl opacity-30 float-anim md:block" style={{ animationDelay: "0.45s" }}>⭐</span>
          <span aria-hidden className="pointer-events-none absolute bottom-14 right-14 hidden text-2xl opacity-30 float-anim md:block" style={{ animationDelay: "1.3s" }}>🎬</span>

          {/* Breathing orbs */}
          <div aria-hidden className="pointer-events-none absolute left-[10%] top-1/2 hidden h-28 w-28 -translate-y-1/2 rounded-full bg-[var(--color-cyan)]/25 blur-[55px] float-anim md:block" />
          <div aria-hidden className="pointer-events-none absolute right-[10%] top-1/2 hidden h-28 w-28 -translate-y-1/2 rounded-full bg-[var(--color-magenta)]/25 blur-[55px] float-anim md:block" style={{ animationDelay: "1.5s" }} />

          <div className="relative z-10 mx-auto max-w-3xl px-6">
            {/* Rotating conic halo behind title */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
              style={{
                background: "conic-gradient(from 0deg, var(--color-magenta), var(--color-cyan), var(--color-violet), var(--color-magenta))",
                animation: "spin 10s linear infinite",
              }}
            />

            <div className="relative">
              <p className="console-label mb-4 flex animate-hero-text items-center justify-center gap-2" style={{ animationDelay: "0.05s" }}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-cyan)] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)]" />
                </span>
                A–Z Library · Alphabetical Index
              </p>

              <h1
                className="neon-text-gradient animate-hero-text font-display text-4xl font-black tracking-tight sm:text-6xl"
                style={{ filter: "drop-shadow(0 0 28px rgba(138,92,255,0.35))", animationDelay: "0.15s" }}
              >
                A – Z Anime Index
              </h1>

              <p className="mx-auto mt-4 max-w-xl animate-hero-text text-sm text-[var(--color-mute)] sm:text-base" style={{ animationDelay: "0.25s" }}>
                Browse every anime alphabetically. Click a letter to explore popular titles starting with it.
              </p>

              {/* Stats */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {HERO_STATS.map((s) => (
                  <span
                    key={s.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-void)]/50 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)] backdrop-blur-sm"
                  >
                    {s.icon} {s.label}
                  </span>
                ))}
              </div>

              {/* Content type chips */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {HERO_TAGS.map((tag) => (
                  <span
                    key={tag.label}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:brightness-125"
                    style={{ color: tag.color, borderColor: `${tag.color}55`, background: `${tag.color}14` }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: tag.color, boxShadow: `0 0 8px ${tag.color}` }} />
                    {tag.emoji} {tag.label}
                  </span>
                ))}
              </div>

              {/* Scroll hint */}
              <div className="mt-6 flex flex-col items-center gap-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-mute)]">
                  Scroll to explore
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-bounce text-[var(--color-cyan)]">
                  <path d="M12 5v14m0 0l-6-6m6 6l6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Neon marquee ticker band */}
          <div aria-hidden className="ticker-window relative z-10 mt-8 border-t border-[var(--color-line)] bg-[var(--color-void)]/40 py-3">
            <div className="ticker-track flex w-max items-center gap-10 whitespace-nowrap px-8">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
                <span key={i} className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em]">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.color, boxShadow: `0 0 8px ${t.color}` }} />
                  <span className="text-base leading-none" style={{ textShadow: `0 0 10px ${t.color}aa` }}>{t.emoji}</span>
                  <span className="text-[var(--color-mute)]">{t.label}</span>
                  <span className="ml-6 select-none text-[var(--color-magenta)]/40">✦</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────── LETTER PICKER ─────────── */}
        <section className="mt-10">
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-cyan)] shadow-[0_0_16px_rgba(0,255,224,0.25)]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-cyan)] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)]" />
              </span>
              ✦ Pick a Letter
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-[var(--color-cyan)]/40 to-transparent" />
          </div>

          {/* Letter grid */}
          <div className="neon-rgb-border rounded-3xl p-[1.5px]">
            <div className="rounded-[22.5px] bg-[var(--color-panel)]/70 p-3 backdrop-blur-sm sm:p-4">
              <div className="flex flex-wrap gap-2">
                {LETTERS.map((l) => (
                  <button
                    key={l}
                    onClick={() => { setActiveLetter(l); setPage(1); }}
                    className={`flex-1 min-w-[2.25rem] max-w-[3.5rem] h-11 rounded-xl font-mono text-sm font-bold transition-all ${
                      activeLetter === l
                        ? "border border-[var(--color-cyan)] bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] shadow-[0_0_14px_rgba(0,255,224,0.2)]"
                        : "border border-[var(--color-line)] bg-[var(--color-void)]/40 text-[var(--color-mute)] hover:border-[var(--color-cyan)]/60 hover:bg-white/5 hover:text-[var(--color-cyan)]"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        {loading && results.length === 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => <AZCardSkeleton key={i} />)}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--color-mute)] text-lg">No anime found starting with <span className="text-white font-bold">{activeLetter}</span></p>
          </div>
        ) : (
          <>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
              {results.map((a, i) => <AZAnimeCard key={a.id} anime={a} index={i} />)}
            </div>
            {page < totalPages && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="neon-rgb-border rounded-xl px-8 py-3 text-sm font-semibold text-white hover:bg-white/5 transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-6">
        <NativeBannerAd />
      </div>
    </PageTransition>
  );
}
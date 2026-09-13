"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { bestTitle } from "@/lib/anilist";
import { CardSkeleton } from "@/components/Loader";
import { PageTransition } from "@/components/PageTransition";
import type { Media } from "@/lib/anilist";

const TABS = [
  { id: "SCORE_DESC", label: "Top Rated" },
  { id: "POPULARITY_DESC", label: "Most Popular" },
  { id: "TRENDING_DESC", label: "Trending" },
] as const;

const GENRE_CATEGORIES = [
  { id: "Action", emoji: "⚔️" },
  { id: "Romance", emoji: "💕" },
  { id: "Comedy", emoji: "😂" },
  { id: "Fantasy", emoji: "🗡️" },
  { id: "Psychological", emoji: "🧠" },
  { id: "Horror", emoji: "👻" },
] as const;

const HERO_TAGS = [
  { label: "Action", emoji: "⚔️", color: "#f97316" },
  { label: "Romance", emoji: "💕", color: "#f472b6" },
  { label: "Comedy", emoji: "😂", color: "#4ade80" },
  { label: "Fantasy", emoji: "🗡️", color: "#a78bfa" },
];

const HERO_STATS = [
  { icon: "🏆", label: "Top Rated" },
  { icon: "🔥", label: "Most Popular" },
  { icon: "📈", label: "Trending" },
];

const TICKER_ITEMS = [
  { label: "Top Rated", emoji: "🏆", color: "#facc15" },
  { label: "Most Popular", emoji: "🔥", color: "#f87171" },
  { label: "Trending", emoji: "📈", color: "#22d3ee" },
  { label: "Action", emoji: "⚔️", color: "#fb923c" },
  { label: "Romance", emoji: "💕", color: "#f472b6" },
  { label: "Comedy", emoji: "😂", color: "#4ade80" },
  { label: "Fantasy", emoji: "🗡️", color: "#a78bfa" },
  { label: "Psychological", emoji: "🧠", color: "#60a5fa" },
  { label: "Horror", emoji: "👻", color: "#94a3b8" },
];

export default function TopAnimePage() {
  const [list, setList] = useState<Media[]>([]);
  const [genreLists, setGenreLists] = useState<Record<string, Media[]>>({});
  const [loading, setLoading] = useState(true);
  const [genreLoading, setGenreLoading] = useState(true);
  const [tab, setTab] = useState("SCORE_DESC");

  const fetcher = useMemo(() => ({
    SCORE_DESC: "/api/anilist/top-rated?perPage=30",
    POPULARITY_DESC: "/api/anilist/popular?perPage=30",
    TRENDING_DESC: "/api/anilist/trending?perPage=30",
  }), []);

  useEffect(() => {
    let c = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(fetcher[tab as keyof typeof fetcher])
      .then((r) => r.json())
      .then((d) => { if (!c) setList(d); })
      .catch(() => { if (!c) setList([]); })
      .finally(() => { if (!c) setLoading(false); });
    return () => { c = true; };
  }, [tab, fetcher]);

  useEffect(() => {
    let c = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGenreLoading(true);
    Promise.all(GENRE_CATEGORIES.map((g) => fetch(`/api/anilist/recommendations?genre=${encodeURIComponent(g.id)}&perPage=5`).then((r) => r.json())))
      .then((results) => {
        if (!c) {
          const map: Record<string, Media[]> = {};
          GENRE_CATEGORIES.forEach((g, i) => { map[g.id] = results[i]; });
          setGenreLists(map);
        }
      })
      .catch(() => { if (!c) setGenreLists({}); })
      .finally(() => { if (!c) setGenreLoading(false); });
    return () => { c = true; };
  }, []);

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6">
        {/* Background glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] opacity-40 blur-[120px]"
          style={{
            background:
              "radial-gradient(50% 50% at 25% 20%, rgba(138,92,255,0.5), transparent 70%), radial-gradient(50% 50% at 75% 15%, rgba(255,45,120,0.4), transparent 70%), radial-gradient(40% 40% at 50% 80%, rgba(41,242,224,0.25), transparent 70%)",
          }}
        />

        <nav className="mb-6 flex items-center gap-2 text-xs text-[var(--color-mute)]">
          <Link href="/" className="hover:text-[var(--color-cyan)]">Home</Link>
          <span>/</span>
          <span className="text-[var(--color-ink)]">Top Anime</span>
        </nav>

        {/* ─────────── HERO ─────────── */}
        <section className="neon-rgb-border relative overflow-hidden rounded-3xl bg-[var(--color-panel)]/60 py-14 text-center backdrop-blur-sm sm:py-20">
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
          <span aria-hidden className="pointer-events-none absolute left-10 top-10 hidden text-3xl opacity-40 float-anim md:block">🏆</span>
          <span aria-hidden className="pointer-events-none absolute right-12 top-14 hidden text-3xl opacity-40 float-anim md:block" style={{ animationDelay: "0.9s" }}>🔥</span>
          <span aria-hidden className="pointer-events-none absolute bottom-12 left-14 hidden text-2xl opacity-30 float-anim md:block" style={{ animationDelay: "0.45s" }}>📈</span>
          <span aria-hidden className="pointer-events-none absolute bottom-14 right-14 hidden text-2xl opacity-30 float-anim md:block" style={{ animationDelay: "1.3s" }}>⭐</span>

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
                Rankings · Updated Daily
              </p>

              <h1
                className="neon-text-gradient animate-hero-text font-display text-4xl font-black tracking-tight sm:text-6xl"
                style={{ filter: "drop-shadow(0 0 28px rgba(138,92,255,0.35))", animationDelay: "0.15s" }}
              >
                Top Anime
              </h1>

              <p className="mx-auto mt-4 max-w-xl animate-hero-text text-sm text-[var(--color-mute)] sm:text-base" style={{ animationDelay: "0.25s" }}>
                Ranked by score, popularity &amp; community favorites. Updated daily.
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

        <div className="mt-10 flex rounded-xl neon-rgb-border overflow-x-auto w-fit mb-10">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2 text-sm font-semibold transition-all whitespace-nowrap ${
                tab === t.id ? "bg-[var(--color-magenta)] text-black" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
              }`}
            >{t.label}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 15 }).map((_, i) => <CardSkeleton key={`s${i}`} />)}
            </motion.div>
          ) : (
            <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* ── Main Rankings ── */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mb-16">
                {list.map((anime, idx) => {
                  const rank = idx + 1;
                  const score = anime.averageScore || 0;
                  return (
                    <Link key={anime.id} href={`/anime/${anime.id}`}
                      className="group relative aspect-[3/4] rounded-2xl overflow-hidden neon-rgb-border transition-all"
                    >
                      <Image src={anime.coverImage?.extraLarge || anime.coverImage?.large || ""} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 20vw" unoptimized />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/85" />

                      {/* Rank corner badge */}
                      <div className={`absolute top-2 left-2 z-20 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-black backdrop-blur-sm ${
                        rank === 1 ? "bg-amber-500/80 text-black" : rank === 2 ? "bg-slate-400/80 text-black" : rank === 3 ? "bg-amber-700/80 text-white" : "bg-black/60 text-white/80"
                      }`}>
                        #{rank}
                        {rank === 1 && <span className="text-sm">👑</span>}
                      </div>

                      {/* Always visible: title at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 z-10 p-3">
                        <h3 className="text-xs font-bold leading-tight text-white/90 drop-shadow-lg line-clamp-2">
                          {bestTitle(anime.title)}
                        </h3>
                      </div>

                      {/* Hover/tap overlay: score + details */}
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center bg-black/40 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300">
                        <div className={`text-3xl font-black drop-shadow-lg ${
                          score >= 80 ? "text-[var(--color-cyan)]" : score >= 70 ? "text-[var(--color-magenta)]" : "text-white/60"
                        }`}>
                          {score}<span className="text-sm font-normal text-white/40">%</span>
                        </div>
                        <div className="mt-1.5 h-1 w-20 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)]" style={{ width: `${score}%` }} />
                        </div>
                        <p className="mt-2 text-[10px] text-white/50 font-mono">
                          {anime.format}{anime.seasonYear ? ` • ${anime.seasonYear}` : ""}
                        </p>
                        <p className="text-[10px] text-white/40">
                          {anime.popularity?.toLocaleString()} ❤ {anime.episodes ? ` • ${anime.episodes}ep` : ""}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* ── Genre Categories ── */}
              <div className="mb-16 space-y-10">
                {GENRE_CATEGORIES.map((cat) => (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="neon-rgb-border rounded-xl px-4 py-2 inline-flex items-center gap-2">
                        <span className="text-xl">{cat.emoji}</span>
                        <h2 className="font-display text-lg font-bold">Top {cat.id}</h2>
                      </div>
                      <Link href={`/search?genre=${cat.id}&sort=SCORE_DESC`} className="text-xs text-[var(--color-mute)] hover:text-white transition-colors">
                        View all →
                      </Link>
                    </div>
                    {genreLoading ? (
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="shrink-0 w-56 aspect-[3/4] rounded-2xl bg-[var(--color-panel)] animate-pulse" />
                        ))}
                      </div>
                    ) : (genreLists[cat.id]?.length > 0 ? (
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                        {(genreLists[cat.id] || []).map((anime) => {
                          const score = anime.averageScore || 0;
                          return (
                            <Link key={anime.id} href={`/anime/${anime.id}`}
                              className="group relative shrink-0 w-56 aspect-[3/4] rounded-2xl overflow-hidden neon-rgb-border transition-all"
                            >
                              <Image src={anime.coverImage?.extraLarge || anime.coverImage?.large || ""} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="224px" unoptimized />
                              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/85" />

                              <div className="absolute bottom-0 left-0 right-0 z-10 p-3">
                                <p className="text-xs font-bold leading-tight text-white/90 drop-shadow-lg line-clamp-2">{bestTitle(anime.title)}</p>
                                <div className="mt-1.5 flex items-center gap-2 text-[10px]">
                                  <span className={`font-black ${score >= 80 ? "text-[var(--color-cyan)]" : score >= 70 ? "text-[var(--color-magenta)]" : "text-white/40"}`}>
                                    {score}%
                                  </span>
                                  {anime.seasonYear && <span className="text-white/40">• {anime.seasonYear}</span>}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--color-mute)]">No results found. <Link href={`/search?genre=${cat.id}&sort=SCORE_DESC`} className="text-[var(--color-cyan)] hover:underline">Browse {cat.id} →</Link></p>
                    ))}
                  </div>
                ))}
              </div>

              {/* ── CTA ── */}
              <section className="neon-rgb-border rounded-2xl bg-[var(--color-panel)] p-8 sm:p-10 text-center max-w-3xl mx-auto">
                <h2 className="font-display text-2xl font-bold">Start Your Anime Journey</h2>
                <p className="mt-3 text-sm text-[var(--color-mute)] max-w-lg mx-auto">Build your watchlist, track progress, get AI recommendations, and join India&apos;s largest anime community.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link href="/search?sort=TRENDING_DESC" className="rounded-full bg-[var(--color-magenta)] px-6 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity">Browse All →</Link>
                  <Link href="/recommendations" className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold hover:border-[var(--color-cyan)] transition-colors">Get Recommendations</Link>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

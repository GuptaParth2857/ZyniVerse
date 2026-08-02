"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getTopRated, getPopular, getTrending, getRecommendationsByGenres, bestTitle } from "@/lib/anilist";
import { CardSkeleton } from "@/components/Loader";
import { PageTransition } from "@/components/PageTransition";
import type { Media } from "@/lib/anilist";

const PROXY = "/api/proxy-image?url=";

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

export default function TopAnimePage() {
  const [list, setList] = useState<Media[]>([]);
  const [genreLists, setGenreLists] = useState<Record<string, Media[]>>({});
  const [loading, setLoading] = useState(true);
  const [genreLoading, setGenreLoading] = useState(true);
  const [tab, setTab] = useState("SCORE_DESC");

  const fetcher = useMemo(() => ({
    SCORE_DESC: getTopRated,
    POPULARITY_DESC: getPopular,
    TRENDING_DESC: getTrending,
  }), []);

  useEffect(() => {
    let c = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetcher[tab as keyof typeof fetcher](30)
      .then((d) => { if (!c) setList(d); })
      .catch(() => { if (!c) setList([]); })
      .finally(() => { if (!c) setLoading(false); });
    return () => { c = true; };
  }, [tab, fetcher]);

  useEffect(() => {
    let c = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGenreLoading(true);
    Promise.all(GENRE_CATEGORIES.map((g) => getRecommendationsByGenres([g.id], 5)))
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
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <nav className="mb-8 flex items-center gap-2 text-xs text-[var(--color-mute)]">
          <Link href="/" className="hover:text-[var(--color-cyan)]">Home</Link>
          <span>/</span>
          <span className="text-[var(--color-ink)]">Top Anime</span>
        </nav>

        <div className="mb-8">
          <div className="neon-rgb-border rounded-xl px-5 py-3 inline-block">
            <h1 className="font-display text-3xl sm:text-5xl font-bold bg-gradient-to-r from-[var(--color-cyan)] via-[var(--color-magenta)] to-[var(--color-violet)] bg-clip-text text-transparent">
              Top Anime
            </h1>
          </div>
          <p className="mt-3 text-sm text-[var(--color-mute)]">Ranked by score, popularity & community favorites. Updated daily.</p>
        </div>

        <div className="flex rounded-xl neon-rgb-border overflow-x-auto w-fit mb-10">
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
                      <Image src={`${PROXY}${encodeURIComponent(anime.coverImage?.extraLarge || anime.coverImage?.large || "")}`} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 20vw" unoptimized />
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
                              <Image src={`${PROXY}${encodeURIComponent(anime.coverImage?.extraLarge || anime.coverImage?.large || "")}`} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="224px" unoptimized />
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

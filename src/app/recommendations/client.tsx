"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

const FADE_UP = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

const ALL_GENRES = [
  { name: "Action", icon: "⚔️", color: "#ff3366" },
  { name: "Adventure", icon: "🗺️", color: "#00ff7f" },
  { name: "Comedy", icon: "😂", color: "#ffd700" },
  { name: "Drama", icon: "🎭", color: "#ff00ff" },
  { name: "Fantasy", icon: "🐉", color: "#8a2be2" },
  { name: "Horror", icon: "👻", color: "#ff0040" },
  { name: "Romance", icon: "💕", color: "#ff69b4" },
  { name: "Sci-Fi", icon: "🚀", color: "#00ffff" },
  { name: "Slice of Life", icon: "🌸", color: "#ffb6c1" },
  { name: "Sports", icon: "⚽", color: "#00ff7f" },
  { name: "Thriller", icon: "🔪", color: "#ff6600" },
  { name: "Mystery", icon: "🔍", color: "#9370db" },
  { name: "Mecha", icon: "🤖", color: "#00bfff" },
  { name: "Supernatural", icon: "👁️", color: "#da70d6" },
];

interface AnimeRec {
  id: number;
  title: string;
  image: string;
  score: number;
  reason: string;
  format: string;
  episodes: number;
  genres: string[];
  matchTags: string[];
}

function AnimeCard({ anime }: { anime: AnimeRec }) {
  const handleClick = () => {
    fetch("/api/activity/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "click_recommendation", mediaId: anime.id, genres: anime.genres }),
    }).catch(() => {});
  };

  return (
    <Link href={`/anime/${anime.id}`} className="group/card" onClick={handleClick}>
      <div className="neon-premium rounded-xl">
        <div className="neon-premium-track rounded-xl" />
        <div className="neon-premium-overlay rounded-[10.5px]" />
        <div className="neon-premium-content">
          <div className="relative aspect-[2/3] overflow-hidden rounded-t-[10.5px]">
            <Image
              src={anime.image || "/placeholder.svg"}
              alt={anime.title}
              fill
              className="object-cover transition-transform duration-500 group-hover/card:scale-110"
              sizes="(max-width: 768px) 40vw, 20vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            {anime.score > 0 && (
              <div className="absolute top-2 right-2 rounded-full border px-2 py-0.5 text-[10px] font-mono font-bold backdrop-blur-md"
                style={{
                  background: anime.score >= 80 ? "rgba(0,255,127,0.2)" : anime.score >= 60 ? "rgba(255,215,0,0.2)" : "rgba(255,51,102,0.2)",
                  borderColor: anime.score >= 80 ? "rgba(0,255,127,0.4)" : anime.score >= 60 ? "rgba(255,215,0,0.4)" : "rgba(255,51,102,0.4)",
                  color: anime.score >= 80 ? "#00ff7f" : anime.score >= 60 ? "#ffd700" : "#ff3366",
                }}
              >
                {anime.score}
              </div>
            )}
          </div>
          <div className="p-3">
            <p className="text-xs font-bold truncate leading-tight">{anime.title}</p>
            <div className="mt-1.5 flex items-center gap-2 text-[10px] text-gray-500">
              {anime.episodes ? <span>{anime.episodes} eps</span> : null}
              {anime.format ? <span className="capitalize">{anime.format.replace("_", " ").toLowerCase()}</span> : null}
            </div>
            <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{anime.reason}</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {anime.genres?.slice(0, 2).map((g) => (
                <span key={g} className="text-[8px] font-medium text-gray-500 uppercase tracking-wider bg-white/5 px-1.5 py-0.5 rounded-full">
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function AnimeRow({ title, subtitle, icon, color, animeList, loading }: {
  title: string; subtitle: string; icon: string; color: string; animeList: AnimeRec[]; loading: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    return () => el.removeEventListener("scroll", checkScroll);
  }, [animeList]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" });
  };

  if (loading) {
    return (
      <motion.div {...FADE_UP} className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="text-2xl">{icon}</div>
          <div>
            <h2 className="font-display text-xl font-bold sm:text-2xl" style={{ color }}>{title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[140px] sm:w-[160px] animate-pulse">
              <div className="aspect-[2/3] rounded-xl bg-white/5 border border-white/10" />
              <div className="mt-2 h-3 w-3/4 rounded bg-white/5" />
              <div className="mt-1 h-3 w-1/2 rounded bg-white/5" />
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (animeList.length === 0) return null;

  return (
    <motion.div {...FADE_UP} className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{icon}</div>
          <div>
            <h2 className="font-display text-xl font-bold sm:text-2xl" style={{ color }}>{title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canScrollLeft && (
            <button onClick={() => scroll("left")} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
          )}
          {canScrollRight && (
            <button onClick={() => scroll("right")} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          )}
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2" style={{ scrollbarWidth: "none" }}>
        {animeList.map((a) => (
          <div key={a.id} className="snap-start shrink-0 w-[140px] sm:w-[160px]">
            <AnimeCard anime={a} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function RecommendationsPageClient() {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const { data: session } = useSession();
  const [trending, setTrending] = useState<AnimeRec[]>([]);
  const [aiRecs, setAiRecs] = useState<AnimeRec[]>([]);
  const [topRated, setTopRated] = useState<AnimeRec[]>([]);
  const [upcoming, setUpcoming] = useState<AnimeRec[]>([]);
  const [genreRecs, setGenreRecs] = useState<AnimeRec[]>([]);
  const [personalized, setPersonalized] = useState<AnimeRec[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingAi, setLoadingAi] = useState(true);
  const [loadingTopRated, setLoadingTopRated] = useState(true);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [loadingGenre, setLoadingGenre] = useState(false);
  const [loadingPersonalized, setLoadingPersonalized] = useState(true);

  useEffect(() => {
    fetch("/api/recommendations?type=trending").then(r => r.json()).then(d => { setTrending(d.recommendations || []); setLoadingTrending(false); }).catch(() => setLoadingTrending(false));
    fetch("/api/recommendations?type=ai").then(r => r.json()).then(d => { setAiRecs(d.recommendations || []); setLoadingAi(false); }).catch(() => setLoadingAi(false));
    fetch("/api/recommendations?type=top_rated").then(r => r.json()).then(d => { setTopRated(d.recommendations || []); setLoadingTopRated(false); }).catch(() => setLoadingTopRated(false));
    fetch("/api/recommendations?type=upcoming").then(r => r.json()).then(d => { setUpcoming(d.recommendations || []); setLoadingUpcoming(false); }).catch(() => setLoadingUpcoming(false));
    if (session?.user) {
      fetch("/api/recommendations?type=personalized").then(r => r.json()).then(d => { setPersonalized(d.recommendations || []); setLoadingPersonalized(false); }).catch(() => setLoadingPersonalized(false));
    } else {
      setLoadingPersonalized(false);
    }
  }, [session?.user]);

  useEffect(() => {
    if (!selectedGenre) { setGenreRecs([]); return; }
    setLoadingGenre(true);
    fetch("/api/activity/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "view_genre", genres: [selectedGenre] }),
    }).catch(() => {});
    fetch(`/api/recommendations?type=genre&genre=${selectedGenre}`).then(r => r.json()).then(d => { setGenreRecs(d.recommendations || []); setLoadingGenre(false); }).catch(() => setLoadingGenre(false));
  }, [selectedGenre]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-[var(--color-line)]">
        <div className="absolute inset-0 bg-[#0a0a0f]" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-20 w-72 h-72 bg-[#ff00ff]/15 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#8a2be2]/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00ffff]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(rgba(138,43,226,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,255,0.3) 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }} />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="neon-premium rounded-xl h-12 w-12">
                  <div className="neon-premium-track rounded-xl" />
                  <div className="neon-premium-overlay rounded-[10.5px]" />
                  <div className="neon-premium-content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="text-2xl">🤖</span>
                  </div>
                </div>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#00ffff]" style={{ textShadow: "0 0 10px rgba(0,255,255,0.5)" }}>AI-Powered</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-white" style={{ textShadow: "0 0 30px rgba(138,43,226,0.3), 0 0 60px rgba(255,0,255,0.2)" }}>
                Discover Your Next<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] via-[#8a2be2] to-[#00ffff]">
                  Favorite Anime
                </span>
              </h1>
              <p className="mt-3 text-base text-gray-400 max-w-lg">
                Our recommendation engine analyzes trends, genres, and community preferences to suggest anime tailored just for you.
              </p>
            </div>
            <Link href="/search">
              <div className="neon-premium rounded-xl">
                <div className="neon-premium-track rounded-xl" />
                <div className="neon-premium-overlay rounded-[10.5px]" />
                <div className="neon-premium-content" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", fontSize: 14, fontWeight: 700, color: "#8a2be2" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  Browse All
                </div>
              </div>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8a2be2] to-transparent shadow-[0_0_10px_rgba(138,43,226,0.5)]" />
      </div>

      {/* Trending Now */}
      <AnimeRow title="Trending Now" subtitle="Most popular this season" icon="🔥" color="#ff3366" animeList={trending} loading={loadingTrending} />

      {/* AI-Powered For You */}
      <AnimeRow title="AI Picks For You" subtitle="Smart recommendations based on your activity" icon="🤖" color="#8a2be2" animeList={aiRecs} loading={loadingAi} />

      {/* Top Rated */}
      <AnimeRow title="Top Rated" subtitle="Highest scored anime of all time" icon="⭐" color="#ffd700" animeList={topRated} loading={loadingTopRated} />

      {/* Upcoming */}
      <AnimeRow title="Coming Soon" subtitle="Upcoming anime to watch out for" icon="📅" color="#00ffff" animeList={upcoming} loading={loadingUpcoming} />

      {/* Genre Grid */}
      <motion.div {...FADE_UP} className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="text-2xl">🎭</div>
          <div>
            <h2 className="font-display text-xl font-bold sm:text-2xl" style={{ color: "#ff00ff" }}>Browse by Genre</h2>
            <p className="text-xs text-gray-500 mt-0.5">Pick a genre to discover hidden gems</p>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {ALL_GENRES.map((g) => (
            <button
              key={g.name}
              onClick={() => setSelectedGenre(selectedGenre === g.name ? null : g.name)}
              className="neon-premium rounded-xl transition-all"
              style={{
                boxShadow: selectedGenre === g.name ? `0 0 20px ${g.color}33` : undefined,
              }}
            >
              <div className="neon-premium-track rounded-xl" />
              <div className="neon-premium-overlay rounded-[10.5px]" />
              <div className="neon-premium-content p-3 text-center" style={{
                background: selectedGenre === g.name ? `${g.color}15` : undefined,
              }}>
                <span className="text-xl block">{g.icon}</span>
                <p className="text-[10px] font-bold mt-1 truncate" style={{ color: selectedGenre === g.name ? g.color : "#888" }}>
                  {g.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Genre-based recs */}
      {selectedGenre && (
        <div className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
          {loadingGenre ? (
            <div className="flex gap-3 overflow-hidden py-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="shrink-0 w-[140px] sm:w-[160px] animate-pulse">
                  <div className="aspect-[2/3] rounded-xl bg-white/5 border border-white/10" />
                  <div className="mt-2 h-3 w-3/4 rounded bg-white/5" />
                </div>
              ))}
            </div>
          ) : (
            <AnimeRow
              title={`${ALL_GENRES.find((g) => g.name === selectedGenre)?.icon} ${selectedGenre} Picks`}
              subtitle={`Top ${selectedGenre} anime recommended for you`}
              icon=""
              color={ALL_GENRES.find((g) => g.name === selectedGenre)?.color || "#ff00ff"}
              animeList={genreRecs}
              loading={false}
            />
          )}
        </div>
      )}

      {/* Personalized (logged in) */}
      {session?.user && personalized.length > 0 && (
        <AnimeRow title="For You" subtitle="Based on your watch history" icon="💜" color="#8a2be2" animeList={personalized} loading={loadingPersonalized} />
      )}

      {/* CTA for non-logged-in */}
      {!session?.user && (
        <motion.div {...FADE_UP} className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="neon-premium rounded-2xl">
            <div className="neon-premium-track rounded-2xl" />
            <div className="neon-premium-overlay rounded-[14.5px]" />
            <div className="neon-premium-content p-8 text-center">
              <span className="text-4xl block mb-3">💜</span>
              <h3 className="font-display text-xl font-bold mb-2">Want Personalized Picks?</h3>
              <p className="text-sm text-gray-400 mb-5 max-w-md mx-auto">
                Log in to get anime recommendations based on your watch history, favorites, and taste.
              </p>
              <Link href="/login" className="inline-block rounded-xl px-6 py-3 text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, rgba(138,43,226,0.2), rgba(255,0,255,0.1))",
                  border: "1px solid #8a2be2",
                  color: "#8a2be2",
                  boxShadow: "0 0 20px rgba(138,43,226,0.2)",
                }}
              >
                Login for Personalized Recs →
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      <div className="h-12" />
    </div>
  );
}

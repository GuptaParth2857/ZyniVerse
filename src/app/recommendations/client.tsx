"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

const slideVariants = {
  initial: { x: 120, opacity: 0, scale: 0.95 },
  animate: { x: 0, opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 80, damping: 24, mass: 0.8 } },
  exit: { x: -120, opacity: 0, scale: 0.95, transition: { duration: 0.25, ease: "easeInOut" as const } },
};

const thumbVariant = {
  hidden: { x: 30, opacity: 0 },
  visible: (i: number) => ({
    x: 0, opacity: 1,
    transition: { delay: 0.1 + i * 0.03, type: "spring" as const, stiffness: 80, damping: 20 },
  }),
};

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

type CategoryKey = "trending" | "ai" | "top_rated" | "upcoming" | "genre" | "personalized";

const CATEGORIES: { key: CategoryKey; label: string; icon: string; color: string }[] = [
  { key: "trending", label: "Trending", icon: "🔥", color: "#ff3366" },
  { key: "ai", label: "AI Picks", icon: "🤖", color: "#8a2be2" },
  { key: "top_rated", label: "Top Rated", icon: "⭐", color: "#ffd700" },
  { key: "upcoming", label: "Coming Soon", icon: "📅", color: "#00ffff" },
  { key: "genre", label: "Genre", icon: "🎭", color: "#ff00ff" },
  { key: "personalized", label: "For You", icon: "💜", color: "#8a2be2" },
];

export default function RecommendationsPageClient() {
  const { data: session } = useSession();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("trending");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

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

  const [currentIdx, setCurrentIdx] = useState(0);
  const [slideKey, setSlideKey] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const autoRef = useRef(autoPlay);
  useEffect(() => { autoRef.current = autoPlay; }, [autoPlay]);

  useEffect(() => {
    fetch("/api/recommendations?type=trending").then(r => r.json()).then(d => { setTrending(d.recommendations || []); setLoadingTrending(false); }).catch(() => setLoadingTrending(false));
    fetch("/api/recommendations?type=ai").then(r => r.json()).then(d => { setAiRecs(d.recommendations || []); setLoadingAi(false); }).catch(() => setLoadingAi(false));
    fetch("/api/recommendations?type=top_rated").then(r => r.json()).then(d => { setTopRated(d.recommendations || []); setLoadingTopRated(false); }).catch(() => setLoadingTopRated(false));
    fetch("/api/recommendations?type=upcoming").then(r => r.json()).then(d => { setUpcoming(d.recommendations || []); setLoadingUpcoming(false); }).catch(() => setLoadingUpcoming(false));
    if (session?.user) {
      fetch("/api/recommendations?type=personalized").then(r => r.json()).then(d => { setPersonalized(d.recommendations || []); setLoadingPersonalized(false); }).catch(() => setLoadingPersonalized(false));
    }
  }, [session?.user]);

  useEffect(() => {
    if (!selectedGenre) return;
    fetch("/api/activity/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "view_genre", genres: [selectedGenre] }),
    }).catch(() => {});
    fetch(`/api/recommendations?type=genre&genre=${selectedGenre}`).then(r => r.json()).then(d => { setGenreRecs(d.recommendations || []); setLoadingGenre(false); }).catch(() => setLoadingGenre(false));
  }, [selectedGenre]);

  const currentList = activeCategory === "trending" ? trending
    : activeCategory === "ai" ? aiRecs
    : activeCategory === "top_rated" ? topRated
    : activeCategory === "upcoming" ? upcoming
    : activeCategory === "genre" ? genreRecs
    : activeCategory === "personalized" ? personalized
    : [];

  const isLoading = activeCategory === "trending" ? loadingTrending
    : activeCategory === "ai" ? loadingAi
    : activeCategory === "top_rated" ? loadingTopRated
    : activeCategory === "upcoming" ? loadingUpcoming
    : activeCategory === "genre" ? loadingGenre
    : activeCategory === "personalized" ? loadingPersonalized
    : false;

  const handleCategoryChange = useCallback((key: CategoryKey) => {
    setActiveCategory(key);
    setCurrentIdx(0);
    setSlideKey(k => k + 1);
  }, []);

  const handleGenreSelect = useCallback((genre: string | null) => {
    setSelectedGenre(genre);
    if (!genre) setGenreRecs([]);
    setLoadingGenre(!!genre);
    setCurrentIdx(0);
    setSlideKey(k => k + 1);
  }, []);

  const nextSlide = useCallback(() => {
    if (currentList.length === 0) return;
    setCurrentIdx(prev => (prev + 1) % currentList.length);
    setSlideKey(k => k + 1);
  }, [currentList.length]);

  const goToSlide = useCallback((i: number) => {
    setCurrentIdx(i);
    setSlideKey(k => k + 1);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 6000);
  }, []);

  useEffect(() => {
    if (currentList.length < 2) return;
    const id = setInterval(() => {
      if (autoRef.current) nextSlide();
    }, 3500);
    return () => clearInterval(id);
  }, [nextSlide, currentList.length]);

  const current = currentList[currentIdx];
  const bgSrc = current?.image || "";
  const coverSrc = current?.image || "";

  const handleTrackClick = () => {
    if (!current) return;
    fetch("/api/activity/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "click_recommendation", mediaId: current.id, genres: current.genres }),
    }).catch(() => {});
  };

  if (isLoading && currentList.length === 0) {
    return (
      <PageTransition><div className="relative min-h-dvh flex items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d0221, #05080f 50%, #001a33)" }}
      >
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, rgba(192,38,255,0.08) 0%, transparent 60%)" }} />
        <div className="relative flex flex-col items-center gap-3">
          <motion.div className="w-8 h-8 rounded-full border border-transparent border-t-[#C026FF]"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-[10px] font-mono tracking-[0.25em] text-white/15">LOADING RECOMMENDATIONS</p>
        </div>
      </div></PageTransition>
    );
  }

  if (currentList.length === 0 && !isLoading) {
    return (
      <PageTransition><div className="relative min-h-dvh flex items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d0221, #05080f 50%, #001a33)" }}
      >
        <p className="text-white/30 text-xs">No recommendations found.</p>
      </div></PageTransition>
    );
  }

  return (
    <PageTransition><div className="relative min-h-dvh flex flex-col overflow-hidden select-none"
      style={{ background: "linear-gradient(135deg, #0d0221, #05080f 50%, #001a33)" }}
    >
      {/* bg image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current?.id || "empty"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="relative w-full h-full">
            <Image src={bgSrc} alt="" fill className="object-cover object-center" sizes="100vw" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#05080f]/70 via-[#05080f]/50 to-[#05080f]/90" />
        </motion.div>
      </AnimatePresence>

      {/* top bar */}
      <div className="relative z-20 flex items-center justify-between px-4 sm:px-8 pt-4 pb-0">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#C026FF]/40">✦ Discover</p>
          <h1 className="font-display text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-[#C026FF] to-[#00B7FF] bg-clip-text text-transparent">
            Recommendations
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => setAutoPlay(p => !p)}
            whileTap={{ scale: 0.95 }}
            className={`text-[10px] font-mono transition-colors ${autoPlay ? "text-[#00B7FF]/60" : "text-white/20"}`}
          >
            {autoPlay ? "▶ Auto" : "⏸ Auto"}
          </motion.button>
          <span className="font-mono text-[10px] text-white/20">{currentIdx + 1}/{currentList.length}</span>
          <Link href="/random" className="h-[30px] px-3 rounded-[8px] bg-white/[0.04] border border-white/[0.06] text-[11px] font-semibold text-white/50 hover:text-white hover:border-[#C026FF]/30 transition-all inline-flex items-center">
            ✦ Random
          </Link>
        </div>
      </div>

      {/* category tabs */}
      <div className="relative z-20 px-4 sm:px-8 pt-3 pb-1">
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => {
            if (cat.key === "personalized" && !session?.user) return null;
            const active = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => handleCategoryChange(cat.key)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[10px] font-semibold transition-all border ${
                  active
                    ? "border-white/[0.15] bg-white/[0.08] text-white"
                    : "border-white/[0.04] bg-white/[0.02] text-white/30 hover:text-white/50 hover:border-white/[0.08]"
                }`}
                style={active ? { boxShadow: `0 0 12px ${cat.color}20` } : undefined}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* genre sub-grid (only when genre category active) */}
      {activeCategory === "genre" && (
        <div className="relative z-20 px-4 sm:px-8 pt-2 pb-1">
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {ALL_GENRES.map(g => {
              const active = selectedGenre === g.name;
              return (
                <button
                  key={g.name}
                  onClick={() => handleGenreSelect(selectedGenre === g.name ? null : g.name)}
                  className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-[6px] text-[9px] font-semibold transition-all border ${
                    active
                      ? "border-white/[0.15] bg-white/[0.08]"
                      : "border-white/[0.04] bg-white/[0.02] text-white/25 hover:text-white/40"
                  }`}
                  style={active ? { color: g.color, boxShadow: `0 0 10px ${g.color}20` } : undefined}
                >
                  <span>{g.icon}</span>
                  <span>{g.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* main */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-stretch gap-0 px-4 sm:px-8 pt-4 pb-4 min-h-0">

        {/* glass feature card */}
        <div className="relative flex-1 flex items-center justify-center min-h-0 lg:pr-8">
          <div className="w-full max-w-[560px] lg:max-w-[600px] lg:w-full">
            {current && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={slideKey}
                  variants={slideVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="group relative rounded-[24px] bg-white/[0.04] backdrop-blur-2xl shadow-[0_0_24px_-6px_rgba(192,38,255,0.25),0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-500 hover:shadow-[0_0_32px_-4px_rgba(192,38,255,0.35),0_12px_48px_rgba(0,0,0,0.4)] border border-white/[0.08]"
                >
                  <div className="absolute inset-0 rounded-[24px] bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none z-[1]" />

                  <div className="relative w-full h-[240px] sm:h-[300px] overflow-hidden rounded-t-[22px] bg-[#0a0a14] z-[3]">
                    <Image src={current.image || "/placeholder.svg"} alt="" fill className="object-cover object-center transition-all duration-700 group-hover:scale-[1.03]" sizes="(max-width: 768px) 100vw, 600px" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05080f]/85 via-[#05080f]/15 to-transparent" />

                    {current.score > 0 && (
                      <div className="absolute top-4 right-4 rounded-[10px] bg-black/40 backdrop-blur-xl border border-white/[0.08] px-3 py-1">
                        <span className="font-mono text-sm font-bold text-[#00B7FF]">★ {(current.score / 10).toFixed(1)}</span>
                      </div>
                    )}

                    <div className="absolute bottom-3 left-5">
                      <span className="font-display text-[72px] sm:text-[96px] font-black text-white/[0.04] leading-none select-none">
                        {String(currentIdx + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10 px-6 pb-6 pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h2 className="font-display text-lg sm:text-xl font-bold text-white/90 leading-tight line-clamp-1">
                          {current.title}
                        </h2>
                        <p className="text-[11px] text-white/20 font-mono mt-0.5 capitalize">
                          {current.format ? current.format.replace("_", " ").toLowerCase() : ""}
                          {current.episodes ? ` · ${current.episodes} eps` : ""}
                        </p>
                      </div>
                      <div className="relative flex-shrink-0 w-[42px] h-[60px] rounded-[8px] overflow-hidden border border-white/[0.08] -mt-1 shadow-lg">
                        <Image src={coverSrc} alt="" fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                      </div>
                    </div>

                    {current.genres && current.genres.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {current.genres.slice(0, 5).map(g => (
                          <span key={g} className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-[1.5px] text-[9px] font-medium text-white/40">{g}</span>
                        ))}
                      </div>
                    )}

                    {current.reason && (
                      <p className="mt-2.5 text-sm text-white/25 leading-relaxed line-clamp-2">
                        {current.reason}
                      </p>
                    )}

                    <div className="mt-4 flex gap-3">
                      <motion.button
                        onClick={nextSlide}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex-1 h-[42px] rounded-[12px] bg-gradient-to-r from-[#C026FF] to-[#00B7FF] text-[13px] font-bold text-white shadow-[0_0_20px_-10px_rgba(192,38,255,0.2)] hover:shadow-[0_0_30px_-8px_rgba(192,38,255,0.3)] transition-all"
                      >
                        Try Another
                      </motion.button>
                      <Link
                        href={`/anime/${current.id}`}
                        onClick={handleTrackClick}
                        className="flex-[0.4] h-[42px] inline-flex items-center justify-center rounded-[12px] border border-white/[0.08] bg-white/[0.04] backdrop-blur text-[12px] font-semibold text-white/50 hover:border-white/[0.15] hover:text-white transition-all"
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* thumbnail rail */}
        <div className="relative flex-shrink-0 w-full lg:w-[190px] mt-3 lg:mt-0 lg:pl-1">
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[420px] pb-1 lg:pb-0 py-0.5"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {currentList.map((m, i) => (
              <motion.button
                key={m.id}
                custom={i}
                variants={thumbVariant}
                initial="hidden"
                animate="visible"
                onClick={() => goToSlide(i)}
                className={`flex-shrink-0 w-[140px] lg:w-full flex items-center gap-2.5 rounded-[10px] border p-2 text-left transition-all duration-300 backdrop-blur-sm ${
                  i === currentIdx
                    ? "border-[#C026FF]/50 bg-white/[0.06] shadow-[0_0_20px_-8px_rgba(192,38,255,0.15)]"
                    : "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.1]"
                }`}
              >
                <div className="relative w-[30px] h-[42px] rounded-[4px] overflow-hidden flex-shrink-0">
                  <Image src={m.image || "/placeholder.svg"} alt="" fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-[10px] font-semibold leading-tight truncate ${i === currentIdx ? "text-white/90" : "text-white/50"}`}>
                    {m.title}
                  </p>
                  <p className="text-[8px] text-white/15 mt-0.5 font-mono">
                    {m.score ? `★${(m.score / 10).toFixed(1)}` : ""}{m.episodes ? ` · ${m.episodes}eps` : ""}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2 mt-3 text-[9px] text-white/10 font-mono">
            <span>← →</span>
            <span className="w-3 h-[1px] bg-white/[0.06]" />
            <span>Space</span>
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-8 pb-4">
        <p className="text-[9px] text-white/10 font-mono">{currentList.length} picks</p>
        <div className="flex gap-1">
          {currentList.map((_, i) => (
            <button key={i} onClick={() => goToSlide(i)}
              className={`h-[4px] rounded-full transition-all duration-300 ${
                i === currentIdx ? "w-[14px] bg-[#C026FF]" : "w-[4px] bg-white/[0.12] hover:bg-white/[0.25]"
              }`}
            />
          ))}
        </div>
        <p className="text-[9px] text-white/10 font-mono">
          {autoPlay ? "auto 3.5s" : "paused"}
        </p>
      </div>
    </div></PageTransition>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface PersonalizedHeroProps {
  userId?: string;
}

interface WatchlistEntry {
  mediaId: number;
  status: string;
}

interface MediaItem {
  id: number;
  title: { romaji: string; english: string | null };
  coverImage: { extraLarge: string | null; large: string | null };
  bannerImage: string | null;
  description: string | null;
  averageScore: number | null;
  genres: string[];
  episodes: number | null;
  trending: number | null;
}

interface AniListPageResponse {
  data: {
    Page: {
      media: MediaItem[];
    };
  };
}

function bestTitle(t: MediaItem["title"]): string {
  return t.english || t.romaji || "Unknown";
}

function stripHtml(s: string | null): string {
  if (!s) return "";
  return s.replace(/<[^>]*>/g, "").slice(0, 160);
}

export default function PersonalizedHero({ userId }: PersonalizedHeroProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [genre, setGenre] = useState<string>("");
  const [loaded, setLoaded] = useState(false);

  const fetchPersonalized = useCallback(async () => {
    if (!userId) return;
    try {
      const watchRes = await fetch("/api/watchlist");
      const watchData = await watchRes.json();
      const entries: WatchlistEntry[] = watchData.items || [];

      const completedIds = entries
        .filter((e) => e.status === "COMPLETED" || e.status === "CURRENT")
        .map((e) => e.mediaId);

      if (completedIds.length === 0) return;

      const genreQuery = `query ($ids: [Int]) { Media(id_in: $ids, type: ANIME) { genres } }`;
      const genreRes = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: genreQuery, variables: { ids: completedIds.slice(0, 12) } }),
      });
      const genreData = await genreRes.json();
      const mediaList: MediaItem[] = Array.isArray(genreData.data?.Media)
        ? genreData.data.Media
        : genreData.data?.Media
        ? [genreData.data.Media]
        : [];

      const genreCount: Record<string, number> = {};
      for (const m of mediaList) {
        for (const g of m.genres || []) {
          genreCount[g] = (genreCount[g] || 0) + 1;
        }
      }
      const topGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (!topGenre) return;

      const trendingQuery = `query ($genre: String) { Page(page: 1, perPage: 10) { media(sort: TRENDING_DESC, type: ANIME, genre: $genre, isAdult: false) { id title { romaji english } coverImage { extraLarge large } bannerImage description averageScore genres episodes trending } } }`;
      const trendRes = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trendingQuery, variables: { genre: topGenre } }),
      });
      const trendData: AniListPageResponse = await trendRes.json();
      const trending = trendData.data?.Page?.media || [];

      if (trending.length === 0) return;

      setItems(trending);
      setGenre(topGenre);
      setLoaded(true);
    } catch {
      setLoaded(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPersonalized();
  }, [fetchPersonalized]);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!loaded || items.length === 0) return null;

  const active = items[activeIdx];
  const title = bestTitle(active.title);

  return (
    <div className="relative h-[60vh] min-h-[400px] max-h-[700px] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          {active.bannerImage ? (
            <Image
              src={active.bannerImage}
              alt={title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-magenta)]/20 to-[var(--color-cyan)]/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-void)] via-[var(--color-void)]/60 to-[var(--color-void)]/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-void)]/80 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-12 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">
              Because you watched {genre}
            </p>
            <h1 className="font-display text-3xl font-bold sm:text-5xl lg:text-6xl drop-shadow-lg max-w-2xl">
              {title}
            </h1>
            {active.averageScore && (
              <p className="mt-2 text-sm text-[var(--color-mute)]">
                Score: <span className="text-[var(--color-magenta)] font-bold">{(active.averageScore / 10).toFixed(1)}</span>
                {active.episodes && <span className="ml-2">· {active.episodes} episodes</span>}
              </p>
            )}
            {active.description && (
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-mute)] line-clamp-3">
                {stripHtml(active.description)}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/anime/${active.id}`}
                className="rounded-full bg-[var(--color-magenta)] px-6 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity"
              >
                View Details
              </Link>
              {active.genres?.slice(0, 3).map((g) => (
                <Link
                  key={g}
                  href={`/search?genre=${g}`}
                  className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs text-white/70 hover:bg-[var(--color-magenta)] hover:text-black hover:border-[var(--color-magenta)] transition-all backdrop-blur"
                >
                  {g}
                </Link>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {items.length > 1 && (
          <div className="mt-6 flex items-center gap-2">
            {items.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setActiveIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIdx
                    ? "w-8 bg-[var(--color-magenta)]"
                    : "w-2 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to ${bestTitle(item.title)}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

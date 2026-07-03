"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { getRecommendationsByGenres } from "@/lib/anilist";
import { useWatchlist } from "./WatchlistProvider";
import AnimeCard from "@/components/AnimeCard";
import { CardSkeleton } from "@/components/Loader";
import type { Media } from "@/lib/anilist";

export default function Recommendations({ title = "Recommended for You", limit = 12 }: { title?: string; limit?: number }) {
  const { items, entries } = useWatchlist();
  const [recs, setRecs] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  const sourceShow = useMemo(() => {
    if (items.length === 0) return null;
    const titles = items.filter((i) => i.title?.english || i.title?.romaji || i.title?.native);
    if (titles.length === 0) return null;
    return titles[Math.floor(Math.random() * titles.length)];
  }, [items]);

  const savedIds = useMemo(() => {
    const ids = new Set(items.map((i) => i.id));
    entries.forEach((e) => ids.add(e.mediaId));
    return ids;
  }, [items, entries]);

  const genres = useMemo(() => {
    const g = new Set<string>();
    items.forEach((i) => i.genres?.forEach((gen) => g.add(gen)));
    return [...g].slice(0, 3);
  }, [items]);

  useEffect(() => {
    if (genres.length === 0) return;
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    let cancelled = false;
    getRecommendationsByGenres(genres, 30)
      .then((data) => {
        if (!cancelled) {
          const filtered = data.filter((m) => !savedIds.has(m.id)).slice(0, limit);
          setRecs(filtered);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) { setLoading(false); loadingRef.current = false; } });
    return () => { cancelled = true; };
  }, [genres.join(","), savedIds.size, limit]);

  if (genres.length === 0 || (recs.length === 0 && !loading)) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-violet)]">
            {sourceShow ? `Because You Watched ${sourceShow.title?.english || sourceShow.title?.romaji || sourceShow.title?.native}` : "Based on Your List"}
          </p>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{title}</h2>
        </div>
        <Link href="/search" className="shrink-0 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)]">
          Discover more →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {recs.map((m) => <AnimeCard key={m.id} anime={m} />)}
        {loading && Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={`r${i}`} />)}
      </div>
    </section>
  );
}

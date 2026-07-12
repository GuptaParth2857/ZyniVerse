"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import CosplayCard from "@/components/CosplayCard";

interface CosplayItem {
  id: string;
  title: string;
  character: string;
  animeTitle: string;
  imageUrl: string;
  likes: number;
  createdAt: string;
  tags: string;
  user: { id: string; username: string; avatar: string | null };
}

export default function CosplayGallery() {
  const { data: session } = useSession();
  const [cosplays, setCosplays] = useState<CosplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("recent");
  const [animeFilter, setAnimeFilter] = useState("");
  const [charFilter, setCharFilter] = useState("");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const fetchCosplays = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort });
      if (animeFilter.trim()) params.set("anime", animeFilter.trim());
      if (charFilter.trim()) params.set("character", charFilter.trim());
      const res = await fetch(`/api/cosplay?${params}`);
      const data = await res.json();
      setCosplays(data.cosplays || []);
    } catch {
      setCosplays([]);
    } finally {
      setLoading(false);
    }
  }, [sort, animeFilter, charFilter]);

  useEffect(() => {
    fetchCosplays();
  }, [fetchCosplays]);

  async function handleLike(cosplayId: string) {
    if (!session?.user?.id) return;
    const res = await fetch(`/api/cosplay/${cosplayId}/like`, { method: "POST" });
    const data = await res.json();
    setCosplays((prev) =>
      prev.map((c) => (c.id === cosplayId ? { ...c, likes: data.likes } : c))
    );
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (data.liked) next.add(cosplayId);
      else next.delete(cosplayId);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 animate-page-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold">Cosplay Gallery</h1>
        <p className="mt-2 text-[var(--color-mute)] text-sm">Browse and share anime cosplays</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8">
        <input
          value={animeFilter}
          onChange={(e) => setAnimeFilter(e.target.value)}
          placeholder="Filter by anime..."
          className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] w-full sm:w-44"
        />
        <input
          value={charFilter}
          onChange={(e) => setCharFilter(e.target.value)}
          placeholder="Filter by character..."
          className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] w-full sm:w-44"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
        >
          <option value="recent">Most Recent</option>
          <option value="popular">Most Popular</option>
        </select>
        {session?.user?.id && (
          <Link href="/cosplay/upload"
            className="sm:ml-auto rounded-lg bg-[var(--color-magenta)]/20 border border-[var(--color-magenta)]/30 px-4 py-2 text-sm font-semibold text-[var(--color-magenta)] hover:bg-[var(--color-magenta)]/30 transition-colors"
          >Upload Cosplay</Link>
        )}
      </div>

      {/* Gallery */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden">
              <div className="aspect-[3/4] bg-[var(--color-void)] animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-24 bg-[var(--color-void)] rounded animate-pulse" />
                <div className="h-3 w-32 bg-[var(--color-void)] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : cosplays.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[var(--color-mute)] text-sm">No cosplays yet. Be the first to share!</p>
          {session?.user?.id && (
            <Link href="/cosplay/upload"
              className="mt-4 inline-block rounded-lg bg-[var(--color-magenta)]/20 border border-[var(--color-magenta)]/30 px-4 py-2 text-sm font-semibold text-[var(--color-magenta)] hover:bg-[var(--color-magenta)]/30"
            >Upload Cosplay</Link>
          )}
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-0">
          {cosplays.map((c) => (
            <CosplayCard
              key={c.id}
              cosplay={c}
              onLike={() => handleLike(c.id)}
              liked={likedIds.has(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

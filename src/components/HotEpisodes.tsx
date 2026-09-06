"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type HotItem = { mediaId: number; episode: number; reactionCount: number };
type TitleInfo = { title: string; coverImage: string };

export default function HotEpisodes({ limit = 5 }: { limit?: number }) {
  const [hot, setHot] = useState<HotItem[]>([]);
  const [titles, setTitles] = useState<Record<number, TitleInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`/api/episodes/hot?days=7&limit=${limit}`)
      .then((r) => r.json())
      .then((d) => {
        if (active) {
          setHot(d.hot || []);
          setTitles(d.titles || {});
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [limit]);

  if (loading) return null;
  if (hot.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
      <h3 className="font-display text-base font-bold mb-1 flex items-center gap-2">
        <span className="text-lg">🔥</span> Hot Episodes This Week
      </h3>
      <p className="mb-4 text-xs text-[var(--color-mute)]">The most-reacted episodes across the community in the last 7 days.</p>
      <ol className="space-y-2">
        {hot.map((h, i) => {
          const info = titles[h.mediaId];
          const title = info?.title || `Anime #${h.mediaId}`;
          return (
            <li key={`${h.mediaId}-${h.episode}`}>
              <Link
                href={`/anime/${h.mediaId}`}
                className="flex items-center gap-3 rounded-lg border border-[var(--color-line)]/50 bg-[var(--color-void)] px-3 py-2 hover:border-[var(--color-cyan)] transition-all"
              >
                <span className="font-mono text-xs text-[var(--color-cyan)] shrink-0">#{i + 1}</span>
                {info?.coverImage && (
                  <span className="relative h-8 w-6 shrink-0 overflow-hidden rounded ring-1 ring-white/10">
                    <Image src={info.coverImage} alt="" fill className="object-cover" sizes="24px" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-[var(--color-text)]">{title}</span>
                  <span className="block text-[10px] text-[var(--color-mute)]">Ep {h.episode}</span>
                </span>
                <span className="shrink-0 text-xs font-mono text-[var(--color-magenta)]">{h.reactionCount}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
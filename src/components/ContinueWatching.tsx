"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getMediaBatch, bestTitle } from "@/lib/anilist";
import type { MediaBasic } from "@/lib/anilist";

interface InProgressItem {
  mediaId: number;
  type: string;
  status: string;
  progress: number;
  total: number;
}

interface ItemWithMeta extends InProgressItem {
  meta: MediaBasic | null;
}

export default function ContinueWatching() {
  const { data: session } = useSession();
  const [items, setItems] = useState<ItemWithMeta[]>([]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then(async (d) => {
        if (d.stats) {
          const entries: InProgressItem[] = (d.user?.entries || []).filter(
            (e: InProgressItem) => e.status === "CURRENT" && e.progress > 0
          ).slice(0, 6);
          const ids = entries.map((e) => e.mediaId);
          if (ids.length === 0) return;
          const mediaList = await getMediaBatch(ids);
          const map = new Map(mediaList.map((m) => [m.id, m]));
          setItems(entries.map((e) => ({ ...e, meta: map.get(e.mediaId) || null })));
        }
      })
      .catch(() => {});
  }, [session]);

  if (!session || items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">Resume</p>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Continue Watching</h2>
        </div>
        <Link href="/watchlist" className="shrink-0 text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)]">View all →</Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {items.map((item) => (
          <Link key={item.mediaId} href={`/${item.type.toLowerCase()}/${item.mediaId}`}
            className="shrink-0 w-40 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-3 hover:border-[var(--color-cyan)]/40 transition-all"
          >
            <div className="aspect-[3/4] rounded-lg bg-[var(--color-void)] overflow-hidden mb-2">
              {item.meta?.coverImage?.large ? (
                <img
                  src={item.meta.coverImage.large}
                  alt={bestTitle(item.meta.title)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-2xl font-mono text-[var(--color-mute)]">#{item.mediaId}</span>
                </div>
              )}
            </div>
            <p className="truncate text-xs font-semibold mb-1">
              {item.meta ? bestTitle(item.meta.title) : `#${item.mediaId}`}
            </p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--color-mute)]">Ep {item.progress}/{item.total || "?"}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)]" />
            </div>
            <div className="mt-1 h-1 rounded-full bg-[var(--color-line)] overflow-hidden">
              <div className="h-full rounded-full bg-[var(--color-cyan)]" style={{ width: `${item.total ? (item.progress / item.total) * 100 : 0}%` }} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

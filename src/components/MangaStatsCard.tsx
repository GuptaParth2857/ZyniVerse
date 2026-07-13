"use client";

import { useEffect, useState } from "react";

interface MangaStats {
  mangadex: {
    average: number;
    bayesian: number;
    follows: number;
  } | null;
  mal: {
    magazine: string;
    publisher: string;
    serialization: string;
  } | null;
}

interface Props {
  mediaId: number;
}

export default function MangaStatsCard({ mediaId }: Props) {
  const [data, setData] = useState<MangaStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/manga/${mediaId}/chapter-ratings`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [mediaId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-[var(--color-line)] rounded w-1/2" />
          <div className="space-y-2">
            <div className="h-3 bg-[var(--color-line)] rounded w-3/4" />
            <div className="h-3 bg-[var(--color-line)] rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const hasMangadex = data.mangadex && data.mangadex.average > 0;
  const hasPublisher = data.mal && (data.mal.magazine || data.mal.publisher);

  if (!hasMangadex && !hasPublisher) return null;

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
      <h3 className="font-display text-sm font-bold mb-3 flex items-center gap-2">
        <span className="h-3 w-1 rounded-full bg-[var(--color-cyan)]" />
        Manga Details
      </h3>

      {/* MangaDex Rating */}
      {hasMangadex && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[var(--color-mute)] uppercase tracking-wider">MangaDex Rating</span>
            <span className="font-mono text-sm font-bold text-[var(--color-cyan)]">
              {data.mangadex!.average.toFixed(2)} <span className="text-[10px] text-[var(--color-mute)]">/ 5</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[var(--color-mute)]">
            <span>Bayesian: {data.mangadex!.bayesian.toFixed(2)}</span>
            <span>·</span>
            <span>{data.mangadex!.follows.toLocaleString()} follows</span>
          </div>
        </div>
      )}

      {/* Publisher/Magazine Info */}
      {hasPublisher && (
        <div className="space-y-1.5 border-t border-[var(--color-line)] pt-3">
          {data.mal!.magazine && (
            <div className="flex justify-between text-xs">
              <span className="text-[var(--color-mute)]">Magazine</span>
              <span className="text-right">{data.mal!.magazine}</span>
            </div>
          )}
          {data.mal!.publisher && (
            <div className="flex justify-between text-xs">
              <span className="text-[var(--color-mute)]">Publisher</span>
              <span className="text-right">{data.mal!.publisher}</span>
            </div>
          )}
        </div>
      )}

      <p className="mt-3 text-[9px] text-[var(--color-mute)] text-center">
        Data from <a href="https://mangadex.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-cyan)]">MangaDex</a>
        {hasPublisher && <> & <a href="https://myanimelist.net" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--color-cyan)]">MAL</a></>}
      </p>
    </div>
  );
}

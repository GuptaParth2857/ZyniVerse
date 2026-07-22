"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useCallback } from "react";
import { bestTitle } from "@/lib/anilist";
import { useWatchlist } from "./WatchlistProvider";
import CountdownChip from "./CountdownChip";
import type { Media } from "@/lib/anilist";

const STATUS_LABEL: Record<string, string> = {
  RELEASING: "On Air",
  FINISHED: "Finished",
  NOT_YET_RELEASED: "Upcoming",
  CANCELLED: "Cancelled",
  HIATUS: "Hiatus",
};

export default function AnimeCard({ anime }: { anime: Media }) {
  const { isSaved, toggle } = useWatchlist();
  const saved = isSaved(anime.id);
  const title = bestTitle(anime.title);
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = (e.clientX - cx) / (rect.width / 2);
    const py = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `perspective(800px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) scale(1.02)`;
  }, []);

  const handlePointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)";
  }, []);

  const href = anime.type === "MANGA" ? `/manga/${anime.id}` : `/anime/${anime.id}`;

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="group"
      style={{ transition: "transform 0.2s ease-out" }}
    >
      <Link href={href} className="glass-card block">
        <div className="glass-content">
          <div className="relative aspect-[2/3] overflow-hidden rounded-t-xl">
            <Image
              src={anime.coverImage?.extraLarge || anime.coverImage?.large || ""}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {anime.status === "RELEASING" && (
              <span className="absolute left-2 top-2 flex items-center gap-1.5 glass-badge text-[var(--color-glass-purple)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-glass-purple)] glass-pulse-dot" />
                On Air
              </span>
            )}
            {anime.status && anime.status !== "RELEASING" && (
              <span className="absolute left-2 top-2 glass-badge text-[var(--color-mute)]">
                {STATUS_LABEL[anime.status] || anime.status}
              </span>
            )}

            {anime.averageScore ? (
              <span className="absolute right-2 top-2 glass-score rounded-full px-2 py-1 text-[10px] font-mono font-semibold">
                ★ {(anime.averageScore / 10).toFixed(1)}
              </span>
            ) : null}

            <div className="absolute inset-x-0 bottom-0 p-3">
              <h3 className="font-display text-sm font-semibold leading-tight text-white line-clamp-2 drop-shadow-lg">
                {title}
              </h3>
              {anime.nextAiringEpisode && (
                <div className="mt-1"><CountdownChip target={anime.nextAiringEpisode} compact /></div>
              )}
            </div>

            {/* Hover shimmer overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
            </div>
          </div>

          {/* Glass bottom bar with genres */}
          <div className="px-3 py-2.5 border-t border-white/5">
            <div className="flex flex-wrap items-center gap-1.5">
              {anime.genres?.slice(0, 3).map((g) => (
                <span key={g} className="text-[10px] font-medium text-[var(--color-mute)] uppercase tracking-wider">
                  {g}
                </span>
              ))}
              {anime.format && (
                <span className="ml-auto text-[10px] font-mono text-white/30">{anime.format}</span>
              )}
            </div>
          </div>
        </div>
      </Link>

      <button
        onClick={() => toggle(anime)}
        aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
        aria-pressed={saved}
        className={`absolute right-2 top-2 z-20 flex h-9 w-9 sm:h-7 sm:w-7 items-center justify-center rounded-full ${
          saved ? "glass-bookmark active" : "glass-bookmark text-white/70"
        }`}
      >
        <svg width="14" height="14" className="sm:w-3 sm:h-3" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  );
}

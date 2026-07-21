"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useCallback, useState } from "react";
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

const CARD_COLORS = ["#29f2e0", "#ff2d78", "#8a5cff", "#22c55e", "#f59e0b", "#06b6d4", "#ec4899", "#f97316"];

export default function AnimeCard({ anime, index = 0 }: { anime: Media; index?: number }) {
  const { isSaved, toggle } = useWatchlist();
  const saved = isSaved(anime.id);
  const title = bestTitle(anime.title);
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const color = CARD_COLORS[index % CARD_COLORS.length];

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = (e.clientX - cx) / (rect.width / 2);
    const py = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `perspective(800px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) scale(1.02)`;
  }, []);

  const handlePointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)";
  }, []);

  const href = anime.type === "MANGA" ? `/manga/${anime.id}` : `/anime/${anime.id}`;

  return (
    <div ref={ref} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}
      className="group overflow-hidden rounded-xl neon-feature-card"
      style={{ transition: "transform 0.2s ease-out" }}>
      <div className="neon-border rounded-xl" style={{ background: `conic-gradient(from var(--border-angle), ${color}, transparent 40%, ${color}80, transparent 70%, ${color})` }} />
      <div className="neon-glow rounded-xl" style={{ background: color }} />
      <div className="neon-inner rounded-xl p-0 overflow-hidden" style={{ background: "var(--color-panel)" }}>
        <div className="h-[2px] w-full" style={{ background: color }} />

        <Link href={href} className="block">
          <div className="relative aspect-[2/3] overflow-hidden">
            <Image
              src={anime.coverImage?.extraLarge || anime.coverImage?.large || ""}
              alt={title}
              fill
              onLoadingComplete={() => setLoaded(true)}
              className={`object-cover transition-all duration-700 ease-out group-hover:scale-110 ${loaded ? "opacity-100" : "opacity-0"}`}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className={`absolute inset-0 bg-[var(--color-panel)] transition-opacity duration-500 ${loaded ? "opacity-0" : "opacity-100"}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Status badge */}
            {anime.status && (
              <div className="absolute left-2 top-2 z-10">
                <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-md"
                  style={{
                    color: anime.status === "RELEASING" ? "#22c55e" : color,
                    background: anime.status === "RELEASING" ? "rgba(34,197,94,0.2)" : `${color}20`,
                    border: `1px solid ${anime.status === "RELEASING" ? "rgba(34,197,94,0.3)" : `${color}30`}`,
                  }}>
                  {anime.status === "RELEASING" && <span className="w-1 h-1 rounded-full bg-[#22c55e] animate-pulse" />}
                  {STATUS_LABEL[anime.status] || anime.status}
                </span>
              </div>
            )}

            {/* Score */}
            {anime.averageScore != null && (
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md backdrop-blur-md text-[10px] font-mono font-bold z-10"
                style={{ background: `${color}25`, color, border: `1px solid ${color}40` }}>
                ★ {(anime.averageScore / 10).toFixed(1)}
              </div>
            )}

            {/* Bottom info */}
            <div className="absolute inset-x-0 bottom-0 p-3 z-10">
              <h3 className="font-display text-sm font-semibold leading-tight text-white line-clamp-2 drop-shadow-lg">{title}</h3>
              {anime.nextAiringEpisode && (
                <div className="mt-1"><CountdownChip target={anime.nextAiringEpisode} compact /></div>
              )}
            </div>
          </div>
        </Link>

        {/* Bottom bar */}
        <div className="px-3 py-2.5 border-t border-[var(--color-line)]/30">
          <div className="flex flex-wrap items-center gap-1.5">
            {anime.genres?.slice(0, 3).map((g) => (
              <span key={g} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[var(--color-line)]/20 text-[var(--color-mute)]">{g}</span>
            ))}
            {anime.format && (
              <span className="ml-auto text-[9px] font-mono" style={{ color }}>{anime.format.replace(/_/g, " ")}</span>
            )}
          </div>
        </div>
      </div>

      {/* Watchlist button */}
      <button
        onClick={() => toggle(anime)}
        aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
        aria-pressed={saved}
        className="absolute right-2 top-4 z-20 flex h-7 w-7 items-center justify-center rounded-full transition-all"
        style={{
          background: saved ? `${color}30` : "rgba(0,0,0,0.5)",
          color: saved ? color : "rgba(255,255,255,0.7)",
          border: `1px solid ${saved ? `${color}40` : "rgba(255,255,255,0.1)"}`,
        }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  );
}

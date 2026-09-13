"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { bestTitle } from "@/lib/anilist";
import { getDubLanguages } from "@/lib/dub-languages";
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

const STATUS_PILL: Record<string, string> = {
  RELEASING: "bg-green-500/20 text-green-400 border-green-500/30",
  FINISHED: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  NOT_YET_RELEASED: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  HIATUS: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

const STATUS_ACCENT: Record<string, string> = {
  RELEASING: "#4ade80",
  FINISHED: "#22d3ee",
  NOT_YET_RELEASED: "#a78bfa",
  HIATUS: "#facc15",
  CANCELLED: "#f87171",
};

export default function AZAnimeCard({ anime, index = 0 }: { anime: Media; index?: number }) {
  const { isSaved, toggle } = useWatchlist();
  const saved = isSaved(anime.id);
  const title = bestTitle(anime.title);
  const accent = STATUS_ACCENT[anime.status || ""] || "#00ffe0";
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = (e.clientX - cx) / (rect.width / 2);
    const py = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `perspective(900px) rotateY(${px * 4}deg) rotateX(${-py * 4}deg) scale(1.015)`;
  }, []);

  const handlePointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)";
  }, []);

  const dubLangs = anime.idMal ? getDubLanguages(anime.idMal) : null;
  const href = anime.type === "MANGA" ? `/manga/${anime.id}` : `/anime/${anime.id}`;
  const hasDubs = !!(dubLangs && (dubLangs.hasHindi || dubLangs.hasTamil || dubLangs.hasTelugu));

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 26, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: Math.min((index % 12) * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="group relative rounded-3xl"
      style={{ transition: "transform 0.2s ease-out" }}
    >
      {/* spinning neon border */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)",
            animation: "spin 6s linear infinite",
            willChange: "transform",
          }}
        />
        <span className="absolute inset-[1.5px] rounded-[22.5px] neon-border-inner" />
      </div>

      {/* card content */}
      <div className="relative z-10 overflow-hidden rounded-[22.5px]">
        {/* hairline shimmer on top edge */}
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px z-40 meme-hairline" />

        {/* HEADER — poster with accent aurora backdrop */}
        <Link href={href} className="relative block overflow-hidden no-underline" style={{ background: "#0a0910" }}>
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(120% 120% at 75% -10%, ${accent}1f, transparent 55%), radial-gradient(120% 120% at 10% 110%, ${accent}0f, transparent 55%)`,
            }}
          />
          <div className="award-sheen" />

          {/* Top badges */}
          <div className="relative z-10 p-2.5 sm:p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="h-1.5 w-8 rounded-full" style={{ background: accent, boxShadow: `0 0 10px ${accent}88` }} />
              {anime.status && (
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_PILL[anime.status] || "bg-white/10 text-[var(--color-mute)]"}`}>
                  {STATUS_LABEL[anime.status] || anime.status}
                </span>
              )}
              {anime.averageScore ? (
                <span
                  className="ml-auto rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-semibold"
                  style={{ borderColor: `${accent}55`, color: accent, background: `${accent}14`, boxShadow: `0 0 12px ${accent}22` }}
                >
                  ★ {(anime.averageScore / 10).toFixed(1)}
                </span>
              ) : null}
            </div>
            {hasDubs && (
              <div className="mt-1.5 flex items-center gap-1">
                {dubLangs!.hasHindi && (
                  <span className="rounded border border-orange-400/30 bg-orange-500/20 px-1.5 py-0.5 text-[8px] font-bold uppercase text-orange-400 backdrop-blur-sm">HI</span>
                )}
                {dubLangs!.hasTamil && (
                  <span className="rounded border border-blue-400/30 bg-blue-500/20 px-1.5 py-0.5 text-[8px] font-bold uppercase text-blue-400 backdrop-blur-sm">TA</span>
                )}
                {dubLangs!.hasTelugu && (
                  <span className="rounded border border-green-400/30 bg-green-500/20 px-1.5 py-0.5 text-[8px] font-bold uppercase text-green-400 backdrop-blur-sm">TE</span>
                )}
              </div>
            )}
          </div>

          {/* Poster */}
          <div className="relative aspect-[2/3] overflow-hidden">
            <Image
              src={anime.coverImage?.large || anime.coverImage?.extraLarge || anime.coverImage?.medium || ""}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
              <h3 className="font-display text-sm font-semibold leading-tight text-white line-clamp-2 drop-shadow-lg">
                {title}
              </h3>
              {anime.nextAiringEpisode && (
                <div className="mt-1"><CountdownChip target={anime.nextAiringEpisode} compact /></div>
              )}
            </div>
          </div>

          {/* Hover shimmer overlay */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
          </div>
        </Link>

        {/* BODY */}
        <div className="relative z-10 px-3 pt-2.5 pb-2.5 sm:px-4">
          <p className="mb-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.35em] text-[var(--color-cyan)]/80">
            ✦ {anime.type || "Anime"}
          </p>
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            {anime.genres?.slice(0, 3).map((g) => (
              <span key={g} className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-mute)]">
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* ACTION BAR */}
        <div className="relative z-10 flex items-center justify-between gap-2 border-t border-[var(--color-line)] px-3 py-2 sm:px-4 sm:py-2.5">
          <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-void)]/80 px-2 py-0.5 font-mono text-[9px] uppercase text-[var(--color-mute)]">
            {anime.format || anime.type || "Media"}
          </span>
          <button
            onClick={() => toggle(anime)}
            aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
            aria-pressed={saved}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
              saved
                ? "bg-[var(--color-magenta)]/15 text-[var(--color-magenta)] shadow-[0_0_18px_rgba(255,0,230,0.25)]"
                : "bg-white/5 text-[var(--color-mute)] hover:bg-white/10 hover:text-[var(--color-magenta)]"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function AZCardSkeleton() {
  return (
    <div className="relative rounded-3xl">
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: "conic-gradient(from 0deg, transparent, #00ffe0, transparent, #ff00e6, transparent, #7000ff, transparent, #00ffe0)",
            animation: "spin 6s linear infinite",
            willChange: "transform",
          }}
        />
        <span className="absolute inset-[1.5px] rounded-[22.5px] neon-border-inner" />
      </div>
      <div className="relative z-10 overflow-hidden rounded-[22.5px] p-4">
        <div className="mb-4 flex items-center gap-2">
          <div className="shimmer h-1.5 w-8 rounded-full" />
          <div className="shimmer h-4 w-16 rounded-full" />
        </div>
        <div className="shimmer aspect-[2/3] w-full rounded-xl" />
        <div className="mt-4 space-y-2.5">
          <div className="shimmer h-4 w-full rounded" />
          <div className="shimmer h-4 w-3/5 rounded" />
        </div>
        <div className="mt-4 flex gap-2 border-t border-[var(--color-line)] pt-3">
          <div className="shimmer h-8 w-20 rounded-md" />
          <div className="shimmer h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}
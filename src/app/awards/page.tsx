"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { AWARD_YEARS, getAwardsByYear } from "@/lib/awards-data";
import { getMediaBatch } from "@/lib/anilist";
import type { MediaBasic } from "@/lib/anilist";

const CATEGORY_COLORS: Record<string, string> = {
  "Anime of the Year": "var(--color-magenta)",
  "Best Animation": "var(--color-cyan)",
  "Best Action": "var(--color-magenta)",
  "Best Romance": "var(--color-violet)",
  "Best Comedy": "var(--color-amber)",
  "Best Fantasy": "var(--color-cyan)",
  "Best Drama": "var(--color-violet)",
  "Best Score": "var(--color-magenta)",
  "Best New Series": "var(--color-cyan)",
};

const CATEGORY_ICONS: Record<string, string> = {
  "Anime of the Year": "🏆",
  "Best Animation": "✨",
  "Best Action": "⚡",
  "Best Romance": "💕",
  "Best Comedy": "😂",
  "Best Fantasy": "🧙",
  "Best Drama": "🎭",
  "Best Score": "🎵",
  "Best New Series": "🆕",
};

export default function AwardsPage() {
  const [selectedYear, setSelectedYear] = useState<number>(AWARD_YEARS[0]);
  const [covers, setCovers] = useState<Map<number, MediaBasic>>(new Map());
  const [hovered, setHovered] = useState<string | null>(null);

  const awards = getAwardsByYear(selectedYear);

  useEffect(() => {
    const ids = [...new Set(awards.map((a) => a.malId))];
    getMediaBatch(ids).then((d) => {
      const m = new Map<number, MediaBasic>();
      d.forEach((item) => m.set(item.id, item));
      setCovers(m);
    }).catch(() => {});
  }, [selectedYear]);

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">
            Crunchyroll Anime Awards
          </p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl mt-1">
            Award Winners
          </h1>
          <p className="mt-2 text-sm text-[var(--color-mute)]">
            Celebrating the best anime voted by fans worldwide.
          </p>
        </div>

        {/* Year selector */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {AWARD_YEARS.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`shrink-0 rounded-full px-5 py-2 text-sm font-bold transition-all ${
                selectedYear === year
                  ? "bg-[var(--color-magenta)] text-black shadow-[0_0_20px_-5px_var(--color-magenta)]"
                  : "border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-magenta)]/50"
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Awards strip */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedYear}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex h-[420px] gap-2 w-full overflow-x-auto pb-2"
          >
            {awards.map((award, i) => {
              const color = CATEGORY_COLORS[award.category] || "var(--color-violet)";
              const icon = CATEGORY_ICONS[award.category] || "🏅";
              const cover = covers.get(award.malId);
              const key = `${award.year}-${award.category}`;
              const isHovered = hovered === key;
              return (
                <motion.div
                  key={key}
                  layout
                  animate={{ flex: isHovered ? 3 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  onMouseEnter={() => setHovered(key)}
                  onMouseLeave={() => setHovered(null)}
                  className="relative overflow-hidden rounded-2xl border border-[var(--color-line)] cursor-pointer group"
                  style={{ minWidth: 0 }}
                >
                  <Link
                    href={`/anime/${award.malId}`}
                    className="block h-full w-full"
                  >
                    {/* Cover image */}
                    {cover?.coverImage ? (
                      <img
                        src={cover.coverImage.extraLarge || cover.coverImage.large}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface)] text-5xl">
                        {icon}
                      </div>
                    )}

                    {/* Gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    {!isHovered && (
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
                    )}

                    {/* Collapsed state */}
                    {!isHovered && (
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <span
                          className="inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider mb-2"
                          style={{
                            background: `${color}30`,
                            color: color,
                            border: `1px solid ${color}50`,
                          }}
                        >
                          {icon} {award.category}
                        </span>
                        <p className="font-display text-xs font-bold leading-tight [writing-mode:vertical-lr] rotate-180 truncate text-white">
                          {award.winner}
                        </p>
                      </div>
                    )}

                    {/* Expanded state */}
                    {isHovered && (
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <span
                          className="inline-block rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider mb-2"
                          style={{
                            background: `${color}30`,
                            color: color,
                            border: `1px solid ${color}50`,
                          }}
                        >
                          {icon} {award.category}
                        </span>
                        <p className="font-display text-lg font-bold leading-tight text-white drop-shadow-lg">
                          {award.winner}
                        </p>
                        {cover && (
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/60">
                            {cover.averageScore ? (
                              <span className="text-[var(--color-cyan)]">★ {(cover.averageScore / 10).toFixed(1)}</span>
                            ) : null}
                            {cover.format ? <span className="text-[10px] uppercase">{cover.format}</span> : null}
                            {cover.genres?.slice(0, 2).join(" · ")}
                          </div>
                        )}
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 }}
                          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-magenta)]"
                        >
                          View Details →
                        </motion.span>
                      </div>
                    )}

                    {/* Number badge */}
                    <div className="absolute left-3 top-3">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold font-mono"
                        style={{
                          background: `${color}30`,
                          color: color,
                          border: `1px solid ${color}50`,
                        }}
                      >
                        {i + 1}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {awards.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-[var(--color-mute)]">No award data for this year.</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

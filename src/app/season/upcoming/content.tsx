"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { bestTitle, type Media } from "@/lib/anilist";

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const CARD_COLORS = ["#29f2e0", "#ff2d78", "#8a5cff", "#22c55e", "#f59e0b", "#06b6d4", "#ec4899", "#f97316"];

function AnimeCard({ item, index }: { item: Media; index: number }) {
  const [loaded, setLoaded] = useState(false);
  const color = CARD_COLORS[index % CARD_COLORS.length];
  const score = item.averageScore;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, type: "spring", stiffness: 260, damping: 24 }}
      className="overflow-hidden rounded-xl neon-feature-card group"
    >
      <div className="neon-border rounded-xl" style={{ background: `conic-gradient(from var(--border-angle), ${color}, transparent 40%, ${color}80, transparent 70%, ${color})` }} />
      <div className="neon-glow rounded-xl" style={{ background: color }} />
      <div className="neon-inner rounded-xl p-0 overflow-hidden" style={{ background: "var(--color-panel)" }}>
        <div className="h-[2px] w-full" style={{ background: color }} />

        {/* Cover */}
        <Link href={`/anime/${item.id}`} className="relative block aspect-[3/4] overflow-hidden">
          {item.coverImage?.extraLarge || item.coverImage?.large ? (
            <Image
              src={item.coverImage.extraLarge || item.coverImage.large || ""}
              alt={bestTitle(item.title)}
              fill
              onLoadingComplete={() => setLoaded(true)}
              className={`object-cover transition-all duration-500 group-hover:scale-110 ${loaded ? "opacity-100" : "opacity-0"}`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--color-line)]/20 text-[var(--color-mute)] text-xs">No Image</div>
          )}
          {/* Score badge */}
          {score != null && (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md backdrop-blur-md text-[10px] font-mono font-bold z-10"
              style={{ background: `${color}25`, color, border: `1px solid ${color}40` }}>
              ★ {score.toFixed(0)}
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className={`absolute inset-0 bg-[var(--color-panel)] transition-opacity duration-500 ${loaded ? "opacity-0" : "opacity-100"}`} />
        </Link>

        {/* Info */}
        <div className="p-3">
          <Link href={`/anime/${item.id}`}>
            <h3 className="text-sm font-bold leading-tight line-clamp-2 min-h-[2.5rem] group-hover:opacity-80 transition-opacity">
              {bestTitle(item.title)}
            </h3>
          </Link>
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {item.format && (
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded"
                style={{ color, background: `${color}12`, border: `1px solid ${color}20` }}>
                {item.format.replace(/_/g, " ")}
              </span>
            )}
            {item.episodes && (
              <span className="text-[10px] text-[var(--color-mute)]">{item.episodes} ep</span>
            )}
          </div>
          {item.genres && item.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.genres.slice(0, 3).map((g) => (
                <span key={g} className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-line)]/20 text-[var(--color-mute)]">{g}</span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-line)]/30">
            <div className="flex items-center gap-2 text-[9px] text-[var(--color-mute)]">
              {item.popularity != null && <span>♥ {formatNumber(item.popularity)}</span>}
              {item.favourites != null && item.favourites > 0 && <span>☆ {formatNumber(item.favourites)}</span>}
            </div>
            {item.nextAiringEpisode && (
              <span className="text-[9px] font-mono" style={{ color }}>
                Ep {item.nextAiringEpisode.episode} in {Math.floor(item.nextAiringEpisode.timeUntilAiring / 86400)}d
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function UpcomingClient({ anime }: { anime: Media[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--color-cyan)]">// Season Preview</p>
        <h1 className="font-display text-3xl font-black sm:text-4xl md:text-5xl tracking-tight mt-1">
          <span className="neon-text-gradient">Upcoming Releases</span>
        </h1>
        <p className="mt-2 text-sm text-[var(--color-mute)]">Anime coming soon, sorted by popularity.</p>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs text-[var(--color-mute)]">{anime.length} titles</span>
          <div className="flex items-center gap-1 rounded-lg border border-[var(--color-line)] p-0.5">
            <button onClick={() => setView("grid")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === "grid" ? "bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] border border-[var(--color-cyan)]/20" : "text-[var(--color-mute)] hover:text-white"}`}>
              Grid
            </button>
            <button onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === "list" ? "bg-[var(--color-cyan)]/10 text-[var(--color-cyan)] border border-[var(--color-cyan)]/20" : "text-[var(--color-mute)] hover:text-white"}`}>
              List
            </button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      {anime.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-[var(--color-mute)]">No upcoming anime found.</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {anime.map((item, i) => (
            <AnimeCard key={item.id} item={item} index={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {anime.map((item, i) => {
            const color = CARD_COLORS[i % CARD_COLORS.length];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Link href={`/anime/${item.id}`}
                  className="flex items-stretch gap-0 rounded-xl overflow-hidden neon-feature-card group">
                  <div className="neon-border rounded-xl" style={{ background: `conic-gradient(from var(--border-angle), ${color}, transparent 40%, ${color}80, transparent 70%, ${color})` }} />
                  <div className="neon-glow rounded-xl" style={{ background: color }} />
                  <div className="neon-inner rounded-xl p-0 overflow-hidden flex items-stretch w-full" style={{ background: "var(--color-panel)" }}>
                    {/* Cover */}
                    <div className="relative w-[100px] sm:w-[130px] shrink-0 overflow-hidden">
                      {item.coverImage?.large ? (
                        <Image src={item.coverImage.large} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="130px" />
                      ) : (
                        <div className="w-full h-full bg-[var(--color-line)]/20" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[var(--color-panel)]/80" />
                      {/* Score overlay */}
                      {item.averageScore != null && (
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md backdrop-blur-md text-[10px] font-mono font-bold z-10"
                          style={{ background: `${color}25`, color, border: `1px solid ${color}40` }}>
                          ★ {(item.averageScore / 10).toFixed(1)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col justify-center">
                      <h3 className="text-sm sm:text-base font-bold truncate group-hover:opacity-80 transition-opacity">{bestTitle(item.title)}</h3>
                      {item.title?.romaji && item.title?.romaji !== bestTitle(item.title) && (
                        <p className="text-[10px] text-[var(--color-mute)] truncate mt-0.5">{item.title.romaji}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {item.format && (
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded" style={{ color, background: `${color}12`, border: `1px solid ${color}20` }}>
                            {item.format.replace(/_/g, " ")}
                          </span>
                        )}
                        {item.episodes && <span className="text-[10px] text-[var(--color-mute)]">{item.episodes} ep</span>}
                        {item.status && <span className="text-[10px] text-[var(--color-mute)]">{item.status.replace(/_/g, " ").toLowerCase()}</span>}
                      </div>
                      {item.genres && item.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {item.genres.slice(0, 4).map((g) => (
                            <span key={g} className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-line)]/20 text-[var(--color-mute)]">{g}</span>
                          ))}
                        </div>
                      )}
                      {item.description && (
                        <p className="text-[10px] text-[var(--color-mute)] mt-1.5 line-clamp-2 leading-relaxed hidden sm:block">{item.description.replace(/<[^>]*>/g, "").slice(0, 150)}...</p>
                      )}
                    </div>

                    {/* Right side stats */}
                    <div className="hidden sm:flex flex-col items-end justify-center gap-2 pr-4 shrink-0">
                      {item.popularity != null && (
                        <div className="text-center">
                          <p className="text-xs font-mono font-bold" style={{ color }}>{formatNumber(item.popularity)}</p>
                          <p className="text-[8px] text-[var(--color-mute)]">popularity</p>
                        </div>
                      )}
                      {item.favourites != null && item.favourites > 0 && (
                        <div className="text-center">
                          <p className="text-xs font-mono font-bold text-[var(--color-amber)]">{formatNumber(item.favourites)}</p>
                          <p className="text-[8px] text-[var(--color-mute)]">favourites</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </>
  );
}

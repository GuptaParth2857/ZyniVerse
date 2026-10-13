"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { LIST_STATUS_LABELS, type WatchlistItem } from "./WatchlistProvider";

const STATUS_ACCENT: Record<string, string> = {
  CURRENT: "var(--color-cyan)",
  COMPLETED: "#4ade80",
  PLANNING: "var(--color-violet)",
  PAUSED: "var(--color-amber)",
  DROPPED: "#f87171",
  REWATCHING: "var(--color-magenta)",
};

export default function WatchlistItemCard({
  item,
  index = 0,
  status,
  progress,
  score,
  onProgress,
  onRemove,
}: {
  item: WatchlistItem;
  index?: number;
  status: string | null;
  progress: number;
  score: number | null;
  onProgress: (next: number) => void;
  onRemove: () => void;
}) {
  const title = item.title.english || item.title.romaji || item.title.userPreferred || `Anime #${item.id}`;
  const cover = item.coverImage?.large || item.coverImage?.extraLarge || "";
  const href = item.type === "MANGA" ? `/manga/${item.id}` : `/anime/${item.id}`;
  const label = status ? LIST_STATUS_LABELS[status] ?? status : null;
  const accent = status ? STATUS_ACCENT[status] ?? "var(--color-cyan)" : "var(--color-mute)";
  const total = item.episodes ?? 0;
  const pct = total > 0 ? Math.min(100, Math.round((progress / total) * 100)) : 0;
  const done = total > 0 && progress >= total;

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4), ease: "easeOut" }}
    >
      <div className="glass-card">
        {/* Status accent rail */}
        <span className="absolute inset-x-0 top-0 z-10 h-0.5" style={{ background: accent }} />
        <div className="glass-content">
          <Link href={href} className="block">
            <div className="relative aspect-[2/3] overflow-hidden bg-[var(--color-panel)]">
              {cover ? (
                <Image
                  src={cover}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-panel)] to-[var(--color-void)] text-2xl opacity-40">
                  📺
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

              {label && (
                <span className="absolute left-2 top-2 glass-badge" style={{ color: accent }}>
                  {label}
                </span>
              )}

              {score != null && (
                <span className="absolute right-2 top-2 glass-score rounded-full px-2 py-1 text-[10px] font-mono font-semibold">
                  ★ {score.toFixed(1)}
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 p-3">
                <h3 className="font-display text-sm font-semibold leading-tight text-white line-clamp-2 drop-shadow-lg">
                  {title}
                </h3>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-white/60">
                  {item.type && <span className="font-mono uppercase">{item.type}</span>}
                  {item.format && <span className="font-mono">{item.format}</span>}
                  {total > 0 && <span>{total} ep</span>}
                </div>
              </div>
            </div>
          </Link>

          {/* Episode progress + quick controls (outside the Link) */}
          <div className="border-t border-white/5 px-3 py-2">
            <div className="flex items-center justify-between text-[10px] text-[var(--color-mute)]">
              <span className="font-mono">
                Ep {progress}{total > 0 ? ` / ${total}` : ""}
                {done && <span className="ml-1 text-[#4ade80]">✓</span>}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onProgress(Math.max(0, progress - 1))}
                  disabled={progress <= 0}
                  aria-label="Decrease episode"
                  className="flex h-5 w-5 items-center justify-center rounded-md border border-[var(--color-line)] text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-ink)] disabled:opacity-30 disabled:hover:border-[var(--color-line)]"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14" /></svg>
                </button>
                <button
                  type="button"
                  onClick={() => onProgress(progress + 1)}
                  aria-label="Increase episode"
                  className="flex h-5 w-5 items-center justify-center rounded-md border border-[var(--color-line)] text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)] hover:text-[var(--color-ink)]"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
                </button>
              </div>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: done ? "#4ade80" : "var(--color-cyan)" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status-coloured hover glow */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: `0 0 0 1px ${accent}, 0 14px 40px -10px ${accent}` }}
      />

      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove from list"
        title="Remove from list"
        className="glass-bookmark absolute right-2 top-10 z-20 flex h-7 w-7 items-center justify-center rounded-full text-white/70 opacity-100 transition-opacity focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6" />
        </svg>
      </button>
    </motion.div>
  );
}

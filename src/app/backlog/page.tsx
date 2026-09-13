"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import EmptyState from "@/components/EmptyState";
import { useSession } from "next-auth/react";

type ListStatus = "CURRENT" | "PLANNING" | "COMPLETED" | "DROPPED" | "PAUSED" | "REWATCHING";

interface BoardCard {
  mediaId: number;
  title: string;
  cover: string | null;
  coverColor: string | null;
  genres: string[];
  episodes: number;
  status: ListStatus;
  progress: number;
  score: number | null;
  dropReason: string | null;
  updatedAt: string;
}

const DROP_REASONS = [
  "Boring / Slow pace",
  "Not my taste",
  "Didn't like the animation",
  "Too long to finish",
  "Dropped mid-season",
  "Too much filler",
  "Found something better",
  "Too confusing",
];

const COLUMNS: { id: ListStatus; label: string; icon: string; accent: string }[] = [
  { id: "PLANNING", label: "Backlog", icon: "📚", accent: "#60a5fa" },
  { id: "CURRENT", label: "Watching", icon: "▶️", accent: "#00ff7f" },
  { id: "PAUSED", label: "On Hold", icon: "⏸️", accent: "#ffd700" },
  { id: "DROPPED", label: "Dropped", icon: "🗑️", accent: "#ff6b6b" },
  { id: "COMPLETED", label: "Completed", icon: "✅", accent: "#c084fc" },
];

function Cover({ card, size = "md" }: { card: BoardCard; size?: "md" | "lg" }) {
  const [failed, setFailed] = useState(false);
  const dims = size === "lg" ? "h-24 w-16" : "h-20 w-14";
  const bg = card.coverColor || undefined;
  return (
    <div
      className={`relative ${dims} shrink-0 overflow-hidden rounded-lg bg-[var(--color-line)]`}
      style={bg ? { backgroundImage: `linear-gradient(140deg, ${card.coverColor}55, #15121d)` } : undefined}
    >
      {card.cover && !failed ? (
        <>
          <div className="absolute inset-0 shimmer" />
          <Image
            src={card.cover}
            alt={card.title}
            fill
            className="object-cover"
            sizes="64px"
            unoptimized
            onLoad={(e) => ((e.target as HTMLImageElement).style.opacity = "1")}
            onError={() => setFailed(true)}
            style={{ opacity: 0 }}
          />
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-magenta)]/70">
          <span className="text-xl opacity-80">🎬</span>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ progress, total }: { progress: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((progress / total) * 100)) : 0;
  return (
    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="h-full rounded-full bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)]"
      />
    </div>
  );
}

async function moveCard(mediaId: number, status: ListStatus, dropReason?: string) {
  await fetch("/api/watchlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "add", mediaId, type: "ANIME", status, ...(dropReason ? { dropReason } : {}) }),
  });
}

const spring = { type: "spring", stiffness: 380, damping: 30, mass: 0.9 } as const;

export default function BacklogPage() {
  const { status: authStatus } = useSession();
  const [cards, setCards] = useState<BoardCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropTarget, setDropTarget] = useState<BoardCard | null>(null);
  const [customReason, setCustomReason] = useState("");
  const [activeDrop, setActiveDrop] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/backlog");
      const data = await res.json();
      setCards(data.cards || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const changeStatus = useCallback(
    async (id: number, status: ListStatus) => {
      setCards((prev) =>
        prev.map((c) => (c.mediaId === id ? { ...c, status, dropReason: status === "DROPPED" ? c.dropReason : null } : c))
      );
      await moveCard(id, status);
    },
    []
  );

  const confirmDrop = useCallback(async () => {
    if (!dropTarget) return;
    const reason = activeDrop === "custom" ? customReason.trim() : dropTarget.dropReason || DROP_REASONS[0];
    setCards((prev) => prev.map((c) => (c.mediaId === dropTarget.mediaId ? { ...c, status: "DROPPED", dropReason: reason } : c)));
    await moveCard(dropTarget.mediaId, "DROPPED", reason);
    setDropTarget(null);
    setCustomReason("");
    setActiveDrop(null);
  }, [dropTarget, activeDrop, customReason]);

  if (authStatus === "unauthenticated") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <EmptyState
          icon="box"
          title="Sign in to view your backlog"
          description="Your saved lists are synced to your account."
          actionLabel="Sign In"
          actionHref="/login"
        />
      </div>
    );
  }

  const collisions = COLUMNS.map((col) => ({
    ...col,
    colCards: cards.filter((c) => (col.id === "CURRENT" ? c.status === "CURRENT" || c.status === "REWATCHING" : c.status === col.id)),
  }));

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] opacity-40 blur-[120px]"
          style={{
            background:
              "radial-gradient(50% 50% at 20% 15%, rgba(96,165,250,0.45), transparent 70%), radial-gradient(50% 50% at 80% 20%, rgba(0,255,127,0.35), transparent 70%), radial-gradient(40% 40% at 55% 85%, rgba(192,132,252,0.3), transparent 70%)",
          }}
        />

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="neon-banner-card relative overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 px-6 py-10 backdrop-blur-sm sm:px-10"
        >
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="console-label mb-3">Board · Anime Tracker</p>
              <h1 className="neon-text-gradient font-display text-3xl font-black tracking-tight sm:text-4xl">
                Backlog Board
              </h1>
              <p className="mt-2 text-sm text-[var(--color-mute)]">
                Plan it, start it, hold it, drop it — your whole list on one board.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              {collisions.map((col) => (
                <div
                  key={col.id}
                  className="glass-badge !flex !items-center gap-1.5 !px-3 !py-2"
                  style={{ borderColor: `color-mix(in srgb, ${col.accent} 35%, transparent)` }}
                >
                  <span className="text-sm">{col.icon}</span>
                  <span className="font-mono text-xs font-bold" style={{ color: col.accent }}>
                    {col.colCards.length}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Link
            href="/watchlist"
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/5 px-4 py-2 text-xs font-semibold text-[var(--color-ink)] transition-all hover:border-[var(--color-cyan)]/50 hover:text-[var(--color-cyan)]"
          >
            ← My List
          </Link>
        </motion.section>

        {loading ? (
          <div className="mt-8 grid gap-4 lg:grid-cols-5 sm:grid-cols-2">
            {COLUMNS.map((col) => (
              <div key={col.id} className="glass-panel flex min-h-[320px] flex-col overflow-hidden rounded-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                  <span>{col.icon}</span>
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: col.accent }}>
                    {col.label}
                  </span>
                  <div className="ml-auto shimmer h-5 w-8 rounded-md" />
                </div>
                <div className="flex-1 space-y-3 p-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-white/[0.06] bg-black/20 p-2.5">
                      <div className="h-20 w-14 rounded-lg bg-white/[0.06]" />
                      <div className="shimmer mt-2 h-3 w-4/5 rounded" />
                      <div className="shimmer mt-1.5 h-2.5 w-1/2 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : cards.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
            <EmptyState
              icon="bookmark"
              title="No saved anime yet"
              description="Add anime from search to start building your board."
              actionLabel="Explore Anime"
              actionHref="/search"
            />
          </motion.div>
        ) : (
          <div className="mt-8 grid gap-4 lg:grid-cols-5 sm:grid-cols-2">
            <AnimatePresence>
              {collisions.map((col, colIdx) => (
                <motion.div
                  key={col.id}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: colIdx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="glass-panel flex min-h-[320px] flex-col overflow-hidden rounded-2xl"
                >
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                    <span>{col.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: col.accent }}>
                      {col.label}
                    </span>
                    <motion.span
                      key={col.colCards.length}
                      initial={{ scale: 0.6 }}
                      animate={{ scale: 1 }}
                      className="ml-auto rounded-full px-2 py-0.5 font-mono text-[11px] font-bold"
                      style={{ background: `color-mix(in srgb, ${col.accent} 15%, transparent)`, color: col.accent }}
                    >
                      {col.colCards.length}
                    </motion.span>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto p-3 board-scroll max-h-[560px]">
                    {col.colCards.length === 0 && (
                      <div className="mt-8 text-center text-xs text-[var(--color-mute)]/50">
                        Nothing here —{" "}
                        {col.id === "DROPPED" ? "all good" : "keep it clean"}
                      </div>
                    )}
                    <AnimatePresence initial={false}>
                      {col.colCards.map((card, i) => (
                        <motion.div
                          key={card.mediaId}
                          layout
                          initial={{ opacity: 0, scale: 0.92, y: 14 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={{ ...spring, delay: Math.min(i * 0.04, 0.3) }}
                          whileHover={{ y: -4 }}
                          className="meme-card-border group overflow-hidden rounded-xl bg-[#15121d]/90"
                        >
                          <div className="flex gap-3 p-2.5">
                            <Link
                              href={`/anime/${card.mediaId}`}
                              className="block shrink-0 rounded-lg transition-transform duration-300 group-hover:scale-[1.03]"
                            >
                              <Cover card={card} />
                            </Link>
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/anime/${card.mediaId}`}
                                className="block line-clamp-2 text-sm font-semibold leading-tight transition-colors hover:text-[var(--color-cyan)]"
                              >
                                {card.title}
                              </Link>
                              {card.genres.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {card.genres.slice(0, 2).map((g) => (
                                    <span
                                      key={g}
                                      className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-[var(--color-mute)]"
                                    >
                                      {g}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-[var(--color-mute)]">
                                {card.progress > 0 && card.episodes > 0 && (
                                  <span className="font-mono text-[var(--color-cyan)]/90">
                                    Ep {card.progress}/{card.episodes}
                                  </span>
                                )}
                                {card.score != null && (
                                  <span className="text-[var(--color-amber)]">★ {card.score}</span>
                                )}
                              </div>
                              {(col.id === "CURRENT" || col.id === "PAUSED") && card.episodes > 0 && (
                                <ProgressBar progress={card.progress} total={card.episodes} />
                              )}
                              {col.id === "DROPPED" && (
                                <div
                                  className="mt-1.5 truncate text-[10px] text-red-400/80"
                                  title={card.dropReason || ""}
                                >
                                  ⚑ {card.dropReason || "No reason"}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 px-2 pb-2">
                            {col.id === "PLANNING" && (
                              <ActionBtn color="#00ff7f" onClick={() => changeStatus(card.mediaId, "CURRENT")}>
                                ▶ Start
                              </ActionBtn>
                            )}
                            {col.id === "CURRENT" && (
                              <>
                                <ActionBtn color="#c084fc" onClick={() => changeStatus(card.mediaId, "COMPLETED")}>
                                  ✓ Done
                                </ActionBtn>
                                <ActionBtn color="#ffd700" onClick={() => changeStatus(card.mediaId, "PAUSED")}>
                                  ⏸ Hold
                                </ActionBtn>
                              </>
                            )}
                            {col.id === "PAUSED" && (
                              <>
                                <ActionBtn color="#00ff7f" onClick={() => changeStatus(card.mediaId, "CURRENT")}>
                                  ▶ Resume
                                </ActionBtn>
                                <ActionBtn color="#ff6b6b" onClick={() => changeStatus(card.mediaId, "DROPPED")}>
                                  🗑 Drop
                                </ActionBtn>
                              </>
                            )}
                            {col.id === "DROPPED" && (
                              <>
                                <ActionBtn color="#00ff7f" onClick={() => changeStatus(card.mediaId, "CURRENT")}>
                                  ↺ Pick Up
                                </ActionBtn>
                                <ActionBtn color="#60a5fa" onClick={() => changeStatus(card.mediaId, "PLANNING")}>
                                  Backlog
                                </ActionBtn>
                              </>
                            )}
                            {col.id === "COMPLETED" && (
                              <>
                                <ActionBtn color="#00ff7f" onClick={() => changeStatus(card.mediaId, "CURRENT")}>
                                  ↻ Rewatch
                                </ActionBtn>
                                <ActionBtn color="#60a5fa" onClick={() => changeStatus(card.mediaId, "PLANNING")}>
                                  Backlog
                                </ActionBtn>
                              </>
                            )}
                            {col.id !== "DROPPED" && (
                              <button
                                onClick={() => {
                                  setDropTarget(card);
                                  setCustomReason("");
                                  setActiveDrop(null);
                                }}
                                title="Drop with reason"
                                className="rounded-md bg-red-500/10 px-2 py-1 text-[11px] font-semibold text-red-400/80 transition-colors hover:bg-red-500/25 hover:text-red-300"
                              >
                                🗑
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {dropTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setDropTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={spring}
              className="meme-card-border w-full max-w-md overflow-hidden rounded-2xl bg-[#15121d]/95 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-[var(--color-ink)]">
                  Drop this anime?
                </h3>
                <span className="glass-badge !px-2 !py-1 !text-[10px] !text-red-400">
                  🗑️ will move to Dropped
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--color-mute)]">
                Tell us why — it powers better recommendations for you.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Cover card={dropTarget} size="lg" />
                <p className="text-sm font-semibold text-[var(--color-ink)]">{dropTarget.title}</p>
              </div>
              <div className="mt-4 max-h-56 space-y-2 overflow-y-auto board-scroll pr-1">
                {DROP_REASONS.map((r, i) => (
                  <motion.button
                    key={r}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.03 }}
                    onClick={() => setActiveDrop(r === activeDrop ? null : r)}
                    className={`block w-full rounded-lg border px-3 py-2 text-left text-sm transition-all ${
                      activeDrop === r
                        ? "border-red-500/60 bg-red-500/10 text-red-300 shadow-[0_0_14px_rgba(255,80,80,0.15)]"
                        : "border-white/[0.08] bg-black/20 text-[var(--color-mute)] hover:border-[var(--color-line)] hover:text-white"
                    }`}
                  >
                    {r}
                  </motion.button>
                ))}
                <div className="pt-1">
                  <input
                    value={activeDrop === "custom" ? customReason : ""}
                    onChange={(e) => {
                      setActiveDrop("custom");
                      setCustomReason(e.target.value);
                    }}
                    placeholder="✍️ Write your own reason..."
                    className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-[var(--color-mute)] focus:border-red-400/60"
                  />
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setDropTarget(null)}
                  className="flex-1 rounded-lg border border-white/[0.1] py-2 text-sm text-[var(--color-mute)] transition-all hover:border-[var(--color-line)] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDrop}
                  disabled={activeDrop === "custom" && !customReason.trim()}
                  className="flex-1 rounded-lg bg-gradient-to-r from-red-500 to-[var(--color-magenta)] py-2 text-sm font-bold text-black transition-all hover:opacity-90 disabled:opacity-40"
                >
                  Confirm Drop
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

function ActionBtn({
  color,
  onClick,
  children,
}: {
  color: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 rounded-md py-1 text-[11px] font-semibold transition-all"
      style={{
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
        color,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = `color-mix(in srgb, ${color} 26%, transparent)`)}
      onMouseLeave={(e) => (e.currentTarget.style.background = `color-mix(in srgb, ${color} 14%, transparent)`)}
    >
      {children}
    </button>
  );
}
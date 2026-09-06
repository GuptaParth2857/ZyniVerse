"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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

async function moveCard(mediaId: number, status: ListStatus, dropReason?: string) {
  await fetch("/api/watchlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "add", mediaId, type: "ANIME", status, ...(dropReason ? { dropReason } : {}) }),
  });
}

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

  const changeStatus = useCallback(async (id: number, status: ListStatus) => {
    setCards((prev) => prev.map((c) => (c.mediaId === id ? { ...c, status, dropReason: status === "DROPPED" ? c.dropReason : null } : c)));
    await moveCard(id, status);
  }, []);

  const confirmDrop = useCallback(async () => {
    if (!dropTarget) return;
    const reason = activeDrop === "custom" ? customReason.trim() : (dropTarget.dropReason || DROP_REASONS[0]);
    setCards((prev) => prev.map((c) => (c.mediaId === dropTarget.mediaId ? { ...c, status: "DROPPED", dropReason: reason } : c)));
    await moveCard(dropTarget.mediaId, "DROPPED", reason);
    setDropTarget(null);
    setCustomReason("");
    setActiveDrop(null);
  }, [dropTarget, activeDrop, customReason]);

  if (authStatus === "unauthenticated") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <EmptyState icon="box" title="Sign in to view your backlog" description="Your saved lists are synced to your account." actionLabel="Sign In" actionHref="/login" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 animate-page-in">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-cyan)]">Board</p>
            <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
              <h1 className="font-display text-3xl font-bold sm:text-4xl">Backlog Board</h1>
            </div>
            <p className="mt-1 text-sm text-[var(--color-mute)]">Drag-free board to plan, watch, pause, and drop with reasons.</p>
          </div>
          <Link href="/watchlist" className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-cyan)] transition-all">
            ← My List
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 rounded-full border-2 border-[var(--color-cyan)] border-t-transparent animate-spin" />
          </div>
        ) : cards.length === 0 ? (
          <div className="mt-10">
            <EmptyState icon="bookmark" title="No saved anime yet" description="Add anime from search to start building your board." actionLabel="Explore Anime" actionHref="/search" />
          </div>
        ) : (
          <div className="mt-8 grid gap-4 lg:grid-cols-5 sm:grid-cols-2">
            {COLUMNS.map((col) => {
              const colCards = cards.filter((c) => (col.id === "CURRENT" ? c.status === "CURRENT" || c.status === "REWATCHING" : c.status === col.id));
              return (
                <div key={col.id} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/40 overflow-hidden flex flex-col min-h-[320px]">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-line)]" style={{ background: `color-mix(in srgb, ${col.accent} 12%, transparent)` }}>
                    <span>{col.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: col.accent }}>{col.label}</span>
                    <span className="ml-auto text-xs font-mono text-[var(--color-mute)]">{colCards.length}</span>
                  </div>
                  <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[520px]">
                    {colCards.length === 0 && (
                      <div className="text-center text-xs text-[var(--color-mute)]/50 mt-8">Nothing here</div>
                    )}
                    {colCards.map((card) => (
                      <div key={card.mediaId} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden group hover:border-[var(--color-cyan)]/50 transition-all">
                        <div className="flex gap-3 p-2.5">
                          <Link href={`/anime/${card.mediaId}`} className="block relative h-20 w-14 rounded-lg overflow-hidden shrink-0 bg-[var(--color-line)]">
                            {card.cover && <Image src={card.cover} alt={card.title} fill className="object-cover" sizes="56px" unoptimized />}
                          </Link>
                          <div className="min-w-0 flex-1">
                            <Link href={`/anime/${card.mediaId}`} className="block text-sm font-semibold leading-tight hover:text-[var(--color-cyan)] transition-colors line-clamp-2">{card.title}</Link>
                            {card.genres.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {card.genres.slice(0, 2).map((g) => (
                                  <span key={g} className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-[var(--color-mute)]">{g}</span>
                                ))}
                              </div>
                            )}
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-[var(--color-mute)]">
                              {card.progress > 0 && card.episodes > 0 && (
                                <span className="font-mono">Ep {card.progress}/{card.episodes}</span>
                              )}
                              {card.score != null && <span>★ {card.score}</span>}
                            </div>
                            {col.id === "DROPPED" && (
                              <div className="mt-1.5 text-[10px] text-red-400/80 truncate" title={card.dropReason || ""}>⚑ {card.dropReason || "No reason"}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 px-2 pb-2">
                          {col.id === "PLANNING" && (
                            <button onClick={() => changeStatus(card.mediaId, "CURRENT")} className="flex-1 rounded-md bg-emerald-500/15 text-emerald-400 text-[11px] font-semibold py-1 hover:bg-emerald-500/25 transition-colors">▶ Start</button>
                          )}
                          {col.id === "CURRENT" && (
                            <>
                              <button onClick={() => changeStatus(card.mediaId, "COMPLETED")} className="flex-1 rounded-md bg-purple-500/15 text-purple-300 text-[11px] font-semibold py-1 hover:bg-purple-500/25 transition-colors">✓ Done</button>
                              <button onClick={() => changeStatus(card.mediaId, "PAUSED")} className="flex-1 rounded-md bg-yellow-500/15 text-yellow-300 text-[11px] font-semibold py-1 hover:bg-yellow-500/25 transition-colors">⏸ Hold</button>
                            </>
                          )}
                          {col.id === "PAUSED" && (
                            <>
                              <button onClick={() => changeStatus(card.mediaId, "CURRENT")} className="flex-1 rounded-md bg-emerald-500/15 text-emerald-400 text-[11px] font-semibold py-1 hover:bg-emerald-500/25 transition-colors">▶ Resume</button>
                              <button onClick={() => changeStatus(card.mediaId, "DROPPED")} className="flex-1 rounded-md bg-red-500/15 text-red-400 text-[11px] font-semibold py-1 hover:bg-red-500/25 transition-colors">🗑 Drop</button>
                            </>
                          )}
                          {col.id === "DROPPED" && (
                            <>
                              <button onClick={() => changeStatus(card.mediaId, "CURRENT")} className="flex-1 rounded-md bg-emerald-500/15 text-emerald-400 text-[11px] font-semibold py-1 hover:bg-emerald-500/25 transition-colors">↺ Pick Up</button>
                              <button onClick={() => changeStatus(card.mediaId, "PLANNING")} className="flex-1 rounded-md bg-white/5 text-[var(--color-mute)] text-[11px] font-semibold py-1 hover:bg-white/10 transition-colors">Backlog</button>
                            </>
                          )}
                          {col.id === "COMPLETED" && (
                            <>
                              <button onClick={() => changeStatus(card.mediaId, "CURRENT")} className="flex-1 rounded-md bg-emerald-500/15 text-emerald-400 text-[11px] font-semibold py-1 hover:bg-emerald-500/25 transition-colors">↻ Rewatch</button>
                              <button onClick={() => changeStatus(card.mediaId, "PLANNING")} className="flex-1 rounded-md bg-white/5 text-[var(--color-mute)] text-[11px] font-semibold py-1 hover:bg-white/10 transition-colors">Backlog</button>
                            </>
                          )}
                          {col.id !== "DROPPED" && (
                            <button onClick={() => { setDropTarget(card); setCustomReason(""); setActiveDrop(null); }} className="rounded-md bg-red-500/10 text-red-400/80 text-[11px] font-semibold py-1 px-2 hover:bg-red-500/20 transition-colors" title="Drop with reason">🗑</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {dropTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setDropTarget(null)}>
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6 animate-page-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[var(--color-ink)]">Drop this anime?</h3>
            <p className="mt-1 text-sm text-[var(--color-mute)]">Tell us why — it powers better recommendations for you.</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="relative h-20 w-14 rounded-lg overflow-hidden shrink-0 bg-[var(--color-line)]">
                {dropTarget.cover && <Image src={dropTarget.cover} alt="" fill className="object-cover" sizes="56px" unoptimized />}
              </div>
              <p className="text-sm font-semibold">{dropTarget.title}</p>
            </div>
            <div className="mt-4 space-y-2">
              {DROP_REASONS.map((r) => (
                <button key={r} onClick={() => setActiveDrop(r === activeDrop ? null : r)}
                  className={`block w-full text-left rounded-lg border px-3 py-2 text-sm transition-all ${activeDrop === r ? "border-red-500/60 bg-red-500/10 text-red-300" : "border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-line)]/60"}`}>
                  {r}
                </button>
              ))}
              <div className="pt-1">
                <input
                  value={activeDrop === "custom" ? customReason : ""}
                  onChange={(e) => { setActiveDrop("custom"); setCustomReason(e.target.value); }}
                  placeholder="✍️ Write your own reason..."
                  className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm outline-none focus:border-red-400/60 transition-colors"
                />
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setDropTarget(null)} className="flex-1 rounded-lg border border-[var(--color-line)] py-2 text-sm text-[var(--color-mute)] hover:border-[var(--color-line)]/60 transition-all">Cancel</button>
              <button onClick={confirmDrop} disabled={activeDrop === "custom" && !customReason.trim()}
                className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-bold text-black transition-all hover:bg-red-400 disabled:opacity-40">
                Confirm Drop
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
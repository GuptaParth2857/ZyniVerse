"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

interface EntryUser { username: string; avatar: string | null }
interface Entry { id: string; title: string; image: string | null; caption: string | null; upvotes: number; user: EntryUser }
interface Contest {
  id: string; title: string; type: string; description: string | null;
  rewardXp: number; weekStart: string; weekEnd: string;
  hasVoted: boolean; votedEntryId: string | null; hasSubmitted: boolean;
  entries: Entry[];
}

const TYPE_META: Record<string, { icon: string; color: string }> = {
  MEME: { icon: "😂", color: "#facc15" },
  COSPLAY: { icon: "🎭", color: "#a78bfa" },
  FANART: { icon: "🎨", color: "#f472b6" },
  MOMENT: { icon: "💬", color: "#00ffe0" },
  BLOG: { icon: "📝", color: "#60a5fa" },
};

const spring = { type: "spring", stiffness: 380, damping: 30, mass: 0.9 } as const;

function ProgressRing({ current, max, color }: { current: number; max: number; color: string }) {
  const stroke = 6;
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(1, current / max) : 0;
  return (
    <div className="relative h-16 w-16">
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <motion.circle
          cx="32" cy="32" r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold" style={{ color }}>
        {Math.round(pct * 100)}%
      </span>
    </div>
  );
}

export default function ContestsPage() {
  const { status } = useSession();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [voteBusy, setVoteBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [votedPulse, setVotedPulse] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/contests")
      .then((r) => r.json())
      .then((d) => setContests(d.contests || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function vote(contestId: string, entryId: string) {
    if (voteBusy) return;
    setVoteBusy(entryId);
    try {
      const res = await fetch("/api/contests/vote", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entryId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Couldn't vote."); setVoteBusy(null); return; }
      setContests((cs) => cs.map((c) => c.id === contestId
        ? { ...c, hasVoted: true, votedEntryId: entryId, entries: c.entries.map((e) => e.id === entryId ? { ...e, upvotes: data.upvotes } : e) }
        : c));
      setError("");
      setVotedPulse(entryId);
      setTimeout(() => setVotedPulse(null), 700);
    } catch { setError("Couldn't vote."); }
    setVoteBusy(null);
  }

  const totalEntries = contests.reduce((sum, c) => sum + c.entries.length, 0);
  const liveContests = contests.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] opacity-40 blur-[120px]"
        style={{
          background:
            "radial-gradient(45% 50% at 15% 10%, rgba(250,204,21,0.35), transparent 70%), radial-gradient(50% 50% at 85% 15%, rgba(167,139,250,0.4), transparent 70%), radial-gradient(40% 40% at 60% 90%, rgba(244,114,182,0.3), transparent 70%)",
        }}
      />

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="neon-banner-card relative overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 px-6 py-10 backdrop-blur-sm sm:px-10"
      >
        <div className="flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-xl">
            <p className="console-label mb-3">✦ Weekly Community Battles</p>
            <h1 className="neon-text-gradient font-display text-3xl font-black tracking-tight sm:text-5xl">
              Community Contests 🏆
            </h1>
            <p className="mt-3 text-sm text-[var(--color-mute)]">
              Vote for the best meme, cosplay and fan art every week. Winners earn a{" "}
              <span className="font-semibold text-[var(--color-cyan)]">badge + 100 XP</span>!
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <span className="glass-badge !px-3 !py-1.5 !text-[11px]">🏆 {liveContests} live battles</span>
              <span className="glass-badge !px-3 !py-1.5 !text-[11px]">🖼️ {totalEntries} submissions</span>
              {status !== "authenticated" && (
                <Link href="/login" className="glass-badge !px-3 !py-1.5 !text-[11px] transition-colors hover:border-[var(--color-cyan)]/60 hover:text-[var(--color-cyan)]">
                  🔑 Sign in to vote
                </Link>
              )}
            </div>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            {contests.slice(0, 3).map((c, i) => {
              const meta = TYPE_META[c.type] || { icon: "🏆", color: "#00ffe0" };
              return (
                <motion.div
                  key={c.id}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.6, ease: "easeInOut" }}
                  className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-black/25"
                >
                  <span className="text-2xl" style={{ filter: `drop-shadow(0 0 8px ${meta.color})` }}>{meta.icon}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {loading ? (
        <div className="mt-8 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 p-5">
              <div className="flex items-center gap-3">
                <div className="shimmer h-10 w-10 rounded-xl" />
                <div className="space-y-2">
                  <div className="shimmer h-4 w-48 rounded" />
                  <div className="shimmer h-3 w-72 rounded" />
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="aspect-[4/5] rounded-xl bg-black/25 shimmer" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 overflow-hidden rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300"
            >
              {error}
            </motion.p>
          )}
        <AnimatePresence>
          {contests.map((c, idx) => {
            const meta = TYPE_META[c.type] || { icon: "🏆", color: "#00ffe0" };
            const sorted = [...c.entries].sort((a, b) => b.upvotes - a.upvotes);
            return (
              <motion.section
                key={c.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * idx, ...spring }}
                className="group meme-card-border relative mt-6 overflow-hidden rounded-3xl bg-[#15121d]/90 backdrop-blur-sm"
              >
                <div className="pointer-events-none absolute inset-x-6 top-0 z-40 h-px meme-hairline" />

                {/* Contest header */}
                <div className="relative flex flex-wrap items-center gap-4 border-b border-white/[0.06] bg-[#0a0910] px-4 py-4 sm:px-6">
                  <motion.div
                    animate={{ rotate: [0, -6, 6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] text-2xl"
                    style={{ background: `${meta.color}14`, boxShadow: `inset 0 0 16px ${meta.color}22` }}
                  >
                    {meta.icon}
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-lg font-bold sm:text-xl">{c.title}</h2>
                    <p className="truncate text-xs text-[var(--color-mute)]">{c.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block">
                      <ProgressRing current={c.entries.length} max={Math.max(2, c.entries.length + 1)} color={meta.color} />
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="rounded-full border px-3 py-1 text-[10px] font-mono" style={{ background: `${meta.color}12`, borderColor: `${meta.color}44`, color: meta.color }}>
                        +{c.rewardXp} XP
                      </span>
                      <span className="rounded-full border border-white/[0.08] bg-black/25 px-3 py-1 text-[10px] font-mono text-[var(--color-mute)]">
                        {c.entries.length} entries
                      </span>
                    </div>
                  </div>
                </div>

                {/* Entries grid */}
                {c.entries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
                    <motion.span
                      animate={{ y: [0, -8, 0], rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-4xl"
                    >
                      🏜️
                    </motion.span>
                    <p className="text-sm text-[var(--color-mute)]">No entries yet. Be the first to set the bar!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 sm:p-5">
                    <AnimatePresence initial={false}>
                      {sorted.map((e, entryIdx) => {
                        const isWinner = entryIdx === 0 && sorted.length > 1 && sorted[0].upvotes > sorted[1]?.upvotes;
                        const isVoted = c.votedEntryId === e.id;
                        return (
                          <motion.div
                            key={e.id}
                            layout
                            initial={{ opacity: 0, scale: 0.85, y: 14 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ delay: 0.1 + entryIdx * 0.05, ...spring }}
                            whileHover={{ y: -5 }}
                            className={`group/entry relative overflow-hidden rounded-2xl border bg-black/25 transition-all duration-300 ${
                              isVoted ? "border-[var(--color-cyan)]/60 shadow-[0_0_20px_rgba(0,255,224,0.2)]" : "border-white/[0.07]"
                            }`}
                          >
                            {e.image ? (
                              <>
                                <div className="absolute inset-0 shimmer" />
                                <Image src={e.image} alt={e.title} fill className="object-cover aspect-[4/5] transition-transform duration-500 group-hover/entry:scale-110" sizes="(max-width:768px) 50vw, 25vw" loading="lazy" />
                              </>
                            ) : (
                              <div className="flex aspect-[4/5] items-center justify-center text-xs text-[var(--color-mute)]">No image</div>
                            )}
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

                            {/* Winner / Voted / Rank top-left */}
                            <div className="absolute left-2 top-2 flex flex-col gap-1">
                              {isWinner && (
                                <span className="rounded-full bg-gradient-to-r from-[#ffd700] to-[var(--color-magenta)] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-black shadow-[0_0_14px_rgba(255,215,0,0.5)]">
                                  👑 Lead
                                </span>
                              )}
                              {isVoted && (
                                <span className="rounded-full bg-[var(--color-cyan)]/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-black shadow-[0_0_12px_rgba(0,255,224,0.5)]">
                                  ✓ Voted
                                </span>
                              )}
                            </div>

                            {/* Bottom info */}
                            <div className="absolute inset-x-0 bottom-0 p-2.5">
                              <p className="text-xs font-semibold leading-tight text-white line-clamp-1">{e.title}</p>
                              {e.caption && <p className="mt-0.5 line-clamp-1 text-[10px] text-white/70">{e.caption}</p>}
                              <div className="mt-1.5 flex items-center gap-1.5">
                                <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-[var(--color-void)] text-[8px] text-[var(--color-mute)] ring-1 ring-white/10">
                                  {e.user?.avatar ? <Image src={e.user.avatar} alt="" fill className="object-cover" sizes="20px" /> : (e.user?.username || "?")[0].toUpperCase()}
                                </span>
                                <span className="text-[9px] text-white/80">@{e.user?.username || "anon"}</span>
                              </div>
                            </div>

                            {/* Vote button */}
                            <button
                              onClick={() => void vote(c.id, e.id)}
                              disabled={voteBusy !== null || c.hasVoted}
                              className={`absolute bottom-2 right-2 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all disabled:opacity-70 ${
                                isVoted
                                  ? "bg-[var(--color-cyan)] text-black shadow-[0_0_16px_rgba(0,255,224,0.5)]"
                                  : "bg-black/60 text-white backdrop-blur-sm hover:bg-[var(--color-cyan)] hover:text-black"
                              }`}
                            >
                              <motion.span
                                key={e.upvotes + (votedPulse === e.id ? "-p" : "")}
                                initial={{ scale: 0.4 }}
                                animate={votedPulse === e.id ? { scale: [0.4, 1.5, 1] } : { scale: 1 }}
                                transition={spring}
                                className="tabular-nums"
                              >
                                👍 {e.upvotes}
                              </motion.span>
                            </button>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}

                {/* Submit CTA */}
                {c.entries.length > 0 && (
                  <div className="border-t border-white/[0.06] bg-[#0a0910]/60 px-4 py-3 sm:px-6">
                    {c.hasSubmitted ? (
                      <p className="text-center text-[11px] text-[var(--color-mute)]">
                        ✅ You already entered this battle. Good luck!
                      </p>
                    ) : (
                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="text-center">
                        <Link
                          href={`/contests/submit?contestId=${c.id}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-violet)] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black transition-all hover:shadow-[0_0_22px_rgba(0,255,224,0.35)]"
                        >
                          ✨ Enter this battle
                        </Link>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.section>
            );
          })}
        </AnimatePresence>
        </>
      )}

      {!loading && contests.length === 0 && (
        <p className="mt-8 text-center text-sm text-[var(--color-mute)]">No contests running right now — check back soon!</p>
      )}

      {status !== "authenticated" && !loading && (
        <p className="mt-8 text-center text-sm text-[var(--color-mute)]">
          <Link href="/login" className="text-[var(--color-cyan)] hover:underline">Sign in</Link> to vote and submit entries.
        </p>
      )}
    </div>
  );
}

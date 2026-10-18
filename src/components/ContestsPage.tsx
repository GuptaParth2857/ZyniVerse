"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import ContestCountdown from "@/components/ContestCountdown";
import ContestEntryLightbox from "@/components/ContestEntryLightbox";
import ContestEntryCard from "@/components/ContestEntryCard";
import ContestActivityRail from "@/components/ContestActivityRail";
import {
  CONTEST_PRIZES,
  contestTypeMeta,
  type ContestDTO,
} from "@/lib/contest-meta";

const spring = { type: "spring", stiffness: 380, damping: 30, mass: 0.9 } as const;

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function ProgressRing({ pct, color, caption }: { pct: number; color: string; caption: string }) {
  const stroke = 6;
  const radius = 26;
  const circ = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, pct));
  return (
    <div className="relative h-[64px] w-[64px]" title={caption}>
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <motion.circle
          cx="32" cy="32" r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - clamped) }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-bold" style={{ color }}>
        {Math.round(clamped * 100)}%
      </span>
    </div>
  );
}

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target <= 0) {
      // Clamp to 0 when the target goes non-positive (sync with the prop).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(0);
      return;
    }
    let raf = 0;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function AnimatedStat({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
  const shown = useCountUp(value);
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/25 px-4 py-3">
      <span className="text-xl" aria-hidden>{icon}</span>
      <div>
        <p className="font-mono text-lg font-black leading-none tabular-nums" style={{ color }}>{shown}</p>
        <p className="mt-1 text-[10px] uppercase tracking-widest text-[var(--color-mute)]">{label}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

type SortMode = "top" | "new";

export default function ContestsPage() {
  const { status } = useSession();
  const [contests, setContests] = useState<ContestDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [voteBusy, setVoteBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pulse, setPulse] = useState<string | null>(null);
  const [burst, setBurst] = useState<{ key: number; entryId: string } | null>(null);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sort, setSort] = useState<SortMode>("top");
  const [query, setQuery] = useState("");
  const [lightbox, setLightbox] = useState<{ contestId: string; index: number } | null>(null);

  useEffect(() => {
    void fetch("/api/contests")
      .then((r) => r.json())
      .then((d) => setContests(d.contests || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const vote = useCallback(async (contestId: string, entryId: string) => {
    setVoteBusy(entryId);
    try {
      const res = await fetch("/api/contests/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          // Already voted (maybe in another tab) — reflect the server's truth.
          setContests((cs) => cs.map((c) => (c.id === contestId ? { ...c, hasVoted: true, votedEntryId: data.votedEntryId ?? c.votedEntryId } : c)));
        }
        setError(data.error || "Couldn't vote.");
        setVoteBusy(null);
        return;
      }
      setContests((cs) =>
        cs.map((c) =>
          c.id === contestId
            ? {
                ...c,
                hasVoted: true,
                votedEntryId: entryId,
                totalVotes: (c.totalVotes ?? 0) + 1,
                entries: c.entries.map((e) => (e.id === entryId ? { ...e, upvotes: data.upvotes } : e)),
              }
            : c,
        ),
      );
      setError("");
      setPulse(entryId);
      setBurst({ key: Date.now(), entryId });
      window.setTimeout(() => setPulse(null), 700);
      window.setTimeout(() => setBurst(null), 1500);
    } catch {
      setError("Couldn't vote.");
    }
    setVoteBusy(null);
  }, []);

  const isAuthed = status === "authenticated";

  const typeTabs = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of contests) counts.set(c.type, (counts.get(c.type) ?? 0) + 1);
    return [
      { key: "ALL", label: "All", icon: "✦", count: contests.length },
      ...[...counts.entries()].map(([key, count]) => ({ key, label: contestTypeMeta(key).label, icon: contestTypeMeta(key).icon, count })),
    ];
  }, [contests]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contests
      .filter((c) => typeFilter === "ALL" || c.type === typeFilter)
      .map((c) => {
        const entries = [...c.entries]
          .filter((e) =>
            !q ||
            e.title.toLowerCase().includes(q) ||
            (e.caption ?? "").toLowerCase().includes(q) ||
            e.user.username.toLowerCase().includes(q),
          )
          .sort((a, b) =>
            sort === "top"
              ? b.upvotes - a.upvotes
              : new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
          )
          .map((e, i) => ({ ...e, rank: i + 1 }));
        return { ...c, entries };
      })
      .filter((c) => !q || c.entries.length > 0);
  }, [contests, typeFilter, sort, query]);

  const totals = useMemo(() => {
    const entries = contests.reduce((sum, c) => sum + c.entries.length, 0);
    const votes = contests.reduce((sum, c) => sum + (c.totalVotes ?? c.entries.reduce((s, e) => s + e.upvotes, 0)), 0);
    return { entries, votes, battles: contests.length };
  }, [contests]);

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] opacity-40 blur-[120px]"
        style={{
          background:
            "radial-gradient(45% 50% at 15% 10%, rgba(250,204,21,0.35), transparent 70%), radial-gradient(50% 50% at 85% 15%, rgba(167,139,250,0.4), transparent 70%), radial-gradient(40% 40% at 60% 90%, rgba(244,114,182,0.3), transparent 70%)",
        }}
      />

      {/* ---------------------------------------------------------- Hero */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="neon-banner-card relative overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 px-6 py-10 backdrop-blur-sm sm:px-10"
      >
        <motion.div
          aria-hidden
          animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.08, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-[90px]"
          style={{ background: "radial-gradient(circle, rgba(0,255,224,0.35), transparent 65%)" }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-2xl">
            <p className="console-label mb-3">✦ Weekly Community Battles</p>
            <h1 className="neon-text-gradient font-display text-3xl font-black tracking-tight sm:text-5xl">
              Community Contests 🏆
            </h1>
            <p className="mt-3 text-sm text-[var(--color-mute)]">
              Vote for the best meme, cosplay and fan art every week. Winners earn a{" "}
              <span className="font-semibold text-[var(--color-cyan)]">badge + 100 XP + 50 coins</span> — awarded automatically when the week closes.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              <AnimatedStat icon="⚔️" value={totals.battles} label="Live battles" color="var(--color-cyan)" />
              <AnimatedStat icon="🖼️" value={totals.entries} label="Submissions" color="var(--color-magenta)" />
              <AnimatedStat icon="👍" value={totals.votes} label="Votes cast" color="var(--color-violet)" />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/contests/submit"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-violet)] px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-black transition-all hover:shadow-[0_0_22px_rgba(0,255,224,0.35)]"
              >
                🚀 Enter a battle
              </Link>
              <Link href="/contests/leaderboard" className="glass-badge !px-4 !py-2 !text-[11px] transition-colors hover:border-[var(--color-cyan)]/60 hover:text-[var(--color-cyan)]">
                🥇 Leaderboard
              </Link>
              <Link href="/contests/hall-of-fame" className="glass-badge !px-4 !py-2 !text-[11px] transition-colors hover:border-[var(--color-cyan)]/60 hover:text-[var(--color-cyan)]">
                🏛️ Hall of Fame
              </Link>
              {!isAuthed && status !== "loading" && (
                <Link href="/login" className="glass-badge !px-4 !py-2 !text-[11px] transition-colors hover:border-[var(--color-cyan)]/60 hover:text-[var(--color-cyan)]">
                  🔑 Sign in to vote
                </Link>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start gap-4">
            {contests[0] && <ContestCountdown target={contests[0].weekEnd} color={contestTypeMeta(contests[0].type).color} label="This week closes in" />}
            <div className="hidden items-center gap-3 sm:flex">
              {contests.slice(0, 3).map((c) => {
                const meta = contestTypeMeta(c.type);
                return (
                  <motion.div
                    key={c.id}
                    animate={{ y: [0, -7, 0], rotate: [0, 3, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: contests.indexOf(c) * 0.3 }}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] text-xl"
                    style={{ background: `${meta.color}14`, boxShadow: `inset 0 0 16px ${meta.color}22` }}
                  >
                    {meta.icon}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* --------------------------------------------------- Filters row */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {typeTabs.map((tab) => {
          const active = typeFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTypeFilter(tab.key)}
              className={`relative rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition-colors ${
                active
                  ? "border-[var(--color-cyan)]/60 text-[var(--color-cyan)]"
                  : "border-white/[0.08] text-[var(--color-mute)] hover:text-white"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="contest-tab"
                  className="absolute inset-0 -z-10 rounded-full bg-[var(--color-cyan)]/10"
                  transition={spring}
                />
              )}
              {tab.icon} {tab.label}
              <span className="ml-1.5 font-mono text-[10px] opacity-70">{tab.count}</span>
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search entries…"
              className="w-40 rounded-full border border-white/[0.08] bg-black/25 py-1.5 pl-8 pr-3 text-[11px] outline-none transition-colors placeholder:text-[var(--color-mute)] focus:border-[var(--color-cyan)]/50 sm:w-52"
            />
            <svg className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-mute)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
            </svg>
          </div>
          <div className="flex rounded-full border border-white/[0.08] p-0.5">
            {(["top", "new"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSort(mode)}
                className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  sort === mode ? "bg-white/10 text-white" : "text-[var(--color-mute)] hover:text-white"
                }`}
              >
                {mode === "top" ? "Top" : "New"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------- Content */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4 overflow-hidden rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300"
            >
              {error}
            </motion.p>
          )}

          {loading ? (
            <div className="space-y-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 p-5">
                  <div className="flex items-center gap-3">
                    <div className="shimmer h-12 w-12 rounded-2xl" />
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
          ) : visible.length === 0 ? (
            <div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 px-6 py-14 text-center">
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, -5, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mb-3 text-5xl"
              >
                {query || typeFilter !== "ALL" ? "🔍" : "🕰️"}
              </motion.div>
              <p className="font-display text-lg">
                {query || typeFilter !== "ALL" ? "No entries match that filter" : "This week's battles are being prepared"}
              </p>
              <p className="mt-1 text-xs text-[var(--color-mute)]">
                {query || typeFilter !== "ALL"
                  ? "Try a different type or clear the search."
                  : "New battles open every Monday at midnight. Meanwhile, browse the archive of past champions."}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {(query || typeFilter !== "ALL") && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setTypeFilter("ALL");
                    }}
                    className="rounded-xl border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-4 py-2 text-[11px] font-bold text-[var(--color-cyan)]"
                  >
                    Clear filters
                  </button>
                )}
                <Link href="/contests/hall-of-fame" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold text-white/80 hover:text-[var(--color-cyan)]">
                  🏛️ Hall of Fame
                </Link>
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {visible.map((c, idx) => {
                const meta = contestTypeMeta(c.type);
                const share = c.entries.length > 0
                  ? c.entries[0].upvotes / Math.max(1, c.totalVotes ?? c.entries.reduce((s, e) => s + e.upvotes, 0))
                  : 0;

                return (
                  <motion.section
                    key={c.id}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(0.06 * idx, 0.3), ...spring }}
                    className="group meme-card-border relative mb-6 overflow-hidden rounded-3xl bg-[#15121d]/90 backdrop-blur-sm"
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
                        <h2 className="font-display text-lg font-bold sm:text-xl">
                          <Link href={`/contests/${c.id}`} className="transition-colors hover:text-[var(--color-cyan)]">
                            {c.title}
                          </Link>
                        </h2>
                        <p className="truncate text-xs text-[var(--color-mute)]">{c.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {c.entries.length > 1 && (
                          <div className="hidden sm:block">
                            <ProgressRing
                              pct={share}
                              color={meta.color}
                              caption="Share of votes held by the current leader"
                            />
                          </div>
                        )}
                        <div className="flex flex-col items-end gap-1.5">
                          <ContestCountdown target={c.weekEnd} color={meta.color} compact />
                          <span className="rounded-full border px-3 py-1 text-[10px] font-mono" style={{ background: `${meta.color}12`, borderColor: `${meta.color}44`, color: meta.color }}>
                            +{c.rewardXp} XP · 50 🪙
                          </span>
                          <span className="rounded-full border border-white/[0.08] bg-black/25 px-3 py-1 text-[10px] font-mono text-[var(--color-mute)]">
                            {c.entries.length} {c.entries.length === 1 ? "entry" : "entries"} · {c.totalVotes ?? 0} votes
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Finished week -> champion banner */}
                    {c.status && c.status !== "ACTIVE" && (
                      <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] bg-gradient-to-r from-[#ffd700]/10 to-transparent px-4 py-3 sm:px-6">
                        <span className="text-xl">👑</span>
                        <p className="text-xs text-white/85">
                          Week closed — champion:{" "}
                          <span className="font-bold text-[#ffd700]">@{c.winner?.username ?? c.entries[0]?.user.username ?? "—"}</span>
                        </p>
                        <Link href="/contests/hall-of-fame" className="ml-auto text-[11px] font-bold text-[var(--color-cyan)] hover:underline">
                          See the archive →
                        </Link>
                      </div>
                    )}

                    {/* Entries */}
                    {c.entries.length === 0 ? (
                      <div className="px-4 py-10 text-center sm:px-6">
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="mb-2 text-4xl"
                        >
                          🫥
                        </motion.div>
                        <p className="text-sm text-[var(--color-mute)]">
                          No entries yet — <span className="text-[var(--color-cyan)]">be the first</span> and set the pace.
                        </p>
                        {!c.hasSubmitted && (
                          <Link
                            href={`/contests/submit?contestId=${c.id}`}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-violet)] px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-black"
                          >
                            🚀 Submit the first entry
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:p-5 lg:grid-cols-4">
                        <AnimatePresence initial={false}>
                          {c.entries.map((e, entryIdx) => (
                            <ContestEntryCard
                              key={e.id}
                              entry={e}
                              color={meta.color}
                              isVoted={c.votedEntryId === e.id}
                              hasVoted={Boolean(c.hasVoted)}
                              isAuthed={isAuthed}
                              busy={voteBusy !== null}
                              pulsing={pulse === e.id}
                              burstKey={burst && burst.entryId === e.id ? burst.key : null}
                              showRanks={sort === "top"}
                              onVote={() => void vote(c.id, e.id)}
                              onOpen={() => setLightbox({ contestId: c.id, index: entryIdx })}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Footer CTA */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] bg-[#0a0910]/60 px-4 py-3 sm:px-6">
                      <Link
                        href={`/contests/${c.id}`}
                        className="text-[11px] font-bold text-[var(--color-mute)] transition-colors hover:text-[var(--color-cyan)]"
                      >
                        Open battle page →
                      </Link>
                      {c.hasSubmitted ? (
                        <p className="text-[11px] text-[var(--color-mute)]">✅ You already entered this battle. Good luck!</p>
                      ) : (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Link
                            href={`/contests/submit?contestId=${c.id}`}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-violet)] px-5 py-2 text-[11px] font-black uppercase tracking-wider text-black transition-all hover:shadow-[0_0_22px_rgba(0,255,224,0.35)]"
                          >
                            🚀 Submit an entry
                          </Link>
                        </motion.div>
                      )}
                    </div>
                  </motion.section>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* ----------------------------------------------------- Sidebar */}
        <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <ContestActivityRail />

          <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 backdrop-blur-sm">
            <div className="border-b border-white/[0.06] bg-[#0a0910]/70 px-4 py-3">
              <p className="console-label text-[10px]">🎁 Weekly prizes</p>
            </div>
            <ul className="divide-y divide-white/[0.05]">
              {CONTEST_PRIZES.map((p) => (
                <li key={p.label} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-base" aria-hidden>{p.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-white/85">{p.label}</p>
                    <p className="truncate text-[10px] text-[var(--color-mute)]">{p.value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-black/25 px-4 py-4">
            <p className="console-label mb-2 text-[10px]">🧭 How voting works</p>
            <ol className="space-y-2 text-[11px] text-[var(--color-mute)]">
              <li><span className="font-bold text-white/85">1.</span> Submit one entry per battle before Monday.</li>
              <li><span className="text-[10px] text-[var(--color-cyan)]">2.</span> Vote once in each battle — never for your own entry.</li>
              <li><span className="text-[10px] text-[var(--color-cyan)]">3.</span> Most votes when the clock hits zero takes the badge.</li>
            </ol>
            <Link href="/contests/rules" className="mt-3 inline-block text-[11px] font-bold text-[var(--color-cyan)] hover:underline">
              Read the full rules →
            </Link>
          </div>
        </aside>
      </div>

      {/* ------------------------------------------------------- Lightbox */}
      <AnimatePresence>
        {lightbox && (() => {
          const contest = visible.find((c) => c.id === lightbox.contestId);
          if (!contest) return null;
          return (
            <ContestEntryLightbox
              key="lightbox"
              contest={contest}
              index={Math.min(lightbox.index, Math.max(0, contest.entries.length - 1))}
              onClose={() => setLightbox(null)}
              onNavigate={(next) => setLightbox({ contestId: contest.id, index: next })}
              onVote={(entryId) => void vote(contest.id, entryId)}
              voteBusy={Boolean(voteBusy)}
              isAuthed={isAuthed}
            />
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

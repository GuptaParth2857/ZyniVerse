"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import ContestCountdown from "@/components/ContestCountdown";
import ContestEntryCard from "@/components/ContestEntryCard";
import ContestEntryLightbox from "@/components/ContestEntryLightbox";
import {
  BADGE_LABEL,
  CONTEST_PRIZES,
  CONTEST_RULES,
  contestTypeMeta,
  rankBadge,
  type ContestDTO,
} from "@/lib/contest-meta";

const spring = { type: "spring", stiffness: 340, damping: 30, mass: 0.9 } as const;
const MEDAL_STYLE: Record<number, { ring: string; bg: string; icon: string }> = {
  1: { ring: "rgba(255,215,0,0.75)", bg: "linear-gradient(180deg, rgba(255,215,0,0.22), rgba(0,0,0,0.4))", icon: "🥇" },
  2: { ring: "rgba(203,213,225,0.7)", bg: "linear-gradient(180deg, rgba(203,213,225,0.16), rgba(0,0,0,0.4))", icon: "🥈" },
  3: { ring: "rgba(217,119,6,0.7)", bg: "linear-gradient(180deg, rgba(217,119,6,0.18), rgba(0,0,0,0.4))", icon: "🥉" },
};

function weekLabel(weekStart: string, weekEnd: string) {
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(new Date(weekStart))} – ${fmt(new Date(weekEnd))}`;
}

export default function ContestDetailClient({
  id,
  initialEntryId,
}: {
  id: string;
  initialEntryId: string | null;
}) {
  const { status } = useSession();
  const [contest, setContest] = useState<ContestDTO | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voteBusy, setVoteBusy] = useState(false);
  const [error, setError] = useState("");
  const [pulse, setPulse] = useState<string | null>(null);
  const [burst, setBurst] = useState<{ key: number; entryId: string } | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [sort, setSort] = useState<"top" | "new">("top");

  const load = useCallback(() => {
    void fetch(`/api/contests/${id}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          setNotFound(true);
          return;
        }
        setContest(data.contest);
        if (initialEntryId && data.contest?.entries?.length) {
          const idx = data.contest.entries.findIndex((e: { id: string }) => e.id === initialEntryId);
          setLightbox(idx >= 0 ? idx : null);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, initialEntryId]);

  useEffect(() => {
    load();
  }, [load]);

  const vote = useCallback(
    async (entryId: string) => {
      setVoteBusy(true);
      try {
        const res = await fetch("/api/contests/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entryId }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 409) {
            setContest((c) =>
              c ? { ...c, hasVoted: true, votedEntryId: data.votedEntryId ?? c.votedEntryId } : c,
            );
          }
          setError(data.error || "Couldn't vote.");
          return;
        }
        setContest((c) =>
          c
            ? {
                ...c,
                hasVoted: true,
                votedEntryId: entryId,
                totalVotes: (c.totalVotes ?? 0) + 1,
                entries: c.entries.map((e) => (e.id === entryId ? { ...e, upvotes: data.upvotes } : e)),
              }
            : c,
        );
        setError("");
        setPulse(entryId);
        setBurst({ key: Date.now(), entryId });
        window.setTimeout(() => setPulse(null), 700);
        window.setTimeout(() => setBurst(null), 1500);
      } catch {
        setError("Couldn't vote.");
      }
      setVoteBusy(false);
    },
    [],
  );

  const isAuthed = status === "authenticated";

  const sortedEntries = useMemo(() => {
    if (!contest) return [];
    return [...contest.entries]
      .sort((a, b) =>
        sort === "top"
          ? b.upvotes - a.upvotes
          : new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
      )
      .map((e, i) => ({ ...e, rank: i + 1 }));
  }, [contest, sort]);

  const lightboxContest: ContestDTO | null = contest
    ? { ...contest, entries: sortedEntries }
    : null;

  const meta = contestTypeMeta(contest?.type);
  const ended = contest?.status ? contest.status !== "ACTIVE" : false;
  const podium = sortedEntries.slice(0, 3);
  const voteShare = useMemo(() => {
    if (!contest || contest.entries.length === 0) return 0;
    const total = contest.entries.reduce((s, e) => s + e.upvotes, 0);
    return total > 0 ? (contest.entries[0].upvotes / total) * 100 : 0;
  }, [contest]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="shimmer h-44 w-full rounded-3xl" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shimmer aspect-[4/5] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !contest) {
    return (
      <div className="rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 px-6 py-16 text-center">
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="mb-3 text-5xl">
          🕳️
        </motion.div>
        <p className="font-display text-xl">Battle not found</p>
        <p className="mt-2 text-sm text-[var(--color-mute)]">
          This contest may have been archived or the link is wrong.
        </p>
        <div className="mt-5 flex items-center justify-center gap-2">
          <Link
            href="/contests"
            className="rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-violet)] px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-black"
          >
            ← All battles
          </Link>
          <Link
            href="/contests/hall-of-fame"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-[11px] font-bold text-white/80 hover:text-[var(--color-cyan)]"
          >
            🏛️ Hall of Fame
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* --------------------------------------------------------- Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="meme-card-border relative overflow-hidden rounded-3xl bg-[#15121d]/90 px-6 py-7 backdrop-blur-sm sm:px-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background: `radial-gradient(60% 80% at 12% 0%, ${meta.color}22, transparent 65%), radial-gradient(50% 60% at 95% 10%, rgba(112,0,255,0.18), transparent 60%)`,
          }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span
                className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                style={{ borderColor: `${meta.color}55`, background: `${meta.color}12`, color: meta.color }}
              >
                {meta.icon} {meta.label}
              </span>
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-mono text-[var(--color-mute)]">
                📅 {weekLabel(contest.weekStart, contest.weekEnd)}
              </span>
            </div>
            <h1 className="neon-text-gradient mt-3 font-display text-3xl font-black tracking-tight sm:text-4xl">
              {contest.title}
            </h1>
            <p className="mt-2 text-sm text-[var(--color-mute)]">{contest.description || meta.blurb}</p>

            {ended ? (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-[#ffd700]/40 bg-[#ffd700]/10 px-4 py-3">
                <span className="text-2xl">👑</span>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-[#ffd700]/80">Week closed</p>
                  <p className="text-sm font-bold text-white">
                    Champion: @{contest.winner?.username ?? podium[0]?.user.username ?? "—"}
                  </p>
                </div>
                <Link
                  href="/contests/hall-of-fame"
                  className="ml-auto rounded-xl border border-[#ffd700]/50 bg-black/40 px-3.5 py-2 text-[11px] font-bold text-[#ffd700] hover:bg-black/70"
                >
                  Archive →
                </Link>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <ContestCountdown target={contest.weekEnd} color={meta.color} compact label="Voting closes" />
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 font-mono text-[10px] text-[var(--color-mute)]">
                  {contest.entryCount ?? contest.entries.length} entries · {contest.totalVotes ?? 0} votes
                </span>
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 font-mono text-[10px] text-[var(--color-mute)]">
                  Leader holds {Math.round(voteShare)}% of votes
                </span>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {contest.hasSubmitted ? (
                <span className="rounded-xl border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-5 py-2.5 text-[11px] font-bold text-[var(--color-cyan)]">
                  ✅ Your entry is in — good luck!
                </span>
              ) : (
                <Link
                  href={`/contests/submit?contestId=${contest.id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-violet)] px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-black transition-all hover:shadow-[0_0_22px_rgba(0,255,224,0.35)]"
                >
                  🚀 Enter this battle
                </Link>
              )}
              {contest.rewardBadge && (
                <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[11px] text-white/75">
                  🎖️ Wins <span className="font-bold text-white">{BADGE_LABEL[contest.rewardBadge] ?? contest.rewardBadge}</span>
                </span>
              )}
              <Link href="/contests/rules" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[11px] font-bold text-white/75 hover:text-[var(--color-cyan)]">
                📜 Rules
              </Link>
            </div>
          </div>

          <div className="hidden shrink-0 lg:block">
            {ended ? (
              <div className="rounded-2xl border border-[#ffd700]/40 bg-black/40 p-4 text-center">
                <p className="text-4xl">🏆</p>
                <p className="mt-1 font-mono text-xs text-[#ffd700]">FINAL</p>
              </div>
            ) : (
              <ContestCountdown target={contest.weekEnd} color={meta.color} />
            )}
          </div>
        </div>
      </motion.section>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300"
        >
          {error}
        </motion.p>
      )}

      {/* ------------------------------------------------------- Podium */}
      {podium.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {podium.map((entry, i) => {
            const style = MEDAL_STYLE[entry.rank ?? i + 1];
            return (
              <motion.button
                key={entry.id}
                type="button"
                onClick={() => setLightbox(sortedEntries.findIndex((e) => e.id === entry.id))}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.1, ...spring }}
                whileHover={{ y: -6 }}
                className={`relative overflow-hidden rounded-2xl border bg-black/30 p-4 text-left transition-transform ${
                  entry.rank === 1 ? "sm:-translate-y-2 sm:pb-6" : ""
                }`}
                style={{ boxShadow: `0 0 0 1px ${style.ring}`, background: style.bg }}
              >
                <span className="pointer-events-none absolute inset-x-8 top-0 h-px meme-hairline" />
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{style.icon}</span>
                  <span className="font-mono text-lg font-black tabular-nums" style={{ color: style.ring }}>
                    {entry.upvotes}
                    <span className="ml-1 text-[9px] uppercase tracking-wider text-[var(--color-mute)]">votes</span>
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs font-semibold text-white">{entry.title}</p>
                <p className="mt-1 text-[10px] text-[var(--color-mute)]">@{entry.user.username}</p>
                <p className="mt-2 text-[9px] uppercase tracking-widest text-[var(--color-mute)]">
                  {rankBadge(entry.rank ?? i + 1).label} · tap to view
                </p>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------- Entries */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">
          All entries <span className="ml-1 font-mono text-xs text-[var(--color-mute)]">{sortedEntries.length}</span>
        </h2>
        <div className="flex rounded-full border border-white/[0.08] p-0.5">
          {(["top", "new"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSort(mode)}
              className={`rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                sort === mode ? "bg-white/10 text-white" : "text-[var(--color-mute)] hover:text-white"
              }`}
            >
              {mode === "top" ? "Top voted" : "Newest"}
            </button>
          ))}
        </div>
      </div>

      {sortedEntries.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.07] bg-black/25 px-6 py-14 text-center">
          <p className="text-4xl">🫥</p>
          <p className="mt-3 text-sm text-[var(--color-mute)]">
            No entries yet — <Link href={`/contests/submit?contestId=${contest.id}`} className="font-bold text-[var(--color-cyan)] hover:underline">be the first</Link>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence initial={false}>
            {sortedEntries.map((e, idx) => (
              <ContestEntryCard
                key={e.id}
                entry={e}
                color={meta.color}
                isVoted={contest.votedEntryId === e.id}
                hasVoted={Boolean(contest.hasVoted)}
                isAuthed={isAuthed}
                busy={voteBusy}
                pulsing={pulse === e.id}
                burstKey={burst && burst.entryId === e.id ? burst.key : null}
                onVote={() => void vote(e.id)}
                onOpen={() => setLightbox(idx)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ------------------------------------------------- Rules + prizes */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 backdrop-blur-sm">
          <div className="border-b border-white/[0.06] bg-[#0a0910]/70 px-5 py-3">
            <p className="console-label text-[10px]">📜 How this battle works</p>
          </div>
          <ul className="divide-y divide-white/[0.05]">
            {CONTEST_RULES.map((rule, i) => (
              <motion.li
                key={rule.title}
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                className="flex items-start gap-3 px-5 py-3.5"
              >
                <span className="mt-0.5 text-lg" aria-hidden>{rule.icon}</span>
                <div>
                  <p className="text-xs font-bold text-white/90">{rule.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--color-mute)]">{rule.body}</p>
                </div>
              </motion.li>
            ))}
          </ul>
          <div className="px-5 py-4">
            <Link href="/contests/rules" className="text-[11px] font-bold text-[var(--color-cyan)] hover:underline">
              Read the full rules →
            </Link>
          </div>
        </div>

        <div className="space-y-5">
          <div className="overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-panel)]/60 backdrop-blur-sm">
            <div className="border-b border-white/[0.06] bg-[#0a0910]/70 px-5 py-3">
              <p className="console-label text-[10px]">🎁 What the winner gets</p>
            </div>
            <ul className="divide-y divide-white/[0.05]">
              {CONTEST_PRIZES.map((p) => (
                <li key={p.label} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-base" aria-hidden>{p.icon}</span>
                  <div>
                    <p className="text-[11px] font-bold text-white/85">{p.label}</p>
                    <p className="text-[10px] text-[var(--color-mute)]">{p.value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/[0.06] px-5 py-4">
            <p className="console-label mb-2 text-[10px]">💬 Share this battle</p>
            <p className="text-[11px] leading-relaxed text-[var(--color-mute)]">
              Votes decide the winner. The more votes an entry has, the higher it climbs — share this page to rally your crew.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Vote in the ${contest.title} on ZyniVerse!`)}&url=${encodeURIComponent(typeof window === "undefined" ? "" : window.location.href)}`, "_blank", "width=600,height=400")}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold text-white/80 hover:text-white"
              >
                𝕏 Share
              </button>
              <button
                type="button"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Vote in the ${contest.title} on ZyniVerse! ${typeof window === "undefined" ? "" : window.location.href}`)}`, "_blank", "noopener,noreferrer")}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold text-white/80 hover:text-[#25D366]"
              >
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------ Lightbox */}
      <AnimatePresence>
        {lightbox !== null && lightboxContest && (
          <ContestEntryLightbox
            key="detail-lightbox"
            contest={lightboxContest}
            index={Math.min(lightbox, Math.max(0, lightboxContest.entries.length - 1))}
            onClose={() => setLightbox(null)}
            onNavigate={setLightbox}
            onVote={(entryId) => void vote(entryId)}
            voteBusy={voteBusy}
            isAuthed={isAuthed}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

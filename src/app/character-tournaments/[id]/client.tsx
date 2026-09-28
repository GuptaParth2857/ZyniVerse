"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
const CARD_EASE = [0.22, 1, 0.36, 1] as const;
const MATCHES_PER_MATCHUP = 4;

const TICKER_ITEMS = [
  { label: "Qualifying Open", emoji: "⚡", color: "#f87171" },
  { label: "1v1 Battles", emoji: "⚔️", color: "#facc15" },
  { label: "Auto Cron", emoji: "🕛", color: "#f472b6" },
  { label: "Top 16", emoji: "🎯", color: "#a78bfa" },
  { label: "Community", emoji: "🤝", color: "#22d3ee" },
  { label: "Champion", emoji: "👑", color: "#34d399" },
  { label: "Dream 16", emoji: "🌟", color: "#60a5fa" },
  { label: "Fan Vote", emoji: "🗳️", color: "#fb923c" },
];

export type Status = "qualifying" | "upcoming" | "active" | "completed" | "cancelled";

export interface Participant {
  id: string;
  charId: number;
  charName: string;
  charImage: string | null;
  franchiseCover: string | null;
  seed: number;
  pollVotes: number;
}

export interface Match {
  id: string;
  tournamentId: string;
  round: number;
  position: number;
  charAId: string | null;
  charBId: string | null;
  winnerId: string | null;
  votesA: number;
  votesB: number;
  charA: Participant | null;
  charB: Participant | null;
  winner: Participant | null;
  _count: { votes: number };
}

export interface RoundGroup {
  label: string;
  matches: Match[];
}

export interface TournamentDetail {
  tournament: {
    id: string;
    title: string;
    description: string | null;
    posterUrl: string | null;
    size: number;
    status: Status;
    currentRound: number;
    totalRounds: number;
    creatorId: string;
    createdAt: string;
    creator: { id: string; username: string; avatar: string | null };
    participants: Participant[];
    mode: "qualifying" | "bracket";
    bracketSize: number;
    qualifyingEndsAt: string | null;
    bracketStartedAt: string | null;
    roundEndsAt: string | null;
  };
  rounds: RoundGroup[];
  matches: Match[];
  totalVotes: number;
  myVotes: Record<string, "A" | "B">;
  myPollVote: string | null;
  isCreator: boolean;
}

const STATUS_BADGE: Record<Status, { label: string; className: string }> = {
  qualifying: {
    label: "Qualifying",
    className: "bg-[var(--color-cyan)]/15 border-cyan-400/40 text-cyan-300",
  },
  upcoming: {
    label: "Upcoming",
    className: "bg-[var(--color-violet)]/15 border-[var(--color-violet)]/40 text-[var(--color-violet)]",
  },
  active: {
    label: "Active",
    className: "bg-[var(--color-magenta)]/15 border-[var(--color-magenta)]/40 text-[var(--color-magenta)]",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-white/5 border-white/10 text-[var(--color-mute)]",
  },
};

function useCountUp(target: number, duration = 900) {
  const [text, setText] = useState("0");
  useEffect(() => {
    const startT = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - startT) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setText(Math.round(target * eased).toLocaleString());
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return text;
}

export default function TournamentDetailPage({
  initial = null,
  serverResolved = false,
}: {
  initial?: TournamentDetail | null;
  serverResolved?: boolean;
}) {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: session, status } = useSession();
  const [data, setData] = useState<TournamentDetail | null>(initial);
  const [loading, setLoading] = useState(!serverResolved);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(serverResolved && initial === null);
  const [busy, setBusy] = useState(false);
  const [votingPoll, setVotingPoll] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [votingMatch, setVotingMatch] = useState<string | null>(null);

  const deviceIdRef = useRef<string | null>(null);
  const getDeviceId = useCallback(() => {
    if (deviceIdRef.current) return deviceIdRef.current;
    let id: string | null = null;
    try {
      id = window.localStorage.getItem("zt-ct-device");
    } catch {
      id = null;
    }
    if (!id || !/^[a-zA-Z0-9_-]{8,64}$/.test(id)) {
      const gen = (window.crypto?.randomUUID?.() ?? `zt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`)
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .slice(0, 48);
      try {
        window.localStorage.setItem("zt-ct-device", gen);
        id = gen;
      } catch {
        id = gen;
      }
    }
    deviceIdRef.current = id;
    return id;
  }, []);

  // Sent on every read and write so both signed-in and guest voters keep their
  // own "Voted" state, and so voting never requires a login.
  const voteHeaders = useCallback(
    () => ({ "Content-Type": "application/json", "X-Device-Id": getDeviceId() }),
    [getDeviceId]
  );

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    const deviceId = getDeviceId();
    fetch(`/api/character-tournaments/${id}`, {
      headers: deviceId ? { "X-Device-Id": deviceId } : undefined,
    })
      .then(async (r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load tournament");
        setLoading(false);
      });
  }, [id, getDeviceId]);

  useEffect(() => {
    if (serverResolved && data?.tournament?.id === id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load, serverResolved, data?.tournament?.id, id]);

  useEffect(() => {
    if (status !== "unauthenticated" || !serverResolved || data?.tournament?.id !== id) return;
    const deviceId = getDeviceId();
    if (!deviceId) return;
    fetch(`/api/character-tournaments/${id}/poll-vote`, {
      headers: { "X-Device-Id": deviceId },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((st) => {
        if (typeof st?.myPollVote === "string") {
          setData((prev) =>
            prev && prev.myPollVote !== st.myPollVote ? { ...prev, myPollVote: st.myPollVote } : prev
          );
        }
      })
      .catch(() => {});
  }, [status, serverResolved, data?.tournament?.id, id, getDeviceId]);

  const statusBadge = data ? STATUS_BADGE[data.tournament.status] : null;
  const canStart = !!data?.isCreator && data.tournament.status === "upcoming";
  const canFinalize = !!data?.isCreator && data.tournament.status === "active";
  const canFinalizeQualifying = !!data?.isCreator && data.tournament.status === "qualifying";

  const handleAction = async (action: "start" | "finalize" | "finalize-qualifying") => {
    setBusy(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/character-tournaments/${id}/${action}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Action failed");
        setBusy(false);
        return;
      }
      setActionError(null);
      load();
    } catch {
      setActionError("Action failed");
      setBusy(false);
    }
  };

  const handleVote = async (matchId: string, choice: "A" | "B") => {
    if (votingMatch) return;
    if (data?.myVotes[matchId]) return;
    setVotingMatch(matchId);
    setActionError(null);
    try {
      const res = await fetch(`/api/character-tournaments/${id}/matches/${matchId}/vote`, {
        method: "POST",
        headers: voteHeaders(),
        body: JSON.stringify({ choice }),
      });
      const result = await res.json();
      if (!res.ok) {
        setActionError(result.error || "Failed to vote");
        setVotingMatch(null);
        return;
      }
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          myVotes: { ...prev.myVotes, [matchId]: choice },
          totalVotes: prev.totalVotes + 1,
          rounds: prev.rounds.map((round) => ({
            ...round,
            matches: round.matches.map((m) =>
              m.id === matchId
                ? { ...m, votesA: result.votesA, votesB: result.votesB, _count: { votes: result.votesA + result.votesB } }
                : m
            ),
          })),
        };
      });
      setVotingMatch(null);
    } catch {
      setActionError("Failed to vote");
      setVotingMatch(null);
    }
  };

  const handlePollVote = async (participantId: string) => {
    const deviceId = getDeviceId();
    if ((!session?.user?.id && !deviceId) || votingPoll || data?.myPollVote) return;
    setVotingPoll(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/character-tournaments/${id}/poll-vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(deviceId ? { "X-Device-Id": deviceId } : {}),
        },
        body: JSON.stringify({ participantId }),
      });
      const result = await res.json();
      if (!res.ok) {
        setActionError(result.error || "Failed to vote");
        setVotingPoll(false);
        return;
      }
      setData((prev) => {
        if (!prev) return prev;
        const updated = result?.participant;
        const participants = [...prev.tournament.participants]
          .map((p) => (updated && p.id === updated.id && typeof updated.pollVotes === "number"
            ? { ...p, pollVotes: updated.pollVotes }
            : p))
          .sort((a, b) => b.pollVotes - a.pollVotes);
        return {
          ...prev,
          tournament: { ...prev.tournament, participants },
          myPollVote: participantId,
          totalVotes: (prev.totalVotes ?? 0) + 1,
        };
      });
    } catch {
      setActionError("Failed to vote");
    }
    setVotingPoll(false);
  };

  const champion = useMemo(() => {
    if (!data || data.tournament.status !== "completed") return null;
    const finalMatch = data.rounds[data.rounds.length - 1]?.matches?.[0];
    return finalMatch?.winner ?? null;
  }, [data]);

  if (notFound) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="text-3xl">🏳️</p>
          <h1 className="mt-4 font-display text-2xl font-bold text-[var(--color-ink)]">Tournament Not Found</h1>
          <Link href="/character-tournaments" className="mt-6 inline-block rounded-lg bg-[var(--color-magenta)]/20 px-4 py-2 text-sm font-bold text-[var(--color-magenta)] hover:bg-[var(--color-magenta)] hover:text-black transition-colors">
            Back to Tournaments
          </Link>
        </div>
      </PageTransition>
    );
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="mx-auto mb-10 h-10 w-64 rounded bg-[var(--color-panel)] animate-pulse" />
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-56 shrink-0 space-y-3">
                <div className="h-6 w-24 rounded bg-[var(--color-panel)] animate-pulse" />
                <div className="h-48 rounded-2xl bg-[var(--color-panel)] animate-pulse" />
                <div className="h-48 rounded-2xl bg-[var(--color-panel)] animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error || !data) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="text-[var(--color-mute)]">{error || "Tournament unavailable"}</p>
          <button onClick={load} className="mt-4 rounded-lg bg-[var(--color-magenta)]/20 px-4 py-2 text-sm font-bold text-[var(--color-magenta)] hover:bg-[var(--color-magenta)] hover:text-black transition-colors">
            Retry
          </button>
        </div>
      </PageTransition>
    );
  }

  const { tournament } = data;

  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in"}/character-tournaments/${id}`;
  const shareLine = `⚔️ ${tournament.title} — ${tournament.size}-player anime character tournament by @${tournament.creator.username} on ZyniVerse! Apna fav vote karo.`;

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(`${shareLine}\n\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <PageTransition>
      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 opacity-30 blur-[100px]"
          style={{
            background:
              "radial-gradient(60% 60% at 30% 40%, var(--color-magenta), transparent 70%), radial-gradient(60% 60% at 70% 40%, var(--color-cyan), transparent 70%)",
          }}
        />

        <section className="neon-rgb-border relative mb-8 overflow-hidden rounded-3xl bg-[var(--color-panel)]/60 py-12 text-center backdrop-blur-sm sm:py-16">
          <div className="neon-banner-card pointer-events-none absolute inset-0" />

          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <div aria-hidden className="scanline-sweep" />

          <div aria-hidden className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l-2 border-t-2 border-[var(--color-cyan)]/50" />
          <div aria-hidden className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r-2 border-t-2 border-[var(--color-cyan)]/50" />
          <div aria-hidden className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-[var(--color-magenta)]/50" />
          <div aria-hidden className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-[var(--color-magenta)]/50" />

          <span aria-hidden className="pointer-events-none absolute left-10 top-10 hidden text-3xl opacity-40 float-anim md:block">🥊</span>
          <span aria-hidden className="pointer-events-none absolute right-12 top-14 hidden text-3xl opacity-40 float-anim md:block" style={{ animationDelay: "0.9s" }}>⚔️</span>
          <span aria-hidden className="pointer-events-none absolute bottom-12 left-14 hidden text-2xl opacity-30 float-anim md:block" style={{ animationDelay: "0.45s" }}>👑</span>
          <span aria-hidden className="pointer-events-none absolute bottom-14 right-14 hidden text-2xl opacity-30 float-anim md:block" style={{ animationDelay: "1.3s" }}>🎯</span>

          <div aria-hidden className="pointer-events-none absolute left-[10%] top-1/2 hidden h-28 w-28 -translate-y-1/2 rounded-full bg-[var(--color-cyan)]/25 blur-[55px] float-anim md:block" />
          <div aria-hidden className="pointer-events-none absolute right-[10%] top-1/2 hidden h-28 w-28 -translate-y-1/2 rounded-full bg-[var(--color-magenta)]/25 blur-[55px] float-anim md:block" style={{ animationDelay: "1.5s" }} />

          <div className="relative z-10 mx-auto max-w-3xl px-6">
            <motion.div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
              style={{
                background: "conic-gradient(from 0deg, var(--color-magenta), var(--color-cyan), var(--color-violet), var(--color-magenta))",
                animation: "spin 10s linear infinite",
              }}
            />

            <div className="relative">
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="console-label mb-4 flex animate-hero-text items-center justify-center gap-2"
                style={{ animationDelay: "0.05s" }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-cyan)] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)]" />
                </span>
                {statusBadge?.label ?? "Community"} Tournament
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: CARD_EASE, delay: 0.1 }}
                className="neon-text-gradient animate-hero-text font-display text-3xl font-black tracking-tight sm:text-5xl"
                style={{ filter: "drop-shadow(0 0 28px rgba(138,92,255,0.35))", animationDelay: "0.15s" }}
              >
                {tournament.title}
              </motion.h1>

              <p className="mt-3 text-xs text-[var(--color-mute)]">by @{tournament.creator.username}</p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-void)]/50 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">
                  ⚔️ {tournament.mode === "qualifying" ? `${tournament.size} candidates` : `${tournament.size} players`}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-void)]/50 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-violet)]">
                  🎯{" "}
                  {tournament.mode === "qualifying"
                    ? `Top ${tournament.bracketSize} make the bracket`
                    : `Round ${tournament.currentRound} of ${tournament.totalRounds}`}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-void)]/50 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-magenta)]">
                  🗳️ {data.totalVotes.toLocaleString()} votes
                </span>
              </div>

              {tournament.posterUrl && (
                <div className="mx-auto mt-6 max-w-sm overflow-hidden rounded-2xl neon-rgb-border">
                  <Image
                    src={tournament.posterUrl}
                    alt={tournament.title}
                    width={384}
                    height={560}
                    className="h-auto w-full object-cover"
                  />
                </div>
              )}

              {tournament.description && (
                <p className="mx-auto mt-4 max-w-xl text-sm text-[var(--color-mute)]">{tournament.description}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${shareLine}\n\n${shareUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#25d366]/15 border border-[#25d366]/40 px-4 py-1.5 text-xs font-bold text-[#25d366] hover:bg-[#25d366]/25 transition-colors"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareLine)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 px-4 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-400/15 transition-colors"
                >
                  𝕏 / X
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareLine)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/40 px-4 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-400/15 transition-colors"
                >
                  Telegram
                </a>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      void navigator.share({ title: tournament.title, text: shareLine, url: shareUrl }).catch(() => {});
                    } else {
                      void copyShare();
                    }
                  }}
                  className="rounded-full border border-[var(--color-line)] px-4 py-1.5 text-xs font-semibold text-[var(--color-mute)] hover:border-[var(--color-magenta)] hover:text-[var(--color-magenta)] transition-colors"
                >
                  Share
                </button>
                <button
                  onClick={() => void copyShare()}
                  className="rounded-full border border-[var(--color-line)] px-4 py-1.5 text-xs font-semibold text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] transition-colors"
                >
                  {copied ? "Copied ✓" : "Copy link"}
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {canStart && (
                  <button
                    onClick={() => handleAction("start")}
                    disabled={busy}
                    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-8px_var(--color-magenta)] disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ background: "linear-gradient(90deg, var(--color-magenta), var(--color-violet))" }}
                  >
                    <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <span className="relative">{busy ? "Starting…" : "Start Tournament"}</span>
                  </button>
                )}
                {canFinalize && (
                  <button
                    onClick={() => handleAction("finalize")}
                    disabled={busy}
                    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-8px_var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ background: "linear-gradient(90deg, var(--color-cyan), var(--color-violet))" }}
                  >
                    <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <span className="relative">
                      {busy
                        ? "Advancing…"
                        : tournament.currentRound === tournament.totalRounds
                        ? "Finalize & Crown Champion"
                        : "Finalize Round & Advance"}
                    </span>
                  </button>
                )}
                {canFinalizeQualifying && (
                  <button
                    onClick={() => handleAction("finalize-qualifying")}
                    disabled={busy}
                    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-8px_var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ background: "linear-gradient(90deg, var(--color-cyan), var(--color-violet))" }}
                  >
                    <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <span className="relative">{busy ? "Building bracket…" : "Finalize Qualifying & Build Bracket"}</span>
                  </button>
                )}
              </div>

              {actionError && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-auto mt-3 max-w-md rounded-lg border border-[var(--color-magenta)]/30 bg-[var(--color-magenta)]/10 px-3 py-2 text-xs font-semibold text-[var(--color-magenta)]"
                >
                  {actionError}
                </motion.p>
              )}
            </div>
          </div>

          <div aria-hidden className="ticker-window relative z-10 mt-8 border-t border-[var(--color-line)] bg-[var(--color-void)]/40 py-3">
            <div className="ticker-track flex w-max items-center gap-10 whitespace-nowrap px-8">
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
                <span key={i} className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em]">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.color, boxShadow: `0 0 8px ${t.color}` }} />
                  <span className="text-base leading-none" style={{ textShadow: `0 0 10px ${t.color}aa` }}>{t.emoji}</span>
                  <span className="text-[var(--color-mute)]">{t.label}</span>
                  <span className="ml-6 select-none text-[var(--color-magenta)]/40">✦</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {champion && <WinnerCeremony champion={champion} />}

        {tournament.mode === "qualifying" ? (
          <QualifyingRound
            participants={tournament.participants}
            myPollVote={data.myPollVote}
            totalVotes={data.totalVotes}
            qualifyingEndsAt={tournament.qualifyingEndsAt}
            canFinalize={canFinalizeQualifying}
            busy={busy}
            votingPoll={votingPoll}
            onVote={handlePollVote}
            onFinalize={() => handleAction("finalize-qualifying")}
          />
        ) : (
          <BracketLayout
            rounds={data.rounds}
            myVotes={data.myVotes}
            votingMatch={votingMatch}
            status={tournament.status}
            currentRound={tournament.currentRound}
            onVote={handleVote}
          />
        )}

        <div className="mt-10 text-center">
          <Link
            href="/character-tournaments"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-2.5 text-xs font-bold text-[var(--color-ink)] transition-colors hover:border-[var(--color-magenta)]/50 hover:text-[var(--color-magenta)]"
          >
            ← All Tournaments
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}

function useCountdown(target: string | null | undefined) {
  const [left, setLeft] = useState(() => (target ? countdownText(target) : ""));
  const [done, setDone] = useState(false);

  useEffect(() => {
    let iv: ReturnType<typeof setInterval> | undefined;

    const immediate = setTimeout(() => {
      if (!target) {
        setLeft("");
        setDone(false);
        return;
      }
      const tick = () => {
        const diff = new Date(target).getTime() - Date.now();
        if (diff <= 0) {
          setLeft("0d 0h 0m 0s");
          setDone(true);
          return;
        }
        setLeft(countdownText(target));
      };
      tick();
      iv = setInterval(tick, 1000);
    }, 0);

    return () => {
      clearTimeout(immediate);
      if (iv) clearInterval(iv);
    };
  }, [target]);

  return { left, done };
}

function countdownText(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return "0d 0h 0m 0s";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${d}d ${h}h ${m}m ${s}s`;
}

function AnimeTint({ accent }: { accent: string }) {
  return (
    <div
      aria-hidden
      className="tourney-anime-tint pointer-events-none absolute inset-0"
      style={{
        background: `linear-gradient(135deg, ${accent}99, #00ffe099 33%, #ff00e699 66%, #7000ff99)`,
      }}
    />
  );
}

function VotingCountdownValue({ target }: { target: string | null }) {
  const { left } = useCountdown(target);
  return <>{left || "—"}</>;
}

function VotingClosedNote({ target }: { target: string | null }) {
  const { done } = useCountdown(target);
  if (!done) return null;
  return (
    <p className="mb-6 text-center text-xs font-semibold text-emerald-400">
      Qualifying has closed — the final bracket is being prepared from your votes and fan favorites.
    </p>
  );
}

function QualifyingRound({
  participants,
  myPollVote,
  totalVotes,
  qualifyingEndsAt,
  canFinalize,
  busy,
  votingPoll,
  onVote,
  onFinalize,
}: {
  participants: Participant[];
  myPollVote: string | null;
  totalVotes: number;
  qualifyingEndsAt: string | null;
  canFinalize: boolean;
  busy: boolean;
  votingPoll: boolean;
  onVote: (participantId: string) => void;
  onFinalize: () => void;
}) {
  const tiltRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [search, setSearch] = useState("");
  const filteredParticipants = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter((p) => p.charName.toLowerCase().includes(q));
  }, [participants, search]);

  useEffect(() => {
    const root = document.getElementById("participant-grid");
    if (!root || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) (e.target as HTMLElement).setAttribute("data-inview", "1");
        }
      },
      { rootMargin: "300px 0px" }
    );
    for (const card of root.querySelectorAll(".neon-rgb-border:not([data-inview])")) io.observe(card);
    return () => io.disconnect();
  }, [filteredParticipants]);

  const handleTilt = useCallback((i: number, e: React.PointerEvent<HTMLDivElement>) => {
    const el = tiltRefs.current[i];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = (e.clientX - cx) / (rect.width / 2);
    const py = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `perspective(900px) rotateY(${px * 5}deg) rotateX(${-py * 5}deg) scale(1.02)`;
  }, []);

  const handleUntilt = useCallback((i: number) => {
    const el = tiltRefs.current[i];
    if (el) el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)";
  }, []);

  if (participants.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-panel)]/50 p-10 text-center">
        <p className="font-display text-lg font-bold text-[var(--color-ink)]">No candidates yet</p>
        <p className="mt-1 text-xs text-[var(--color-mute)]">Qualifying poll has not been set up.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3 text-sm">
        <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-1.5 font-mono text-xs font-bold text-cyan-300 lg:text-sm">
          ⏳ Voting ends in <VotingCountdownValue target={qualifyingEndsAt} />
        </span>
        <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-1.5 font-mono text-xs text-[var(--color-mute)] lg:text-sm">
          {totalVotes.toLocaleString()} total votes
        </span>
      </div>

      <div className="mx-auto mb-6 w-full max-w-md">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-mute)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search characters to vote…"
            className="w-full rounded-xl border border-[var(--color-line)] bg-[#15121d]/90 py-3 pl-11 pr-10 text-sm font-medium text-[var(--color-ink)] outline-none transition-all placeholder:text-[var(--color-mute)]/70 focus:border-[var(--color-cyan)]/60 focus:bg-[#15121d] focus:shadow-[0_0_24px_-8px_var(--color-cyan)]"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--color-mute)] transition-colors hover:text-[var(--color-ink)]"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-widest text-[var(--color-mute)]/50">
              {participants.length}
            </span>
          )}
        </div>
      </div>

      {canFinalize && (
        <div className="mb-6 text-center">
          <button
            onClick={onFinalize}
            disabled={busy}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-8px_var(--color-cyan)] disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: "linear-gradient(90deg, var(--color-cyan), var(--color-violet))" }}
          >
            <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative">{busy ? "Building bracket…" : "Finalize Qualifying & Build Bracket"}</span>
          </button>
        </div>
      )}

      <VotingClosedNote target={qualifyingEndsAt} />

      <div id="participant-grid" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {filteredParticipants.map((p, i) => {
          const voted = myPollVote === p.id;
          const rank = i + 1;
          const accent = rank <= 3 ? "#34d399" : "#22d3ee";
          return (
            <motion.div
              key={p.id}
              ref={(el) => {
                tiltRefs.current[i] = el;
              }}
              initial={{ opacity: 0, y: 26, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.45, delay: Math.min((i % 6) * 0.05, 0.3), ease: CARD_EASE }}
              onPointerMove={(e) => handleTilt(i, e)}
              onPointerLeave={() => handleUntilt(i)}
              className="group relative flex flex-col neon-rgb-border rounded-[24px] bg-[#0d0b14]"
              style={{ transition: "transform 0.2s ease-out" }}
            >

              {/* popular-style pill badge straddling the top edge */}
              <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2">
                {rank <= 3 ? (
                  <span className="block whitespace-nowrap rounded-full bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] px-3.5 py-1 text-[9px] font-bold uppercase tracking-wider text-black shadow-[0_0_20px_-5px_rgba(0,255,224,0.4)]">
                    #{rank}
                  </span>
                ) : (
                  <span className="block whitespace-nowrap rounded-full border border-white/10 bg-[#15121d]/90 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-[var(--color-mute)]">
                    #{rank}
                  </span>
                )}
              </div>

              {/* IMAGE HEADER — anime key-visual backdrop + framed character portrait */}
              <div className="relative z-10 m-3 mt-4 overflow-hidden rounded-[20px] bg-[#0a0910]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {p.franchiseCover || p.charImage ? (
                    <>
                      {/* colorful anime key-visual backdrop */}
                      <Image
                        src={p.franchiseCover || p.charImage!}
                        alt={`${p.charName} franchise key visual`}
                        width={400}
                        height={600}
                        unoptimized={(p.franchiseCover || p.charImage)!.includes("anilist.co")}
                        className="tourney-char-img absolute inset-0 h-full w-full scale-110 object-cover blur-[10px]"
                      />
                      <div className="absolute inset-0 bg-[#0a0910]/55" />
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "radial-gradient(120% 80% at 50% 18%, transparent 0%, rgba(10,9,16,0.55) 62%, rgba(10,9,16,0.92) 100%)",
                        }}
                      />
                      {/* framed character portrait */}
                      <div className="absolute inset-0 flex items-center justify-center pt-2">
                        <div className="relative w-[38%]">
                          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[22px] bg-[#0d0b14] p-px">
                            <div
                              className="absolute inset-0 rounded-[22px]"
                              style={{
                                background:
                                  "conic-gradient(from 210deg, rgba(255,255,255,0.55), rgba(255,255,255,0.04) 35%, rgba(255,255,255,0.3) 55%, rgba(255,255,255,0.06) 75%, rgba(255,255,255,0.45))",
                              }}
                            />
                            <div className="relative h-full w-full overflow-hidden rounded-[21px]">
                              <Image
                                src={p.charImage || p.franchiseCover!}
                                alt={p.charName}
                                width={300}
                                height={420}
                                unoptimized={(p.charImage || p.franchiseCover)!.includes("anilist.co")}
                                className="h-full w-full object-cover"
                              />
                              <div className="award-sheen" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#0a0910] text-4xl">🎴</div>
                  )}
                  <div className="award-sheen" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0910] via-transparent to-transparent" />
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: `radial-gradient(120% 120% at 75% -10%, ${accent}1f, transparent 55%), radial-gradient(120% 120% at 10% 110%, ${accent}0f, transparent 55%)`,
                    }}
                  />
                </div>
              </div>

              {/* BODY — premium plan-card layout */}
              <div className="relative z-10 flex flex-1 flex-col px-5 pb-1 pt-2">
                <div>
                  <h3 className="line-clamp-1 font-display text-lg font-bold text-[var(--color-ink)]">
                    {p.charName}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <motion.span
                      key={p.pollVotes}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 420, damping: 22 }}
                      className="bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] bg-clip-text text-2xl font-bold tabular-nums text-transparent"
                    >
                      {p.pollVotes.toLocaleString()}
                    </motion.span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-mute)]">votes</span>
                  </div>
                </div>
              </div>

              {/* ACTION BAR — premium CTA */}
              <div className="relative z-10 px-5 pb-5 pt-4">
                {voted ? (
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="flex h-11 w-full items-center justify-center gap-1.5 rounded-[16px] border border-emerald-500/40 bg-emerald-500/10 text-xs font-bold text-emerald-300"
                  >
                    <motion.svg
                      initial={{ scale: 0.4 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                    Voted
                  </motion.div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onVote(p.id)}
                    disabled={votingPoll}
                    className="flex h-11 w-full items-center justify-center gap-1.5 rounded-[16px] bg-gradient-to-r from-[#00ffe0] via-[#7000ff] to-[#ff00e6] text-xs font-bold text-white shadow-[0_0_30px_-8px_rgba(0,255,224,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_50px_-6px_rgba(0,255,224,0.5),0_0_80px_-20px_rgba(255,0,230,0.2)] disabled:pointer-events-none disabled:opacity-50"
                  >
                    {votingPoll ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
                        </svg>
                        Vote
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredParticipants.length === 0 && (
        <div className="mt-2 rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-panel)]/50 p-10 text-center">
          <p className="font-display text-lg font-bold text-[var(--color-ink)]">
            No characters match “{search.trim()}”
          </p>
          <p className="mt-1 text-xs text-[var(--color-mute)]">Try a different name.</p>
        </div>
      )}
    </div>
  );
}

function BracketLayout({
  rounds,
  myVotes,
  votingMatch,
  status,
  currentRound,
  onVote,
}: {
  rounds: RoundGroup[];
  myVotes: Record<string, "A" | "B">;
  votingMatch: string | null;
  status: Status;
  currentRound: number;
  onVote: (matchId: string, choice: "A" | "B") => void;
}) {
  // On phones a 4-column horizontal scroll is unusable, so rounds stack
  // vertically with a clear heading per round instead.
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setCompact(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const activeRoundIndex = rounds.findIndex((r) => r.matches.some((m) => m.round === currentRound));

  // Round headers are sticky so the reader always knows which round they are in.
  const roundHeader = (label: string, isCurrent: boolean, count: number, idx: number) => (
    <div className="mb-3 flex items-center gap-2">
      <span className={`h-6 w-1 rounded-full ${isCurrent ? "bg-[var(--color-magenta)]" : "bg-[var(--color-line)]"}`} />
      <h3
        className={`font-display text-sm font-bold ${
          isCurrent ? "text-[var(--color-magenta)]" : "text-[var(--color-ink)]"
        }`}
      >
        {label}
      </h3>
      {count > 0 && (
        <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-mute)]">
          {count} {count === 1 ? "match" : "matches"}
        </span>
      )}
      {isCurrent && (
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="h-1.5 w-1.5 rounded-full bg-[var(--color-magenta)]"
        />
      )}
      {isCurrent && !compact && (
        <span className="ml-auto text-[10px] font-semibold text-[var(--color-magenta)]/80">
          Voting open
        </span>
      )}
      {isCurrent && compact && idx !== activeRoundIndex && null}
    </div>
  );

  const renderRound = (round: RoundGroup, i: number) => {
    const isCurrent = status === "active" && round.matches.some((m) => m.round === currentRound);

    // Rounds beyond the current one have no match rows yet. Rendering them as an
    // empty column with "0 matches" reads as broken, so they get a locked
    // placeholder that still shows the shape of the bracket.
    if (round.matches.length === 0) {
      return (
        <div key={round.label} className={compact ? "mb-8" : "w-60 shrink-0"}>
          {roundHeader(round.label, false, 0, i)}
          <div className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-panel)]/30 px-4 text-center">
            <span className="text-xl opacity-40">🔒</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-mute)]">
              Upcoming
            </span>
            <span className="text-[10px] leading-relaxed text-[var(--color-mute)]/70">
              {round.label === "Final"
                ? "One character left standing."
                : "Winners of this round meet here."}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div key={round.label} className={compact ? "mb-8" : "w-60 shrink-0"}>
        {roundHeader(round.label, isCurrent, round.matches.length, i)}
        <div className={compact ? "space-y-4" : "space-y-3"}>
          {round.matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              voted={myVotes[match.id]}
              voting={votingMatch === match.id}
              active={status === "active" && match.round === currentRound}
              onVote={onVote}
              reveal={status === "active" && !myVotes[match.id] && (match.round ?? 0) === currentRound}
              revealIndex={i * MATCHES_PER_MATCHUP * 2 + (match.position ?? 0)}
            />
          ))}
        </div>
      </div>
    );
  };

  // On a phone the current round comes first so voting is immediately reachable.
  const ordered = compact && activeRoundIndex > 0 ? [rounds[activeRoundIndex], ...rounds.filter((_, i) => i !== activeRoundIndex)] : rounds;

  if (compact) {
    return <div className="space-y-2">{ordered.map(renderRound)}</div>;
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {rounds.map(renderRound)}
    </div>
  );
}

function MatchCard({
  match,
  voted,
  voting,
  active,
  onVote,
  reveal,
  revealIndex,
}: {
  match: Match;
  voted: "A" | "B" | undefined;
  voting: boolean;
  active: boolean;
  onVote: (matchId: string, choice: "A" | "B") => void;
  reveal?: boolean;
  revealIndex?: number;
}) {
  const total = match.votesA + match.votesB;
  const pctA = total > 0 ? Math.round((match.votesA / total) * 100) : 50;
  const pctB = total > 0 ? Math.round((match.votesB / total) * 100) : 50;
  const hasBoth = !!match.charA && !!match.charB;
  const canVote = active && hasBoth && !match.winnerId && !voting;
  const winnerIsA = !!match.winnerId && match.winnerId === match.charAId;
  const winnerIsB = !!match.winnerId && match.winnerId === match.charBId;

  return (
    <motion.div
      initial={reveal ? { opacity: 0, y: 22, rotateY: -90, scale: 0.86 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, rotateY: 0, scale: 1 }}
      transition={{
        duration: 0.55,
        ease: CARD_EASE,
        delay: reveal ? Math.min((revealIndex ?? 0) * 0.09, 0.7) : 0.05,
      }}
      style={{ transformPerspective: 900 }}
      className={`relative overflow-hidden rounded-2xl border bg-[var(--color-panel)] transition-colors ${
        active ? "border-[var(--color-magenta)]/40" : "border-[var(--color-line)]"
      }`}
    >
      {match.winnerId && (
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-emerald-500/40" />
      )}

      <div className="grid grid-cols-[1fr_auto_1fr]">
        <MatchPanel
          participant={match.charA}
          votes={match.votesA}
          pct={pctA}
          isWinner={winnerIsA}
          decided={!!match.winnerId}
          side="A"
          voted={voted === "A"}
          canVote={canVote}
          voting={voting}
          onVote={() => onVote(match.id, "A")}
        />

        <div className="relative flex w-9 flex-col items-center justify-center gap-2 border-x border-[var(--color-line)] bg-[var(--color-void)]/70">
          <span className="font-display text-[11px] font-black tracking-[0.2em] text-[var(--color-magenta)]">
            VS
          </span>
          <span className="font-mono text-[9px] tabular-nums text-[var(--color-mute)]">
            {match.votesA + match.votesB}
          </span>
        </div>

        <MatchPanel
          participant={match.charB}
          votes={match.votesB}
          pct={pctB}
          isWinner={winnerIsB}
          decided={!!match.winnerId}
          side="B"
          voted={voted === "B"}
          canVote={canVote}
          voting={voting}
          onVote={() => onVote(match.id, "B")}
        />
      </div>

      {match.winnerId && (
        <div className="flex items-center justify-center gap-1.5 border-t border-emerald-500/30 bg-emerald-500/10 py-1.5">
          <span className="text-[10px]">👑</span>
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400">
            {winnerIsA ? match.charA?.charName : match.charB?.charName} advances
          </span>
        </div>
      )}
    </motion.div>
  );
}

/**
 * One side of a matchup. The whole panel is the vote target — a far bigger tap
 * area than the old inline 10px button, which was the main thing making the
 * bracket view feel cramped next to the qualifying cards.
 */
function MatchPanel({
  participant,
  votes,
  pct,
  isWinner,
  decided,
  side,
  voted,
  canVote,
  voting,
  onVote,
}: {
  participant: Participant | null;
  votes: number;
  pct: number;
  isWinner?: boolean;
  decided: boolean;
  side: "A" | "B";
  voted?: boolean;
  canVote: boolean;
  voting: boolean;
  onVote: () => void;
}) {
  const votesText = useCountUp(votes);
  const [imgError, setImgError] = useState(false);
  const accent = side === "A" ? "var(--color-magenta)" : "var(--color-cyan)";

  if (!participant) {
    return (
      <div className="flex aspect-[3/4] flex-col items-center justify-center gap-1 bg-[var(--color-void)]/40">
        <span className="text-2xl opacity-40">?</span>
        <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-mute)]">
          To be decided
        </span>
      </div>
    );
  }

  const img = participant.charImage;
  const showImg = img && !imgError;
  const dimmed = decided && !isWinner;

  const inner = (
    <>
      {/* artwork */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--color-void)]">
        {showImg ? (
          <Image
            src={img!}
            alt={participant.charName}
            fill
            unoptimized={img!.includes("anilist.co")}
            onError={() => setImgError(true)}
            className="tourney-char-img object-cover"
            sizes="(max-width: 768px) 45vw, 150px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--color-panel)] text-3xl">
            🎴
          </div>
        )}
        <AnimeTint accent={accent} />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(8,7,14,0.96) 0%, rgba(8,7,14,0.55) 34%, transparent 62%)",
          }}
        />
        {isWinner && (
          <div className="absolute left-2 top-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[9px] font-bold text-black">
            WINNER
          </div>
        )}
        {voted && (
          <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-black">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        )}

        {/* name + tally sit over the artwork */}
        <div className="absolute inset-x-0 bottom-0 p-2.5">
          <Link
            href={`/character/${participant.charId}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="line-clamp-2 font-display text-[13px] font-bold leading-tight text-white transition-colors hover:text-[var(--color-cyan)]"
          >
            {participant.charName}
          </Link>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-sm font-bold tabular-nums text-white">{votesText}</span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-white/60">
              {votes === 1 ? "vote" : "votes"} · {pct}%
            </span>
          </div>
        </div>
      </div>

      {/* share-of-vote bar + vote CTA */}
      <div className="space-y-2 p-2.5">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: isWinner ? "#10b981" : accent }}
          />
        </div>

        {voted ? (
          <div className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 text-[11px] font-bold text-emerald-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Your vote
          </div>
        ) : canVote ? (
          <div
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg text-[11px] font-bold text-black transition-transform"
            style={{
              background: `linear-gradient(90deg, ${accent}, color-mix(in srgb, ${accent} 55%, var(--color-violet)))`,
              boxShadow: `0 6px 20px -8px ${accent}`,
            }}
          >
            {voting ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-black/70 border-t-transparent" />
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
              </svg>
            )}
            {voting ? "" : "Vote"}
          </div>
        ) : (
          <div className="flex h-9 items-center justify-center rounded-lg border border-[var(--color-line)] text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mute)]">
            {isWinner ? "Advanced" : "Eliminated"}
          </div>
        )}
      </div>
    </>
  );

  const frame = `relative flex flex-col overflow-hidden bg-[var(--color-panel)] transition-all ${
    dimmed ? "opacity-45 grayscale" : ""
  }`;

  if (!canVote) {
    return <div className={frame}>{inner}</div>;
  }

  // A div with role="button" rather than a real <button>, because the panel
  // contains a Link to the character page and anchors are not allowed inside
  // buttons. Keyboard activation is wired up to match native button behaviour.
  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-disabled={voting}
      aria-label={`Vote for ${participant.charName}`}
      onClick={onVote}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!voting) onVote();
        }
      }}
      whileTap={{ scale: 0.97 }}
      className={`${frame} cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-cyan)]`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100"
        style={{ boxShadow: `inset 0 0 0 2px ${accent}` }}
      />
      {inner}
    </motion.div>
  );
}

function WinnerCeremony({ champion }: { champion: Participant }) {
  const [imgError, setImgError] = useState(false);
  const img = champion.charImage && !imgError ? champion.charImage : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: CARD_EASE }}
      className="neon-rgb-border relative mx-auto mb-10 max-w-lg overflow-hidden rounded-3xl"
    >
      <div className="relative bg-[var(--color-panel)]/80 p-8 text-center backdrop-blur-sm">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 30%, rgba(16,185,129,0.5), transparent 70%), radial-gradient(50% 50% at 20% 60%, var(--color-magenta), transparent 70%), radial-gradient(50% 50% at 80% 60%, var(--color-cyan), transparent 70%)",
          }}
        />
        <div className="relative">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-400"
          >
            🏆 Champion
          </motion.p>
          <div className="mx-auto mt-5 h-36 w-36 overflow-hidden rounded-2xl border-2 border-emerald-500/40 shadow-[0_0_40px_-8px_rgba(16,185,129,0.8)]">
            {img ? (
              <>
                <Image
                  src={img}
                  alt={champion.charName}
                  width={144}
                  height={144}
                  unoptimized={img.includes("anilist.co")}
                  onError={() => setImgError(true)}
                  className="tourney-char-img h-full w-full object-cover"
                />
                <AnimeTint accent="#34d399" />
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[var(--color-void)] text-5xl">🏆</div>
            )}
          </div>
          <h2 className="mt-5 font-display text-2xl font-bold text-[var(--color-ink)]">{champion.charName}</h2>
          <p className="mt-1 text-xs text-[var(--color-mute)]">The ultimate character of this bracket</p>
        </div>
      </div>
    </motion.div>
  );
}

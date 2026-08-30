"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

const CARD_EASE = [0.22, 1, 0.36, 1] as const;

type Status = "upcoming" | "active" | "completed" | "cancelled";

interface Participant {
  id: string;
  charId: number;
  charName: string;
  charImage: string | null;
  seed: number;
}

interface Match {
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

interface RoundGroup {
  label: string;
  matches: Match[];
}

interface TournamentDetail {
  tournament: {
    id: string;
    title: string;
    description: string | null;
    size: number;
    status: Status;
    currentRound: number;
    totalRounds: number;
    creatorId: string;
    createdAt: string;
    creator: { id: string; username: string; avatar: string | null };
    participants: Participant[];
  };
  rounds: RoundGroup[];
  matches: Match[];
  totalVotes: number;
  myVotes: Record<string, "A" | "B">;
  isCreator: boolean;
}

const STATUS_BADGE: Record<Status, { label: string; className: string }> = {
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

export default function TournamentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: session } = useSession();
  const [data, setData] = useState<TournamentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [votingMatch, setVotingMatch] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    fetch(`/api/character-tournaments/${id}`)
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
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const statusBadge = data ? STATUS_BADGE[data.tournament.status] : null;
  const canStart = !!data?.isCreator && data.tournament.status === "upcoming";
  const canFinalize = !!data?.isCreator && data.tournament.status === "active";

  const handleAction = async (action: "start" | "finalize") => {
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
    if (!session?.user?.id || votingMatch) return;
    if (data?.myVotes[matchId]) return;
    setVotingMatch(matchId);
    setActionError(null);
    try {
      const res = await fetch(`/api/character-tournaments/${id}/matches/${matchId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

        <div className="mb-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: CARD_EASE }}
            className="neon-rgb-border mt-1 inline-block rounded-xl px-4 py-2"
          >
            <h1 className="font-display text-2xl font-bold sm:text-3xl">{tournament.title}</h1>
          </motion.div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
            <span className="text-[var(--color-mute)]">by @{tournament.creator.username}</span>
            {statusBadge && (
              <span className={`rounded-full border px-2.5 py-0.5 font-bold ${statusBadge.className}`}>
                {statusBadge.label}
              </span>
            )}
            <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-2.5 py-0.5 font-mono text-[var(--color-mute)]">
              {tournament.size} players
            </span>
            <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-2.5 py-0.5 font-mono text-[var(--color-violet)]">
              {tournament.status === "upcoming" ? "Round 1" : `Round ${tournament.currentRound}`} of {tournament.totalRounds}
            </span>
            <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-2.5 py-0.5 font-mono text-[var(--color-magenta)]">
              {data.totalVotes.toLocaleString()} votes
            </span>
          </div>

          {tournament.description && (
            <p className="mx-auto mt-4 max-w-xl text-sm text-[var(--color-mute)]">{tournament.description}</p>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
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

        {champion && <WinnerCeremony champion={champion} />}

        <BracketLayout
          rounds={data.rounds}
          myVotes={data.myVotes}
          votingMatch={votingMatch}
          status={tournament.status}
          currentRound={tournament.currentRound}
          onVote={handleVote}
          loggedIn={!!session?.user?.id}
        />

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

function BracketLayout({
  rounds,
  myVotes,
  votingMatch,
  status,
  currentRound,
  onVote,
  loggedIn,
}: {
  rounds: RoundGroup[];
  myVotes: Record<string, "A" | "B">;
  votingMatch: string | null;
  status: Status;
  currentRound: number;
  onVote: (matchId: string, choice: "A" | "B") => void;
  loggedIn: boolean;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {rounds.map((round, i) => {
        const isCurrent = status === "active" && round.matches.some((m) => m.round === currentRound);
        return (
          <div key={i} className="w-60 shrink-0">
            <div className="mb-3 flex items-center gap-2">
              <span
                className={`h-6 w-1 rounded-full ${
                  isCurrent ? "bg-[var(--color-magenta)]" : "bg-[var(--color-line)]"
                }`}
              />
              <h3 className={`font-display text-sm font-bold ${isCurrent ? "text-[var(--color-magenta)]" : "text-[var(--color-ink)]"}`}>
                {round.label}
              </h3>
              {isCurrent && (
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="h-1.5 w-1.5 rounded-full bg-[var(--color-magenta)]"
                />
              )}
            </div>
            <div className="space-y-3">
              {round.matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  voted={myVotes[match.id]}
                  voting={votingMatch === match.id}
                  active={status === "active" && match.round === currentRound}
                  onVote={onVote}
                  loggedIn={loggedIn}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MatchCard({
  match,
  voted,
  voting,
  active,
  onVote,
  loggedIn,
}: {
  match: Match;
  voted: "A" | "B" | undefined;
  voting: boolean;
  active: boolean;
  onVote: (matchId: string, choice: "A" | "B") => void;
  loggedIn: boolean;
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: CARD_EASE, delay: 0.05 }}
      className="relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] transition-colors"
    >
      {match.winnerId && (
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-emerald-500/40" />
      )}

      <MatchSide
        participant={match.charA}
        votes={match.votesA}
        pct={pctA}
        seed={match.charA?.seed}
        isWinner={winnerIsA}
        side="A"
        voted={voted === "A"}
        canVote={canVote}
        active={active}
        voting={voting}
        onVote={() => onVote(match.id, "A")}
        loggedIn={loggedIn}
      />

      <div className="flex items-center justify-center gap-2 border-y border-[var(--color-line)] bg-[var(--color-void)]/60 py-1.5">
        <span className="font-display text-[10px] font-black tracking-widest text-[var(--color-magenta)]">VS</span>
        <span className="font-mono text-[9px] text-[var(--color-mute)]">pos {match.position}</span>
      </div>

      <MatchSide
        participant={match.charB}
        votes={match.votesB}
        pct={pctB}
        seed={match.charB?.seed}
        isWinner={winnerIsB}
        side="B"
        voted={voted === "B"}
        canVote={canVote}
        active={active}
        voting={voting}
        onVote={() => onVote(match.id, "B")}
        loggedIn={loggedIn}
      />
    </motion.div>
  );
}

function MatchSide({
  participant,
  votes,
  pct,
  seed,
  isWinner,
  side,
  voted,
  canVote,
  active,
  voting,
  onVote,
  loggedIn,
}: {
  participant: Participant | null;
  votes: number;
  pct: number;
  seed?: number;
  isWinner?: boolean;
  side: "A" | "B";
  voted?: boolean;
  canVote: boolean;
  active: boolean;
  voting: boolean;
  onVote: () => void;
  loggedIn: boolean;
}) {
  const votesText = useCountUp(votes);
  const [imgError, setImgError] = useState(false);
  const accent = side === "A" ? "var(--color-magenta)" : "var(--color-cyan)";

  if (!participant) {
    return (
      <div className="relative flex items-center gap-3 px-3 py-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-[var(--color-line)] text-lg text-[var(--color-mute)]">
          ?
        </div>
        <div className="min-w-0">
          <p className="font-mono text-sm font-bold text-[var(--color-mute)]">TBD</p>
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-mute)] opacity-60">Seed {seed ?? "—"}</p>
        </div>
      </div>
    );
  }

  const img = participant.charImage;
  const showImg = img && !imgError;

  return (
    <div className={`relative px-3 py-3 transition-opacity ${isWinner ? "" : ""}`}>
      {isWinner && (
        <div aria-hidden className="absolute inset-0 bg-emerald-500/5" />
      )}
      <div className="relative flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--color-void)]">
          {showImg ? (
            <Image
              src={img!}
              alt={participant.charName}
              fill
              unoptimized={img!.includes("anilist.co")}
              onError={() => setImgError(true)}
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--color-panel)] text-lg">🎴</div>
          )}
          {isWinner && (
            <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/40 backdrop-blur-[1px]">
              <span className="text-sm">👑</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/character/${participant.charId}`}
              onClick={(e) => e.stopPropagation()}
              className="line-clamp-1 font-display text-sm font-bold text-[var(--color-ink)] transition-colors hover:text-[var(--color-cyan)]"
            >
              {participant.charName}
            </Link>
            {isWinner && <span className="shrink-0 text-[10px] font-bold text-emerald-400">WINNER</span>}
          </div>
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-mute)]">
            Seed {seed} · {votesText} vote{votes !== 1 ? "s" : ""} · {pct}%
          </p>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: isWinner ? "#10b981" : accent }}
            />
          </div>
        </div>

        <div className="shrink-0">
          {voted ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-400">
              ✓ Voted
            </span>
          ) : canVote && loggedIn ? (
            <button
              onClick={onVote}
              disabled={voting}
              className="rounded-md px-2.5 py-1.5 text-[10px] font-bold transition-all hover:opacity-80 disabled:opacity-50"
              style={{
                background: `color-mix(in srgb, ${accent} 30%, transparent)`,
                border: `1px solid color-mix(in srgb, ${accent} 55%, transparent)`,
                color: accent,
              }}
            >
              {voting ? "…" : `Vote ${side}`}
            </button>
          ) : active && !loggedIn ? (
            <Link
              href="/login"
              className="rounded-md border border-[var(--color-line)] px-2.5 py-1.5 text-[10px] font-bold text-[var(--color-mute)] transition-colors hover:text-[var(--color-magenta)]"
            >
              Login
            </Link>
          ) : null}
        </div>
      </div>
    </div>
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
              <Image
                src={img}
                alt={champion.charName}
                width={144}
                height={144}
                unoptimized={img.includes("anilist.co")}
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
              />
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

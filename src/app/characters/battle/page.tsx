"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

interface BattleData {
  id: string;
  charA: { id: number; name: string; image: string | null; votes: number };
  charB: { id: number; name: string; image: string | null; votes: number };
  totalVotes: number;
  date: string;
}

const CARD_EASE = [0.22, 1, 0.36, 1] as const;

export default function CharacterBattlePage() {
  const { data: session } = useSession();
  const [battle, setBattle] = useState<BattleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/characters/battle")
      .then((r) => r.json())
      .then((d) => {
        setBattle(d);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load battle");
        setLoading(false);
      });
  }, []);

  const handleVote = async (choice: "A" | "B") => {
    if (!session?.user?.id || voted || voting || !battle) return;
    setVoting(true);
    try {
      const res = await fetch("/api/characters/battle/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ battleId: battle.id, choice }),
      });
      const data = await res.json();
      if (data.success) {
        setVoted(choice);
        setBattle((prev) =>
          prev
            ? {
                ...prev,
                charA: { ...prev.charA, votes: data.votesA },
                charB: { ...prev.charB, votes: data.votesB },
                totalVotes: data.totalVotes,
              }
            : prev
        );
      }
    } catch {
      setError("Failed to vote");
    }
    setVoting(false);
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <div className="h-8 w-48 mx-auto rounded bg-white/5 animate-pulse" />
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="h-64 rounded-xl bg-white/5 animate-pulse" />
            <div className="h-64 rounded-xl bg-white/5 animate-pulse" />
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error || !battle) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="text-[var(--color-mute)]">{error || "No battle available"}</p>
        </div>
      </PageTransition>
    );
  }

  const pctA = battle.totalVotes > 0 ? Math.round((battle.charA.votes / battle.totalVotes) * 100) : 50;
  const pctB = battle.totalVotes > 0 ? Math.round((battle.charB.votes / battle.totalVotes) * 100) : 50;
  const winnerA = battle.charA.votes > battle.charB.votes;
  const winnerB = battle.charB.votes > battle.charA.votes;
  const isDraw = battle.charA.votes === battle.charB.votes && battle.totalVotes > 0;

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Daily Showdown</p>
          <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block mt-1">
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Character Battle</h1>
          </div>
          <p className="mt-2 text-sm text-[var(--color-mute)]">
            Vote for your favorite! New battle every day.
          </p>
        </div>

        {/* VS Section */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-center">
          {/* Character A */}
          <CharacterCard
            character={battle.charA}
            percentage={pctA}
            isWinner={winnerA}
            isLoser={winnerB}
            isDraw={isDraw}
            voted={voted === "A"}
            disabled={!!voted || voting}
            side="A"
            onVote={() => handleVote("A")}
          />

          {/* VS Badge */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[var(--color-magenta)] blur-xl opacity-30" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--color-magenta)]/50 bg-[var(--color-void)]">
                <span className="font-display text-xl font-bold text-[var(--color-magenta)]">VS</span>
              </div>
            </div>
          </div>

          {/* Character B */}
          <CharacterCard
            character={battle.charB}
            percentage={pctB}
            isWinner={winnerB}
            isLoser={winnerA}
            isDraw={isDraw}
            voted={voted === "B"}
            disabled={!!voted || voting}
            side="B"
            onVote={() => handleVote("B")}
          />
        </div>

        {/* Vote Stats */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[var(--color-mute)]">
            {battle.totalVotes.toLocaleString()} vote{battle.totalVotes !== 1 ? "s" : ""} today
          </p>
          {voted && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-[var(--color-cyan)]"
            >
              Thanks for voting! Come back tomorrow for a new battle.
            </motion.p>
          )}
          {!session?.user?.id && (
            <p className="mt-2 text-xs text-[var(--color-mute)]">
              <Link href="/login" className="text-[var(--color-cyan)] hover:underline">Log in</Link> to vote
            </p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

function CharacterCard({
  character,
  percentage,
  isWinner,
  isLoser,
  isDraw,
  voted,
  disabled,
  side,
  onVote,
}: {
  character: { id: number; name: string; image: string | null; votes: number };
  percentage: number;
  isWinner: boolean;
  isLoser: boolean;
  isDraw: boolean;
  voted: boolean;
  disabled: boolean;
  side: "A" | "B";
  onVote: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === "A" ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: CARD_EASE }}
      className="relative"
    >
      <div
        className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${
          voted
            ? "border-[var(--color-cyan)] shadow-[0_0_30px_-8px_var(--color-cyan)]"
            : isWinner
            ? "border-emerald-500/50 shadow-[0_0_20px_-8px_rgba(34,197,94,0.3)]"
            : isLoser
            ? "border-white/[0.06] opacity-70"
            : "border-white/[0.06] hover:border-white/[0.14] hover:shadow-[0_0_18px_-8px_rgba(192,38,255,0.25)]"
        }`}
      >
        {/* Character Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#0a0a14]">
          {character.image ? (
            <Image
              src={character.image}
              alt={character.name}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 640px) 100vw, 45vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl">?</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Vote percentage overlay */}
            <div className="absolute bottom-0 left-0 right-0">
              <div className="h-1 bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full ${
                    isWinner
                      ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                      : isDraw
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                      : "bg-gradient-to-r from-white/30 to-white/40"
                  }`}
                />
              </div>
            </div>

          {/* Winner badge */}
          {isWinner && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm"
            >
              👑
            </motion.div>
          )}
        </div>

        {/* Info + Vote */}
        <div className="p-4">
          <Link
            href={`/character/${character.id}`}
            className="font-display text-lg font-bold text-white/90 hover:text-[var(--color-cyan)] transition-colors line-clamp-1"
          >
            {character.name}
          </Link>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-mono text-[var(--color-mute)]">
              {character.votes} vote{character.votes !== 1 ? "s" : ""} ({percentage}%)
            </span>

            <button
              onClick={onVote}
              disabled={disabled}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                voted
                  ? "bg-[var(--color-cyan)]/20 text-[var(--color-cyan)] cursor-default"
                  : disabled
                  ? "bg-white/5 text-white/30 cursor-not-allowed"
                  : "bg-[var(--color-magenta)]/20 text-[var(--color-magenta)] hover:bg-[var(--color-magenta)] hover:text-black"
              }`}
            >
              {voted ? "✓ Voted" : "Vote"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

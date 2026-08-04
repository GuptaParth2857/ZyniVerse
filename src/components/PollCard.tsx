"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import TiltCard from "@/components/TiltCard";
import type { PollData } from "@/lib/polls";

interface Props {
  poll: PollData;
  onVote?: (optionId: string) => void;
  userId?: string | null;
  index?: number;
}

const BAR_COLORS = [
  "linear-gradient(90deg, #29f2e0, #1cb9ac)",
  "linear-gradient(90deg, #ff2d78, #d61a5f)",
  "linear-gradient(90deg, #ffb020, #ff8a00)",
  "linear-gradient(90deg, #a855f7, #7c3aed)",
  "linear-gradient(90deg, #4ade80, #16a34a)",
];

function timeAgo(value: string | Date) {
  const d = new Date(value);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function timeLeft(endsAt: string | Date | null) {
  if (!endsAt) return null;
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hrs}h left`;
  if (hrs > 0) return `${hrs}h ${mins}m left`;
  return `${Math.max(1, mins)}m left`;
}

export default function PollCard({ poll, onVote, userId, index = 0 }: Props) {
  const [votedOption, setVotedOption] = useState<string | null>(poll.userVote || null);

  const justVoted = !!votedOption && !poll.userVote;
  const totalVotes = poll.options.reduce((s, o) => s + (o._count?.votes || 0), 0) + (justVoted ? 1 : 0);
  const isOwner = userId === poll.createdById;
  const canVote = !!userId && !votedOption && poll.isActive;
  const left = timeLeft(poll.endsAt);

  const optionCount = (opt: { id: string; _count?: { votes: number } }) =>
    (opt._count?.votes || 0) + (justVoted && votedOption === opt.id ? 1 : 0);

  const pctFor = (opt: { id: string; _count?: { votes: number } }) =>
    totalVotes > 0 ? (optionCount(opt) / totalVotes) * 100 : 0;

  function handleVote(optionId: string) {
    if (!canVote || !onVote) return;
    setVotedOption(optionId);
    onVote(optionId);
  }

  const creatorName = poll.createdBy?.username || "anon";
  const avatarText = creatorName[0]?.toUpperCase() ?? "?";

  return (
    <TiltCard
      index={index}
      className="neon-premium rounded-[24px] h-full"
    >
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
      <div className="neon-premium-content p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-cyan)] p-[1.5px]">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--color-void)] text-sm font-bold text-[var(--color-cyan)]">
              {avatarText}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-[var(--color-ink)]">{creatorName}</span>
              {isOwner && (
                <span className="rounded bg-[var(--color-cyan)]/10 px-1.5 py-0.5 text-[9px] font-bold text-[var(--color-cyan)]">
                  Owner
                </span>
              )}
            </div>
            <p className="text-[10px] text-[var(--color-mute)]">
              {timeAgo(poll.createdAt)} • Community Poll
            </p>
          </div>
          {!poll.isActive ? (
            <span className="shrink-0 rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-mono font-semibold text-red-400">
              Closed
            </span>
          ) : left ? (
            <span className="shrink-0 rounded-full bg-[var(--color-amber)]/10 px-2.5 py-1 text-[10px] font-mono font-semibold text-[var(--color-amber)]">
              ⏳ {left}
            </span>
          ) : null}
        </div>

        <Link href={`/polls/${poll.id}`} className="block hover:text-[var(--color-magenta)] transition-colors">
          <h3 className="font-display text-base font-bold leading-snug">{poll.title}</h3>
        </Link>

        {poll.description && (
          <p className="mt-1 text-xs leading-relaxed text-[var(--color-mute)] line-clamp-2">{poll.description}</p>
        )}

        <div className="mt-4 space-y-2">
          {poll.options.map((opt, i) => {
            const count = optionCount(opt);
            const pct = pctFor(opt);
            const isSelected = votedOption === opt.id;
            const fill = BAR_COLORS[i % BAR_COLORS.length];
            const showResults = !!votedOption;

            return (
              <button
                key={opt.id}
                onClick={() => handleVote(opt.id)}
                disabled={!canVote}
                className="relative block w-full overflow-hidden rounded-xl border px-4 py-3 text-left transition-all disabled:cursor-default"
                style={{
                  borderColor: isSelected ? "var(--color-cyan)" : "rgba(31,29,51,0.9)",
                  background: "var(--color-panel)",
                  boxShadow: isSelected ? "0 0 20px -6px var(--color-cyan)" : undefined,
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: showResults ? `${Math.max(pct, pct > 0 ? 3 : 0)}%` : 0 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0"
                  style={{
                    background: isSelected ? fill : "rgba(255,255,255,0.045)",
                    opacity: isSelected ? 0.28 : 0.6,
                  }}
                />
                {isSelected && (
                  <span
                    className="absolute inset-y-1 left-0 z-10 w-1 rounded-r-full"
                    style={{ background: fill }}
                  />
                )}

                <span className="relative z-10 flex items-center gap-2">
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] transition-all ${
                      isSelected
                        ? "border-[var(--color-cyan)] bg-[var(--color-cyan)] text-black"
                        : "border-[var(--color-mute)]/50 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span
                    className={`flex-1 truncate text-xs font-medium ${isSelected ? "text-[var(--color-ink)] font-semibold" : "text-[var(--color-ink)]"}`}
                    style={isSelected ? { textShadow: "0 1px 3px rgba(0,0,0,0.8)" } : undefined}
                  >
                    {opt.label}
                  </span>
                  {showResults && (
                    <span className="font-mono text-[10px] text-[var(--color-mute)]">
                      {count} · {pct.toFixed(0)}%
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--color-mute)]">
            <span className="text-[var(--color-cyan)]">●</span>
            {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
          </div>
          <div className="flex items-center gap-3">
            {canVote && <span className="text-[10px] font-mono text-[var(--color-mute)]">Tap to vote</span>}
            {votedOption && (
              <span className="text-[10px] font-mono font-semibold text-green-400">✓ Voted</span>
            )}
            <Link
              href={`/polls/${poll.id}`}
              className="text-[10px] font-mono font-semibold text-[var(--color-magenta)] hover:underline"
            >
              View →
            </Link>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

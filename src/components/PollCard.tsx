"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { PollData } from "@/lib/polls";

interface Props {
  poll: PollData;
  onVote?: (optionId: string) => void;
  userId?: string | null;
}

export default function PollCard({ poll, onVote, userId }: Props) {
  const [votedOption, setVotedOption] = useState<string | null>(poll.userVote || null);
  const totalVotes = poll.options.reduce((s, o) => s + (o._count?.votes || 0), 0);
  const isOwner = userId === poll.createdById;

  function handleVote(optionId: string) {
    if (votedOption || !onVote || !userId) return;
    setVotedOption(optionId);
    onVote(optionId);
  }

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <Link href={`/polls/${poll.id}`} className="hover:text-[var(--color-magenta)] transition-colors min-w-0">
          <h3 className="font-display font-bold text-sm line-clamp-2">{poll.title}</h3>
        </Link>
        {!poll.isActive && (
          <span className="shrink-0 rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-mono text-red-400">Closed</span>
        )}
      </div>

      {poll.description && <p className="text-xs text-[var(--color-mute)] mb-3 line-clamp-2">{poll.description}</p>}

      <div className="space-y-1.5">
        {poll.options.map((opt) => {
          const count = opt._count?.votes || 0;
          const pct = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
          const isSelected = votedOption === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => handleVote(opt.id)}
              disabled={!!votedOption || !userId}
              className="relative w-full rounded-lg border border-[var(--color-line)] px-5 py-2.5 text-left text-xs transition-all disabled:cursor-default"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: votedOption ? `${pct}%` : 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute inset-0 rounded-lg"
                style={{ background: isSelected ? "rgba(0,255,224,0.12)" : "rgba(255,255,255,0.03)" }}
              />
              <span className="relative z-10 flex items-center justify-between">
                <span className={isSelected ? "text-[var(--color-cyan)] font-semibold" : "text-[var(--color-ink)]"}>
                  {opt.label}
                </span>
                {votedOption && (
                  <span className="font-mono text-[10px] text-[var(--color-mute)]">
                    {count} ({pct.toFixed(0)}%)
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-[var(--color-mute)]">
        <span>{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</span>
        <div className="flex items-center gap-2">
          {poll.createdBy && <span>by {poll.createdBy.username}</span>}
          {isOwner && <span className="text-[var(--color-cyan)]">Owner</span>}
        </div>
      </div>
    </div>
  );
}

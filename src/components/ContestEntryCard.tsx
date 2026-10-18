"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import ContestConfetti from "@/components/ContestConfetti";
import { rankBadge, type ContestEntryDTO } from "@/lib/contest-meta";

const spring = { type: "spring", stiffness: 380, damping: 30, mass: 0.9 } as const;
const MEDAL_RING: Record<number, string> = {
  1: "rgba(255,215,0,0.65)",
  2: "rgba(203,213,225,0.6)",
  3: "rgba(217,119,6,0.6)",
};

/**
 * One contest submission tile. The whole tile is a button that opens the
 * full-screen viewer; the vote control sits above it so both actions stay
 * keyboard-reachable without nesting buttons.
 */
export default function ContestEntryCard({
  entry,
  color,
  isVoted,
  hasVoted,
  isAuthed,
  busy,
  pulsing,
  burstKey,
  showRanks = true,
  onVote,
  onOpen,
}: {
  entry: ContestEntryDTO;
  /** Accent colour for the contest type. */
  color: string;
  isVoted: boolean;
  hasVoted: boolean;
  isAuthed: boolean;
  /** Another vote is in flight — disable this one. */
  busy: boolean;
  pulsing: boolean;
  /** Bump this to fire a confetti burst on this tile. */
  burstKey: number | null;
  showRanks?: boolean;
  onVote: () => void;
  onOpen: () => void;
}) {
  const rank = entry.rank ?? 1;
  const medal = rankBadge(rank);
  const canVote = isAuthed && !hasVoted && !entry.isMine;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ delay: Math.min(0.05 * Math.min(rank, 8), 0.35), ...spring }}
      whileHover={{ y: -5 }}
      className={`group/entry relative overflow-hidden rounded-2xl border bg-black/25 transition-all duration-300 ${
        entry.isMine
          ? "border-[var(--color-cyan)]/60 shadow-[0_0_22px_rgba(0,255,224,0.18)]"
          : isVoted
            ? "border-[var(--color-cyan)]/40"
            : "border-white/[0.07]"
      }`}
      style={showRanks && rank <= 3 ? { boxShadow: `0 0 0 1px ${MEDAL_RING[rank]}, 0 12px 30px -18px ${MEDAL_RING[rank]}` } : undefined}
    >
      {burstKey !== null && <ContestConfetti key={burstKey} color={color} />}

      {entry.image ? (
        <>
          <div className="absolute inset-0 shimmer" />
          <Image
            src={entry.image}
            alt={entry.title}
            fill
            className="object-cover transition-transform duration-500 group-hover/entry:scale-110"
            sizes="(max-width:768px) 50vw, 25vw"
            loading={rank <= 4 ? "eager" : "lazy"}
          />
        </>
      ) : (
        <div className="flex aspect-[4/5] items-center justify-center text-xs text-[var(--color-mute)]">No image</div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />

      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${entry.title}`}
        className="absolute inset-0 z-10 cursor-zoom-in"
      >
        <span className="sr-only">Open entry</span>
      </button>

      <div className="pointer-events-none absolute left-2 top-2 z-20 flex flex-col items-start gap-1">
        {showRanks && (
          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
              rank === 1
                ? "bg-gradient-to-r from-[#ffd700] to-[var(--color-magenta)] text-black shadow-[0_0_14px_rgba(255,215,0,0.5)]"
                : rank <= 3
                  ? "border border-white/20 bg-black/70 text-white"
                  : "border border-white/10 bg-black/60 text-white/70"
            }`}
          >
            {medal.medal ? `${medal.medal} ` : ""}
            {medal.label}
          </span>
        )}
        {entry.isMine && (
          <span className="rounded-full bg-[var(--color-cyan)]/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-black">Your entry</span>
        )}
        {isVoted && (
          <span className="rounded-full bg-[var(--color-cyan)]/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-black shadow-[0_0_12px_rgba(0,255,224,0.5)]">
            ✓ Voted
          </span>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-2.5">
        <p className="text-xs font-semibold leading-tight text-white line-clamp-1">{entry.title}</p>
        {entry.caption && <p className="mt-0.5 line-clamp-1 text-[10px] text-white/70">{entry.caption}</p>}
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="relative flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-[var(--color-void)] text-[8px] text-[var(--color-mute)] ring-1 ring-white/10">
            {entry.user.avatar ? <Image src={entry.user.avatar} alt="" fill className="object-cover" sizes="20px" /> : (entry.user.username || "?")[0].toUpperCase()}
          </span>
          <span className="text-[9px] text-white/80">@{entry.user.username || "anon"}</span>
        </div>
      </div>

      <div className="absolute bottom-2 right-2 z-20">
        {entry.isMine ? (
          <span className="rounded-full border border-white/15 bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white/60 backdrop-blur-sm">
            Your entry
          </span>
        ) : isVoted ? (
          <span
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold text-black backdrop-blur-sm"
            style={{ background: color, boxShadow: `0 0 12px ${color}88` }}
          >
            ✓ {entry.upvotes}
          </span>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onVote();
            }}
            disabled={!canVote || busy}
            title={!isAuthed ? "Sign in to vote" : hasVoted ? "You already voted in this battle" : "Vote for this entry"}
            className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm transition-all hover:bg-[var(--color-cyan)] hover:text-black disabled:cursor-not-allowed disabled:opacity-70"
          >
            <motion.span animate={pulsing ? { scale: [1, 1.6, 1] } : { scale: 1 }} transition={spring} className="tabular-nums">
              👍 {entry.upvotes}
            </motion.span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { contestTypeMeta, rankBadge, type ContestDTO } from "@/lib/contest-meta";

const spring = { type: "spring", stiffness: 320, damping: 30, mass: 0.9 } as const;

function ShareRow({ contestId, entryId, entryTitle }: { contestId: string; entryId: string; entryTitle: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? "" : window.location.href;
  const text = `Vote for "${entryTitle}" in the ZyniVerse weekly contest! 🏆`;

  const copy = async () => {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, "_blank", "noopener,noreferrer")}
        title="Share on WhatsApp"
        className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition-colors hover:border-[#25D366]/50 hover:text-[#25D366]"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
      </button>
      <button
        type="button"
        onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank", "width=600,height=400")}
        title="Share on X"
        className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition-colors hover:border-white/30 hover:text-white"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
      </button>
      <button
        type="button"
        onClick={() => void copy()}
        className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-bold text-white/70 transition-colors hover:text-[var(--color-cyan)]"
      >
        {copied ? "✓ Copied" : "🔗 Copy link"}
      </button>
      <Link
        href={`/contests/${contestId}?entry=${entryId}`}
        className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-bold text-white/70 transition-colors hover:text-[var(--color-cyan)]"
      >
        Open battle →
      </Link>
    </div>
  );
}

/**
 * Full-screen entry viewer. Supports ←/→ browsing, Esc to close and voting
 * straight from the modal, so a visitor never has to leave the wall to act.
 */
export default function ContestEntryLightbox({
  contest,
  index,
  onClose,
  onNavigate,
  onVote,
  voteBusy,
  isAuthed,
}: {
  contest: ContestDTO;
  index: number;
  onClose: () => void;
  onNavigate: (next: number) => void;
  onVote: (entryId: string) => void;
  voteBusy: boolean;
  isAuthed: boolean;
}) {
  const meta = contestTypeMeta(contest.type);
  const entries = contest.entries;
  const entry = entries[index];

  const step = useCallback(
    (dir: 1 | -1) => {
      if (entries.length < 2) return;
      onNavigate((index + dir + entries.length) % entries.length);
    },
    [entries.length, index, onNavigate],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, step]);

  if (!entry) return null;

  const rank = entry.rank ?? index + 1;
  const medal = rankBadge(rank);
  const isVoted = contest.votedEntryId === entry.id;
  const canVote = isAuthed && !contest.hasVoted && !entry.isMine;
  const shareTitle = entry.title || meta.label;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${shareTitle} — contest entry`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={spring}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#0d0b14]"
        style={{ boxShadow: `0 30px 120px -20px ${meta.color}55` }}
      >
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px meme-hairline" />

        <div className="grid max-h-[85vh] grid-cols-1 overflow-y-auto md:max-h-[80vh] md:grid-cols-[1.1fr_0.9fr] md:overflow-hidden">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-black md:aspect-auto md:h-full md:min-h-[420px]">
            {entry.image ? (
              <Image src={entry.image} alt={entry.title} fill className="object-contain" sizes="(max-width:768px) 100vw, 40vw" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[var(--color-mute)]">No image</div>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent md:hidden" />

            {entries.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous entry"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/60 p-2 text-white/80 backdrop-blur transition-all hover:bg-black/85 hover:text-white"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next entry"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/60 p-2 text-white/80 backdrop-blur transition-all hover:bg-black/60 hover:text-white"
                >
                  ›
                </button>
              </>
            )}
          </div>

          <div className="flex flex-col gap-4 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl border text-lg"
                  style={{ borderColor: `${meta.color}44`, background: `${meta.color}12` }}
                >
                  {meta.icon}
                </span>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-mute)]">{meta.label} · {contest.title}</p>
                  <p className="font-mono text-[11px] font-bold tabular-nums" style={{ color: meta.color }}>
                    {medal.medal} {medal.label} of {entries.length}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-full border border-white/10 bg-white/5 p-1.5 text-white/60 transition-colors hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>

            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  <h3 className="font-display text-xl font-bold leading-tight text-white">{entry.title}</h3>
                  {entry.caption && <p className="mt-2 text-sm text-white/70">{entry.caption}</p>}
                </motion.div>
              </AnimatePresence>

              <div className="mt-3 flex items-center gap-2">
                <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[var(--color-void)] text-[10px] text-[var(--color-mute)] ring-1 ring-white/10">
                  {entry.user.avatar ? (
                    <Image src={entry.user.avatar} alt="" fill className="object-cover" sizes="28px" />
                  ) : (
                    (entry.user.username || "?")[0].toUpperCase()
                  )}
                </span>
                <Link href={`/creators/${entry.user.username}`} className="text-xs text-white/75 hover:text-[var(--color-cyan)]">
                  @{entry.user.username || "anon"}
                </Link>
                {entry.isMine && (
                  <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white/70">
                    Your entry
                  </span>
                )}
              </div>
            </div>

            {entry.caption && <p className="rounded-xl border border-white/[0.06] bg-black/25 p-3 text-[11px] leading-relaxed text-white/60 line-clamp-4">{entry.caption}</p>}

            <div className="mt-auto space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-black/30 px-4 py-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-mute)]">Community votes</p>
                  <p className="font-mono text-2xl font-black tabular-nums" style={{ color: meta.color }}>
                    {entry.upvotes}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {entry.isMine && <span className="glass-badge !px-2.5 !py-1 !text-[10px]">🖼️ Your entry</span>}
                  {isVoted && (
                    <span className="rounded-full bg-[var(--color-cyan)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-black">
                      ✓ You voted
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {entry.isMine ? (
                  <span className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center text-[11px] text-[var(--color-mute)]">
                    You can&apos;t vote for your own entry — share it instead 👇
                  </span>
                ) : isVoted ? (
                  <span className="flex-1 rounded-xl border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-4 py-2.5 text-center text-[11px] font-bold text-[var(--color-cyan)]">
                    ✓ Vote locked in
                  </span>
                ) : contest.hasVoted ? (
                  <span className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-center text-[11px] text-[var(--color-mute)]">
                    You already voted in this battle
                  </span>
                ) : !isAuthed ? (
                  <Link
                    href="/login"
                    className="flex-1 rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-violet)] px-4 py-2.5 text-center text-[11px] font-black uppercase tracking-wider text-black"
                  >
                    🔑 Sign in to vote
                  </Link>
                ) : (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onVote(entry.id)}
                    disabled={!canVote || voteBusy}
                    transition={spring}
                    className="flex-1 rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-violet)] px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-black disabled:opacity-60"
                  >
                    {voteBusy ? "Voting…" : `👍 Vote for this (+1)`}
                  </motion.button>
                )}
              </div>

              <ShareRow contestId={contest.id} entryId={entry.id} entryTitle={shareTitle} />
              <p className="text-center text-[10px] text-[var(--color-mute)]">Use ← → to browse entries · Esc to close</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

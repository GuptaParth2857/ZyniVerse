"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ReportButton } from "@/components/ReportButton";

interface MemeItem {
  id: string;
  title: string;
  imageUrl: string;
  mediaTitle: string | null;
  tags: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  userVote?: 1 | -1 | 0;
  createdAt: string;
  user: { id: string; username: string; avatar: string | null };
  live?: boolean;
}

interface MemeCommentItem {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; username: string; avatar: string | null };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? "just now" : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function findUsableTags(tags: string): string[] {
  return tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 3);
}

const RANK_BADGES = [
  { medal: "🥇", label: "TOP 1", cls: "from-[#ffd75e] via-[#ffc53d] to-[#ff9d00] text-black" },
  { medal: "🥈", label: "TOP 2", cls: "from-zinc-200 via-zinc-300 to-zinc-400 text-black" },
  { medal: "🥉", label: "TOP 3", cls: "from-[#ffb877] via-[#ff9d5c] to-[#ff7a3d] text-black" },
];

function ScoreBadge({ score, vote }: { score: number; vote: 1 | -1 | 0 }) {
  return (
    <div className="flex items-center justify-center min-w-[2.75rem] relative overflow-hidden">
      <motion.span
        key={score}
        initial={{ y: 10, opacity: 0, scale: 0.6 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 22 }}
        className={`text-sm font-black tabular-nums ${
          vote !== 0
            ? vote === 1
              ? "text-[var(--color-cyan)] drop-shadow-[0_0_8px_rgba(0,255,224,0.6)]"
              : "text-[var(--color-magenta)] drop-shadow-[0_0_8px_rgba(255,0,230,0.6)]"
            : score > 0
              ? "text-[var(--color-cyan)]"
              : score < 0
                ? "text-[var(--color-magenta)]"
                : "text-[var(--color-mute)]"
        }`}
      >
        {score}
      </motion.span>
    </div>
  );
}

export default function MemeCard({ item, index = 0 }: { item: MemeItem; index?: number }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [vote, setVote] = useState<1 | -1 | 0>(item.userVote ?? 0);
  const [upvotes, setUpvotes] = useState(item.upvotes);
  const [downvotes, setDownvotes] = useState(item.downvotes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<MemeCommentItem[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(item.commentCount);
  const [imgError, setImgError] = useState(false);
  const [dbId, setDbId] = useState<string | null>(item.live ? null : item.id);

  const ensureDb = async (): Promise<string | null> => {
    if (dbId) return dbId;
    if (!item.live) return item.id;
    try {
      const res = await fetch("/api/memes/live/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: item.title, imageUrl: item.imageUrl, tags: item.tags }),
      });
      const data = await res.json();
      if (data?.meme?.id) {
        setDbId(data.meme.id);
        return data.meme.id;
      }
    } catch {}
    return null;
  };

  const tags = findUsableTags(item.tags);
  const score = upvotes - downvotes;
  const rank = index < RANK_BADGES.length ? RANK_BADGES[index] : null;
  const isHot = score >= 40;
  const heat = Math.min(100, Math.round((Math.max(0, score) / 200) * 100));

  const handleVote = async (value: 1 | -1) => {
    if (!session?.user?.id) {
      router.push("/login");
      return;
    }
    const target = item.live ? await ensureDb() : item.id;
    if (!target) return;
    if (vote === value) {
      const res = await fetch(`/api/memes/${target}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      const data = await res.json();
      if (data.meme) {
        setUpvotes(data.meme.upvotes);
        setDownvotes(data.meme.downvotes);
        setVote(0);
      }
      return;
    }

    const res = await fetch(`/api/memes/${target}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    const data = await res.json();
    if (data.meme) {
      setUpvotes(data.meme.upvotes);
      setDownvotes(data.meme.downvotes);
      setVote(value);
    }
  };

  const handleLike = () => {
    if (!session?.user?.id) {
      router.push("/login");
      return;
    }
    void handleVote(1);
  };

  const loadComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    setShowComments(true);
    if (comments.length > 0) return;
    const target = await ensureDb();
    if (!target) return;
    try {
      const res = await fetch(`/api/memes/${target}/comments`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {}
  };

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !commentText.trim()) return;
    const target = await ensureDb();
    if (!target) return;
    try {
      const res = await fetch(`/api/memes/${target}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      const data = await res.json();
      if (data.comment) {
        setComments((c) => [...c, data.comment]);
        setCommentText("");
        setCommentCount((n) => n + 1);
      }
    } catch {}
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          url: window.location.href,
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {}
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 26, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: Math.min((index % 6) * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-3xl meme-card-border bg-[#15121d]/85 backdrop-blur-xl"
    >
      {/* hairline shimmer on top edge */}
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px z-40 meme-hairline" />

      {/* IMAGE — framed canvas */}
      <div className="relative z-10 p-2.5 sm:p-4">
        <div className="relative aspect-video overflow-hidden rounded-2xl meme-aurora ring-1 ring-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 group-hover:ring-[var(--color-cyan)]/40">
          {!imgError && (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              loading="lazy"
              onError={() => setImgError(true)}
              className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 50vw"
            />
          )}
          <div className="award-sheen" />
          {imgError && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gradient-to-br from-[var(--color-violet)] to-[var(--color-magenta)]">
              <span className="animate-bounce text-4xl mb-1">😄</span>
              <span className="text-xs opacity-70 line-clamp-2 px-6 text-center">{item.title}</span>
            </div>
          )}

          {/* badges */}
          <div className="absolute left-2.5 top-2.5 z-30 flex flex-wrap items-center gap-1.5">
            {rank && (
              <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-br ${rank.cls} px-2.5 py-1 text-[10px] font-black tracking-wide shadow-lg`}>
                {rank.medal} {rank.label}
              </span>
            )}
            {isHot && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-magenta)]/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg animate-pulse">
                🔥 Hot
              </span>
            )}
            {item.live && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-cyan)]/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-black shadow-lg">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-black" />
                </span>
                Live
              </span>
            )}
          </div>

          {/* bottom fade for scale */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
        </div>
      </div>

      {/* BODY */}
      <div className="relative z-10 px-4 pt-1 pb-3 sm:px-5">
        <p className="mb-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.35em] text-[var(--color-cyan)]/80">
          ✦ Anime Meme
        </p>
        <h3 className="font-sans text-base sm:text-[17px] leading-snug font-extrabold tracking-tight text-[var(--color-ink)] line-clamp-2 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-[var(--color-cyan)] group-hover:to-[var(--color-magenta)] group-hover:bg-clip-text group-hover:text-transparent">
          {item.title}
        </h3>

        {(item.mediaTitle || tags.length > 0) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {item.mediaTitle && (
              <span className="glass-tag !px-2 !py-0.5 !text-[10px]">
                <span className="font-semibold text-[var(--color-cyan)]">✦</span> {item.mediaTitle}
              </span>
            )}
            {tags.map((t, i) => (
              <span
                key={t}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${i === 0 && tags.length > 1
                  ? "bg-[var(--color-cyan)]/15 text-[var(--color-cyan)]"
                  : "glass-tag !px-2 !py-0.5 !text-[10px]"}`}
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* INFO STRIP — author + actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-2xl border border-[var(--color-line)] bg-[var(--color-void)]/50 px-3 py-2 sm:px-3.5">
          <div className="flex min-w-0 items-center gap-2">
            <div className="relative h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-magenta)] p-[1.5px] shadow-[0_0_12px_rgba(0,255,224,0.15)]">
              <div className="relative h-full w-full overflow-hidden rounded-full bg-[#12101c]">
                {item.user.avatar ? (
                  <Image src={item.user.avatar} alt={item.user.username} fill className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[9px] font-black text-white">
                    {item.user.username[0]?.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div className="min-w-0 leading-tight">
              <span className="inline-flex max-w-[130px] sm:max-w-[180px] items-center gap-1 truncate rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] font-semibold text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-cyan)]">
                <span className="shrink-0 text-[8px] text-[var(--color-cyan)]">✦</span>
                <span className="truncate">u/{item.user.username}</span>
              </span>
              <span className="mt-1 flex items-center gap-1 font-mono text-[9px] text-[var(--color-mute)]/70">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
                {timeAgo(item.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/70 p-0.5">
            <button
              onClick={loadComments}
              aria-label={`Comments (${commentCount})`}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                showComments
                  ? "bg-[var(--color-cyan)]/15 text-[var(--color-cyan)] shadow-[0_0_14px_rgba(0,255,224,0.15)]"
                  : "text-[var(--color-mute)] hover:bg-white/5 hover:text-[var(--color-cyan)]"
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {formatCount(commentCount)}
            </button>
            <div className="h-4 w-px bg-[var(--color-line)]" />
            <button
              onClick={handleShare}
              aria-label="Share"
              title="Copy to clipboard"
              className="flex items-center rounded-lg px-2.5 py-1.5 text-[var(--color-mute)] transition-all hover:bg-white/5 hover:text-[var(--color-cyan)]"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <div className="h-4 w-px bg-[var(--color-line)]" />
            <span className="flex items-center rounded-lg px-2 py-1 transition-all hover:bg-white/5">
              <ReportButton contentType="MEME" contentId={item.id} authorId={item.user.id} label="" />
            </span>
          </div>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="relative z-10 flex items-center justify-between gap-2 border-t border-[var(--color-line)] px-3 py-2.5 sm:px-5 sm:py-3">
        <div className="flex items-stretch gap-1 rounded-2xl border border-[var(--color-line)] bg-[var(--color-void)]/80 p-1">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleLike}
            aria-label="Like"
            title={session?.user?.id ? "Like" : "Sign in to like"}
            className={`flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-bold transition-all ${
              vote === 1
                ? "text-[var(--color-magenta)] bg-[var(--color-magenta)]/15 shadow-[0_0_18px_rgba(255,0,230,0.25)]"
                : "text-[var(--color-mute)] hover:bg-white/5 hover:text-[var(--color-magenta)]"
            }`}
          >
            <motion.svg
              key={vote === 1 ? "liked" : "unliked"}
              initial={{ scale: 0.4 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill={vote === 1 ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </motion.svg>
            <motion.span
              key={upvotes}
              initial={{ y: 10, opacity: 0, scale: 0.6 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
              className="tabular-nums"
            >
              {formatCount(upvotes)}
            </motion.span>
          </motion.button>
          <div className="my-auto h-5 w-px bg-[var(--color-line)]" />

          <motion.button
            onClick={() => handleVote(1)}
            whileTap={{ scale: 0.8 }}
            aria-label="Upvote"
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
              vote === 1
                ? "bg-[var(--color-cyan)]/20 text-[var(--color-cyan)] shadow-[0_0_18px_rgba(0,255,224,0.25)]"
                : "text-[var(--color-mute)] hover:bg-white/5 hover:text-[var(--color-cyan)]"
            }`}
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </motion.button>

          <ScoreBadge score={score} vote={vote} />

          <motion.button
            onClick={() => handleVote(-1)}
            whileTap={{ scale: 0.8 }}
            aria-label="Downvote"
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
              vote === -1
                ? "bg-[var(--color-magenta)]/20 text-[var(--color-magenta)] shadow-[0_0_18px_rgba(255,0,230,0.25)]"
                : "text-[var(--color-mute)] hover:bg-white/5 hover:text-[var(--color-magenta)]"
            }`}
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>
        </div>

        {/* heat meter / rank */}
        {isHot ? (
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5">
              <span className="inline-block animate-pulse text-sm drop-shadow-[0_0_8px_rgba(255,120,0,0.9)]">🔥</span>
              <span className="font-display text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-[#ff7a3d] via-[#ff9d5c] to-[#ffd75e] bg-clip-text text-transparent">
                #{index + 1} Trending
              </span>
            </div>
            <div className="h-1 w-16 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${heat}%` }}
                transition={{ delay: 0.35 + Math.min((index % 6) * 0.04, 0.25), duration: 0.7, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-[#ff7a3d] to-[var(--color-magenta)] shadow-[0_0_8px_rgba(255,120,0,0.6)]"
              />
            </div>
          </div>
        ) : (
          <span className="hidden items-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/60 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--color-mute)]/60 sm:flex">
            <span className="text-[var(--color-cyan)]">★</span> Community
          </span>
        )}
      </div>

      {/* COMMENTS */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${showComments ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="relative z-10 border-t border-[var(--color-line)] p-4 sm:px-5 space-y-3">
            {comments.length === 0 && (
              <p className="text-xs text-[var(--color-mute)]">No comments yet. Be the first to comment!</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2.5">
                <div className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-cyan)] p-[1.5px]">
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-[#12101c]">
                    {c.user.avatar ? (
                      <Image src={c.user.avatar} alt={c.user.username} fill className="object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[9px] font-black text-white">
                        {c.user.username[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[11px] font-semibold text-[var(--color-ink)]">u/{c.user.username}</span>
                    <span className="text-[9px] text-[var(--color-mute)]/60">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--color-mute)]">{c.content}</p>
                </div>
              </div>
            ))}

            {session?.user?.id ? (
              <form onSubmit={addComment} className="flex items-center gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 px-3 py-2.5 text-xs text-white placeholder-white/20 outline-none focus:border-[var(--color-cyan)] transition-colors"
                />
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.94 }}
                  disabled={!commentText.trim()}
                  className="rounded-xl bg-gradient-to-r from-[var(--color-cyan)] to-[var(--color-magenta)] px-4 py-2.5 text-xs font-bold text-black disabled:opacity-50"
                >
                  Post
                </motion.button>
              </form>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-line)] px-3 py-2.5 text-xs font-semibold text-[var(--color-mute)] transition-colors hover:border-[var(--color-cyan)]/60 hover:text-[var(--color-cyan)]"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-9 8a7 7 0 100-14 7 7 0 000 14z" />
                </svg>
                Sign in to comment
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
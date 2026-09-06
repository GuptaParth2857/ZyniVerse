"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

interface ReviewUser {
  id: string;
  username: string;
  avatar: string | null;
}

interface ReviewData {
  id: string;
  userId: string;
  mediaId: number;
  mediaTitle: string;
  mediaImage: string | null;
  title: string;
  content: string;
  rating: number | null;
  upvotes: number;
  userVote?: number | null;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser;
}

const SCORE_COLORS: Record<number, string> = {
  10: "#10b981",
  9: "#10b981",
  8: "var(--color-cyan)",
  7: "var(--color-cyan)",
  6: "#f59e0b",
  5: "#f59e0b",
  4: "var(--color-magenta)",
  3: "var(--color-magenta)",
  2: "#ef4444",
  1: "#ef4444",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("### ")) return <h3 key={i} className="text-base font-bold mt-4 mb-2">{line.slice(4)}</h3>;
    if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-bold mt-5 mb-2">{line.slice(3)}</h2>;
    if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-bold mt-6 mb-3">{line.slice(2)}</h1>;
    if (line.startsWith("- ")) return <li key={i} className="text-sm text-[var(--color-mute)] ml-4 list-disc">{line.slice(2)}</li>;
    if (line.startsWith("> ")) return <blockquote key={i} className="border-l-2 border-[var(--color-cyan)] pl-4 text-sm text-[var(--color-mute)] italic my-2">{line.slice(2)}</blockquote>;
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return <p key={i} className="text-sm text-[var(--color-mute)] leading-relaxed">{line}</p>;
  });
}

export default function ReviewDetailClient({ review: initial }: { review: ReviewData }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [review, setReview] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(initial.title);
  const [editContent, setEditContent] = useState(initial.content);
  const [editRating, setEditRating] = useState<number | null>(initial.rating);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = session?.user?.id === review.userId;

  async function handleVote(value: 1 | -1) {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/reviews/long/${review.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (res.ok) {
        const data = await res.json();
        setReview((prev) => ({ ...prev, upvotes: data.upvotes, userVote: data.userVote }));
      }
    } catch {}
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/reviews/long/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent, rating: editRating }),
      });
      if (res.ok) {
        const data = await res.json();
        setReview(data.review);
        setEditing(false);
      }
    } catch {}
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this review?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/reviews/long/${review.id}`, { method: "DELETE" });
      if (res.ok) router.push(`/anime/${review.mediaId}`);
    } catch {}
    setDeleting(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--color-mute)] mb-4">
        <Link href={`/anime/${review.mediaId}`} className="hover:text-[var(--color-cyan)]">{review.mediaTitle}</Link>
        <span>/</span>
        <span className="text-[var(--color-cyan)]">Review</span>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="neon-premium rounded-[20px] mb-6"
      >
        <div className="neon-premium-track" />
        <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
        <div className="neon-premium-content rounded-[20px] p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {review.mediaImage && (
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative h-12 w-9 overflow-hidden rounded-lg shrink-0">
                    <Image src={review.mediaImage} alt={review.mediaTitle} fill sizes="36px" className="object-cover" />
                  </div>
                  <span className="text-[10px] font-mono text-[var(--color-mute)]">{review.mediaTitle}</span>
                </div>
              )}
              {!review.mediaImage && (
                <span className="text-[10px] font-mono text-[var(--color-mute)] mb-2 block">{review.mediaTitle}</span>
              )}
              {editing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-lg font-display font-bold focus:outline-none focus:border-[var(--color-magenta)]"
                />
              ) : (
                <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight">{review.title}</h1>
              )}

              <div className="flex items-center gap-3 mt-3">
                <Link
                  href={`/profile/${review.user.id}`}
                  className="flex items-center gap-2 hover:text-[var(--color-cyan)] transition-colors no-underline"
                >
                  {review.user.avatar ? (
                    <div className="relative h-6 w-6 overflow-hidden rounded-full ring-2 ring-[rgba(10,10,15,0.8)]">
                      <Image src={review.user.avatar} alt="" fill sizes="24px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-violet)]" />
                  )}
                  <span className="text-xs font-medium">{review.user.username}</span>
                </Link>
                <span className="text-[10px] text-[var(--color-mute)]">·</span>
                <span className="text-[10px] text-[var(--color-mute)]">{formatDate(review.createdAt)}</span>
                {review.updatedAt !== review.createdAt && (
                  <>
                    <span className="text-[10px] text-[var(--color-mute)]">·</span>
                    <span className="text-[10px] text-[var(--color-mute)]">edited</span>
                  </>
                )}
              </div>
            </div>

            {review.rating != null && (
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-mono text-lg font-bold text-black shadow-lg"
                style={{ backgroundColor: SCORE_COLORS[review.rating] || "var(--color-magenta)" }}
              >
                {review.rating}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 sm:p-6 mb-6"
      >
        {editing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={12}
            className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm resize-y focus:outline-none focus:border-[var(--color-magenta)] transition-colors font-mono"
          />
        ) : (
          <div className="prose prose-sm prose-invert max-w-none">
            {renderMarkdown(review.content)}
          </div>
        )}

        {editing && (
          <div className="mt-4 flex items-center gap-2 border-t border-[var(--color-line)] pt-4">
            <span className="text-xs text-[var(--color-mute)]">Rating:</span>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setEditRating(editRating === n ? null : n)}
                className={`h-6 w-6 rounded text-[10px] font-bold font-mono transition-all ${
                  editRating === n
                    ? "text-black shadow scale-110"
                    : "border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-magenta)]"
                }`}
                style={editRating === n ? { backgroundColor: SCORE_COLORS[n] || "var(--color-magenta)" } : undefined}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg neon-rgb-border px-3 py-2">
            <button
              onClick={() => handleVote(1)}
              disabled={!session?.user?.id}
              className={`rounded p-0.5 transition-colors ${
                review.userVote === 1
                  ? "text-[var(--color-cyan)]"
                  : "text-[var(--color-mute)] hover:text-[var(--color-cyan)]"
              } disabled:opacity-30`}
            >
              <svg className="w-5 h-5" fill={review.userVote === 1 ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <span className="font-mono text-sm font-bold min-w-[2rem] text-center">{review.upvotes}</span>
            <button
              onClick={() => handleVote(-1)}
              disabled={!session?.user?.id}
              className={`rounded p-0.5 transition-colors ${
                review.userVote === -1
                  ? "text-[var(--color-magenta)]"
                  : "text-[var(--color-mute)] hover:text-[var(--color-magenta)]"
              } disabled:opacity-30`}
            >
              <svg className="w-5 h-5" fill={review.userVote === -1 ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {isOwner && (
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-[var(--color-magenta)] px-4 py-2 text-xs font-bold text-black disabled:opacity-50 transition-opacity"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => { setEditing(false); setEditTitle(review.title); setEditContent(review.content); setEditRating(review.rating); }}
                  className="text-xs text-[var(--color-mute)] hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 rounded-lg neon-rgb-border px-4 py-2 text-xs font-bold text-[var(--color-cyan)] hover:bg-white/5 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </>
            )}
          </div>
        )}
      </motion.div>

      {/* Comment placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5 mb-8"
      >
        <h3 className="font-display text-sm font-bold mb-3 flex items-center gap-2">
          <span className="h-3 w-1 rounded-full bg-[var(--color-cyan)]" />
          Comments
        </h3>
        <p className="text-sm text-[var(--color-mute)]">Comments coming soon.</p>
      </motion.div>
    </div>
  );
}

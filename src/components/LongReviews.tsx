"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { applyUserVotes, fetchViewerState } from "@/lib/client/viewer-state";

interface ReviewUser {
  id: string;
  username: string;
  avatar: string | null;
}

interface LongReviewData {
  id: string;
  userId: string;
  mediaId: number;
  mediaTitle: string;
  mediaImage: string | null;
  title: string;
  content: string;
  rating: number | null;
  upvotes: number;
  userVote: number | null;
  createdAt: string;
  user: ReviewUser;
}

interface Props {
  mediaId: number;
  mediaTitle: string;
  mediaImage: string | null;
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

export default function LongReviews({ mediaId, mediaTitle, mediaImage }: Props) {
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState<LongReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sort, setSort] = useState<"top" | "recent">("top");
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formRating, setFormRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fetchError, setFetchError] = useState("");

  const fetchReviews = useCallback(async (p: number, s: string, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    if (!append) setFetchError("");

    try {
      const res = await fetch(`/api/reviews/long?mediaId=${mediaId}&page=${p}&limit=10&sort=${s}`);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        if (!append) setFetchError(d.error || "Failed to load reviews");
        return;
      }
      const data = await res.json();
      const list: LongReviewData[] = data.reviews || [];

      if (status === "authenticated") {
        // The visitor's own review vote is fetched separately, so the review
        // list stays identical for everyone and can come from the CDN.
        const states = await fetchViewerState("reviewVotes", list.map((r) => r.id));
        applyUserVotes(list, states);
      }

      if (append) {
        setReviews((prev) => [...prev, ...list]);
      } else {
        setReviews(list);
      }
      setHasMore(data.pagination?.page < data.pagination?.totalPages);
    } catch {
      if (!append) setFetchError("Failed to load reviews");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [mediaId, status]);

  useEffect(() => {
    if (status === "loading") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
    fetchReviews(1, sort, false);
  }, [sort, fetchReviews, status]);

  useEffect(() => {
    if (page > 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchReviews(page, sort, true);
    }
  }, [page, sort, fetchReviews]);

  async function handleVote(reviewId: string, value: 1 | -1) {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/reviews/long/${reviewId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (res.ok) {
        const data = await res.json();
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? { ...r, upvotes: data.upvotes, userVote: data.userVote }
              : r
          )
        );
      }
    } catch {
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews/long", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId,
          mediaTitle,
          mediaImage,
          title: formTitle,
          content: formContent,
          rating: formRating,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create review");
        return;
      }
      const data = await res.json();
      setReviews((prev) => [data.review, ...prev]);
      setFormTitle("");
      setFormContent("");
      setFormRating(null);
      setShowForm(false);
    } catch {
      setError("Failed to create review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-[var(--color-magenta)]" />
          Long Reviews ({reviews.length})
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[var(--color-line)] overflow-hidden">
            {(["top", "recent"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  sort === s
                    ? "bg-[var(--color-magenta)] text-black"
                    : "text-[var(--color-mute)] hover:text-white"
                }`}
              >
                {s === "top" ? "Top" : "Recent"}
              </button>
            ))}
          </div>
          {session?.user?.id && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-lg bg-[var(--color-magenta)] px-4 py-1.5 text-[10px] font-bold text-black hover:opacity-90 transition-opacity"
            >
              Write Review
            </button>
          )}
        </div>
      </div>

      {!session?.user?.id && (
        <p className="mb-4 text-sm text-[var(--color-mute)]">
          <a href="/login" className="text-[var(--color-magenta)] underline">Sign in</a> to write a long review.
        </p>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="mb-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 space-y-3 overflow-hidden"
          >
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Review title..."
              required
              minLength={3}
              maxLength={200}
              className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-magenta)] transition-colors"
            />
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="Write your review... (markdown supported)"
              required
              minLength={10}
              maxLength={5000}
              rows={8}
              className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm resize-y focus:outline-none focus:border-[var(--color-magenta)] transition-colors font-mono"
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[var(--color-mute)]">Rating:</span>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setFormRating(formRating === n ? null : n)}
                  className={`h-7 w-7 rounded text-[10px] font-bold font-mono transition-all ${
                    formRating === n
                      ? "text-black shadow scale-110"
                      : "border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-magenta)] hover:text-[var(--color-magenta)]"
                  }`}
                  style={formRating === n ? { backgroundColor: SCORE_COLORS[n] || "var(--color-magenta)" } : undefined}
                >
                  {n}
                </button>
              ))}
              {formRating && (
                <span className="text-[10px] font-mono text-[var(--color-mute)]">/10</span>
              )}
            </div>
            {error && <p className="text-xs text-[var(--color-magenta)]">{error}</p>}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-[var(--color-magenta)] px-5 py-2.5 text-xs font-bold text-black disabled:opacity-50 transition-opacity"
              >
                {submitting ? "Publishing..." : "Publish Review"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-xs text-[var(--color-mute)] hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {fetchError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {fetchError}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 animate-pulse">
              <div className="h-4 w-1/3 rounded bg-[var(--color-void)]" />
              <div className="h-3 w-full rounded bg-[var(--color-void)] mt-3" />
              <div className="h-3 w-2/3 rounded bg-[var(--color-void)] mt-2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/reviews/${review.id}`}
                    className="font-display text-sm font-bold hover:text-[var(--color-cyan)] transition-colors no-underline"
                  >
                    {review.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <Link
                      href={`/profile/${review.user.id}`}
                      className="flex items-center gap-1.5 hover:text-[var(--color-cyan)] transition-colors no-underline"
                    >
                      {review.user.avatar ? (
                        <div className="relative h-4 w-4 overflow-hidden rounded-full">
                          <Image src={review.user.avatar} alt="" fill sizes="16px" className="object-cover" />
                        </div>
                      ) : (
                        <div className="h-4 w-4 rounded-full bg-gradient-to-br from-[var(--color-cyan)] to-[var(--color-violet)]" />
                      )}
                      <span className="text-[10px] font-medium text-[var(--color-mute)]">{review.user.username}</span>
                    </Link>
                    <span className="text-[10px] text-[var(--color-mute)]">·</span>
                    <span className="text-[10px] text-[var(--color-mute)]">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
                {review.rating != null && (
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold text-black"
                    style={{ backgroundColor: SCORE_COLORS[review.rating] || "var(--color-magenta)" }}
                  >
                    {review.rating}
                  </div>
                )}
              </div>

              <div className="mt-3 overflow-hidden line-clamp-3 text-sm text-[var(--color-mute)] leading-relaxed">
                {renderMarkdown(review.content)}
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleVote(review.id, 1)}
                    disabled={!session?.user?.id}
                    className={`rounded p-1 transition-colors ${
                      review.userVote === 1
                        ? "text-[var(--color-cyan)]"
                        : "text-[var(--color-mute)] hover:text-[var(--color-cyan)]"
                    } disabled:opacity-30`}
                  >
                    <svg className="w-4 h-4" fill={review.userVote === 1 ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <span className="font-mono text-xs font-bold text-[var(--color-mute)] min-w-[1.5rem] text-center">
                    {review.upvotes}
                  </span>
                  <button
                    onClick={() => handleVote(review.id, -1)}
                    disabled={!session?.user?.id}
                    className={`rounded p-1 transition-colors ${
                      review.userVote === -1
                        ? "text-[var(--color-magenta)]"
                        : "text-[var(--color-mute)] hover:text-[var(--color-magenta)]"
                    } disabled:opacity-30`}
                  >
                    <svg className="w-4 h-4" fill={review.userVote === -1 ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <Link
                  href={`/reviews/${review.id}`}
                  className="text-[10px] font-mono text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors no-underline"
                >
                  Read full review →
                </Link>
              </div>
            </motion.div>
          ))}

          {reviews.length === 0 && (
            <p className="text-sm text-[var(--color-mute)] text-center py-8">No long reviews yet. Be the first to write one!</p>
          )}

          {hasMore && (
            <div className="text-center pt-2">
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loadingMore}
                className="rounded-lg neon-rgb-border px-6 py-2 text-xs font-bold text-[var(--color-cyan)] hover:bg-white/5 transition-all disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

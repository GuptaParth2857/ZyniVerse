"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  id: string;
  userId: string;
  mediaId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { username: string };
}

export default function ReviewsSection({ mediaId }: { mediaId: number }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?mediaId=${mediaId}`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mediaId]);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId, rating, comment }),
      });
      if (res.ok) {
        setComment("");
        const updated = await fetch(`/api/reviews?mediaId=${mediaId}`).then((r) => r.json());
        setReviews(updated.reviews || []);
      }
    } catch {}
    setSubmitting(false);
  }

  if (loading) return null;

  return (
    <section>
      <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
        <span className="h-4 w-1 rounded-full bg-[var(--color-magenta)]" />
        Reviews ({reviews.length})
      </h2>

      {/* Review Form */}
      {session ? (
        <form onSubmit={submitReview} className="mb-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 space-y-3">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)}
                className={`h-7 w-7 rounded text-xs font-bold transition-all ${
                  n <= rating
                    ? "bg-[var(--color-magenta)] text-black"
                    : "bg-[var(--color-void)] text-[var(--color-mute)]"
                }`}
              >{n}</button>
            ))}
            <span className="text-sm text-[var(--color-mute)] ml-2">/10</span>
          </div>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-void)] px-3 py-2 text-sm resize-none focus:outline-none focus:border-[var(--color-magenta)] transition-colors"
            rows={2} placeholder="Write a review (optional)" />
          <button type="submit" disabled={submitting}
            className="rounded-full bg-[var(--color-magenta)] px-4 py-1.5 text-xs font-bold text-black disabled:opacity-50"
          >{submitting ? "Submitting..." : "Submit Review"}</button>
        </form>
      ) : (
        <p className="mb-6 text-sm text-[var(--color-mute)]">
          <a href="/login" className="text-[var(--color-magenta)] underline">Sign in</a> to leave a review.
        </p>
      )}

      {/* Reviews List */}
      <div className="space-y-2">
        <AnimatePresence>
          {reviews.map((r) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{r.user.username}</span>
                <span className="text-xs font-mono font-bold text-[var(--color-magenta)]">{r.rating}/10</span>
              </div>
              {r.comment && <p className="mt-1 text-sm text-[var(--color-mute)]">{r.comment}</p>}
              <p className="mt-1 text-[9px] text-[var(--color-mute)]">{new Date(r.createdAt).toLocaleDateString()}</p>
            </motion.div>
          ))}
        </AnimatePresence>
        {reviews.length === 0 && <p className="text-sm text-[var(--color-mute)]">No reviews yet.</p>}
      </div>
    </section>
  );
}

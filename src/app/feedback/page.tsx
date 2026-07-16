"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface FeedbackItem {
  id: string;
  type: string;
  message: string;
  page: string | null;
  isFeatured: boolean;
  featuredHeading: string | null;
  featuredDescription: string | null;
  featuredImage: string | null;
  likeCount: number;
  replyCount: number;
  createdAt: string;
}

interface FeedbackComment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; username: string; avatar: string | null };
}

const typeColors: Record<string, string> = {
  bug: "bg-red-500/20 text-red-400",
  suggestion: "bg-blue-500/20 text-blue-400",
  feature: "bg-green-500/20 text-green-400",
  other: "bg-gray-500/20 text-gray-400",
};

export default function FeedbackPage() {
  const { data: session } = useSession();
  const [featured, setFeatured] = useState<FeedbackItem[]>([]);
  const [allFeedback, setAllFeedback] = useState<FeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, FeedbackComment[]>>({});
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/feedback/public?featured=true&limit=10").then((r) => r.json()),
      fetch(`/api/feedback/public?limit=20${typeFilter ? `&type=${typeFilter}` : ""}`).then((r) => r.json()),
    ]).then(([featuredData, allData]) => {
      setFeatured(featuredData.feedbacks || []);
      setAllFeedback(allData.feedbacks || []);
      setTotal(allData.total || 0);
      setLoading(false);
    });
  }, [typeFilter]);

  const handleLike = async (id: string) => {
    if (!session) return;
    const res = await fetch(`/api/feedback/${id}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setLikedIds((prev) => {
        const next = new Set(prev);
        data.liked ? next.add(id) : next.delete(id);
        return next;
      });
      setAllFeedback((prev) => prev.map((f) => (f.id === id ? { ...f, likeCount: data.likes } : f)));
      setFeatured((prev) => prev.map((f) => (f.id === id ? { ...f, likeCount: data.likes } : f)));
    }
  };

  const loadComments = async (id: string) => {
    if (comments[id]) return;
    const res = await fetch(`/api/feedback/${id}/comments`);
    if (res.ok) {
      const data = await res.json();
      setComments((prev) => ({ ...prev, [id]: data.comments }));
    }
  };

  const handleComment = async (id: string) => {
    if (!commentText.trim() || postingComment) return;
    setPostingComment(id);
    const res = await fetch(`/api/feedback/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText }),
    });
    if (res.ok) {
      const data = await res.json();
      setComments((prev) => ({ ...prev, [id]: [...(prev[id] || []), data.comment] }));
      setCommentText("");
    }
    setPostingComment(null);
  };

  return (
    <div className="min-h-screen bg-[var(--color-void)]">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Community</p>
        <h1 className="font-display text-4xl font-bold mt-2">Feedback</h1>
        <p className="mt-2 text-[var(--color-mute)]">See what the community is saying and share your thoughts.</p>

        {featured.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-[var(--color-amber)]">★</span> Featured
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featured.map((f) => (
                <div key={f.id} className="rounded-xl border border-[var(--color-amber)]/20 bg-[var(--color-panel)] p-5 relative overflow-hidden">
                  {f.featuredImage && (
                    <div className="absolute inset-0 opacity-10">
                      <img src={f.featuredImage} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="relative">
                    {f.featuredHeading && <h3 className="font-display text-lg font-bold mb-1">{f.featuredHeading}</h3>}
                    {f.featuredDescription && <p className="text-sm text-[var(--color-mute)] mb-3">{f.featuredDescription}</p>}
                    <p className="text-sm mb-4 line-clamp-3">{f.message}</p>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(f.id)}
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          likedIds.has(f.id) ? "text-[var(--color-magenta)]" : "text-[var(--color-mute)] hover:text-[var(--color-magenta)]"
                        }`}
                      >
                        {likedIds.has(f.id) ? "♥" : "♡"} {f.likeCount}
                      </button>
                      <button
                        onClick={() => { setExpandedId(expandedId === f.id ? null : f.id); loadComments(f.id); }}
                        className="flex items-center gap-1 text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
                      >
                        💬 {f.replyCount}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold">All Feedback</h2>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1.5 text-xs outline-none"
            >
              <option value="">All Types</option>
              <option value="bug">Bug Report</option>
              <option value="suggestion">Suggestion</option>
              <option value="feature">Feature Request</option>
              <option value="other">Other</option>
            </select>
          </div>

          {loading ? (
            <div className="py-20 text-center text-[var(--color-mute)] text-sm">Loading...</div>
          ) : allFeedback.length === 0 ? (
            <div className="py-20 text-center text-[var(--color-mute)] text-sm">No feedback yet. Be the first!</div>
          ) : (
            <div className="space-y-3">
              {allFeedback.map((f) => (
                <div key={f.id} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden">
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                    onClick={() => { setExpandedId(expandedId === f.id ? null : f.id); loadComments(f.id); }}
                  >
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase shrink-0 ${typeColors[f.type] || typeColors.other}`}>
                      {f.type}
                    </span>
                    {f.isFeatured && (
                      <span className="text-[var(--color-amber)] text-xs">★</span>
                    )}
                    <p className="flex-1 text-sm truncate">{f.message}</p>
                    <span className="text-[10px] text-[var(--color-mute)] shrink-0">
                      ♥ {f.likeCount} · 💬 {f.replyCount}
                    </span>
                  </div>

                  {expandedId === f.id && (
                    <div className="border-t border-[var(--color-line)] p-4 space-y-4">
                      <p className="text-sm">{f.message}</p>
                      {f.page && <p className="text-[10px] text-[var(--color-mute)]">Page: {f.page}</p>}
                      <p className="text-[10px] text-[var(--color-mute)]">{new Date(f.createdAt).toLocaleString()}</p>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleLike(f.id)}
                          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                            likedIds.has(f.id)
                              ? "bg-[var(--color-magenta)]/20 text-[var(--color-magenta)]"
                              : "bg-white/5 text-[var(--color-mute)] hover:text-[var(--color-magenta)]"
                          }`}
                        >
                          {likedIds.has(f.id) ? "♥" : "♡"} {f.likeCount}
                        </button>
                      </div>

                      {session?.user ? (
                        <div className="flex gap-2">
                          <input
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 rounded-lg border border-[var(--color-line)] bg-black/40 px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                            onKeyDown={(e) => e.key === "Enter" && handleComment(f.id)}
                          />
                          <button
                            onClick={() => handleComment(f.id)}
                            disabled={postingComment === f.id || !commentText.trim()}
                            className="rounded-lg bg-[var(--color-cyan)] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
                          >
                            {postingComment === f.id ? "..." : "Post"}
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-[var(--color-mute)]">
                          <Link href="/login" className="text-[var(--color-cyan)] hover:underline">Log in</Link> to comment.
                        </p>
                      )}

                      {comments[f.id] && comments[f.id].length > 0 && (
                        <div className="space-y-2">
                          {comments[f.id].map((c) => (
                            <div key={c.id} className="rounded-lg border border-[var(--color-line)] bg-black/20 p-3">
                              <div className="flex items-center gap-2 mb-1">
                                {c.user.avatar ? (
                                  <img src={c.user.avatar} alt="" className="w-5 h-5 rounded-full" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-[var(--color-line)] flex items-center justify-center text-[8px]">
                                    {c.user.username[0].toUpperCase()}
                                  </div>
                                )}
                                <span className="text-xs font-medium">{c.user.username}</span>
                                <span className="text-[10px] text-[var(--color-mute)]">{new Date(c.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm">{c.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

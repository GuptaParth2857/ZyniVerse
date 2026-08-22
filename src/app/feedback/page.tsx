"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import TiltCard from "@/components/TiltCard";

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

const TYPES: { value: string; label: string; icon: string; active: string }[] = [
  { value: "bug", label: "Bug Report", icon: "🐛", active: "bg-red-500/15 text-red-400 border-red-500/40 shadow-[0_0_15px_-5px_rgba(239,68,68,0.4)]" },
  { value: "suggestion", label: "Suggestion", icon: "💡", active: "bg-blue-500/15 text-blue-400 border-blue-500/40 shadow-[0_0_15px_-5px_rgba(59,130,246,0.4)]" },
  { value: "feature", label: "Feature", icon: "✨", active: "bg-green-500/15 text-green-400 border-green-500/40 shadow-[0_0_15px_-5px_rgba(34,197,94,0.4)]" },
  { value: "other", label: "Other", icon: "💬", active: "bg-gray-500/15 text-gray-400 border-gray-500/40 shadow-[0_0_15px_-5px_rgba(156,163,175,0.4)]" },
];

const typeColors: Record<string, string> = {
  bug: "bg-red-500/15 text-red-400",
  suggestion: "bg-blue-500/15 text-blue-400",
  feature: "bg-green-500/15 text-green-400",
  other: "bg-gray-500/15 text-gray-400",
};

const typeDots: Record<string, string> = {
  bug: "#f87171",
  suggestion: "#60a5fa",
  feature: "#4ade80",
  other: "#9ca3af",
};

function timeAgo(value: string) {
  const mins = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function FeedbackPage() {
  const { data: session } = useSession();
  const [featured, setFeatured] = useState<FeedbackItem[]>([]);
  const [allFeedback, setAllFeedback] = useState<FeedbackItem[]>([]);
  const [_total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, FeedbackComment[]>>({});
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState<string | null>(null);

  const [formType, setFormType] = useState("suggestion");
  const [formMessage, setFormMessage] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const pathname = usePathname();
  const [formPage, setFormPage] = useState(pathname || "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const loadAll = () => {
    Promise.all([
      fetch("/api/feedback/public?featured=true&limit=10").then((r) => r.json()),
      fetch(`/api/feedback/public?limit=50${typeFilter ? `&type=${typeFilter}` : ""}`).then((r) => r.json()),
    ]).then(([featuredData, allData]) => {
      setFeatured(featuredData.feedbacks || []);
      setAllFeedback(allData.feedbacks || []);
      setTotal(allData.total || 0);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (formMessage.trim().length < 5) {
      setFormError("Message must be at least 5 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formType,
          message: formMessage,
          page: formPage || null,
          email: formEmail.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to submit feedback");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
      setFormMessage("");
      setFormEmail("");
      setTimeout(() => setSubmitted(false), 3500);
      loadAll();
    } catch {
      setFormError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  const handleLike = async (id: string) => {
    if (!session) return;
    const res = await fetch(`/api/feedback/${id}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setLikedIds((prev) => {
        const next = new Set(prev);
        void (data.liked ? next.add(id) : next.delete(id));
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
    <PageTransition>
      <ErrorBoundary label="Feedback">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Community</p>
            <div className="neon-rgb-border rounded-xl px-4 py-2 inline-block">
              <h1 className="font-display text-3xl font-bold sm:text-4xl mt-1">Feedback</h1>
            </div>
            <p className="mt-2 text-sm text-[var(--color-mute)] max-w-2xl">
              See what the community is saying and share your thoughts. Every piece of feedback helps shape ZyniVerse.
            </p>
          </div>

          {/* Submit */}
          <TiltCard className="neon-premium rounded-[24px] mb-10">
            <div className="neon-premium-track" />
            <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
            <form onSubmit={handleSubmit} className="neon-premium-content rounded-[24px] p-6 sm:p-8">
              <div className="neon-rgb-border rounded-2xl px-4 py-3 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📮</span>
                  <div>
                    <h2 className="font-display text-lg font-bold leading-tight">Share Your Feedback</h2>
                    <p className="text-[11px] text-[var(--color-mute)]">Found a bug? Want a feature? Tell us — no login needed.</p>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-[11px] font-semibold text-[var(--color-mute)] mb-2">Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TYPES.map((t) => {
                    const selected = formType === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setFormType(t.value)}
                        className={`rounded-xl border px-3 py-2.5 text-xs font-medium transition-all ${
                          selected
                            ? t.active
                            : "border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-cyan)]/50 hover:text-[var(--color-ink)]"
                        }`}
                      >
                        <span className="mr-1.5">{t.icon}</span>
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-[11px] font-semibold text-[var(--color-mute)] mb-2">Message <span className="text-[var(--color-magenta)]">*</span></label>
                <textarea
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="Tell us what's on your mind..."
                  className="neon-rgb-border w-full resize-none rounded-xl bg-[var(--color-panel)] px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--color-mute)]/50"
                />
                <div className="mt-1 flex justify-between text-[10px] font-mono text-[var(--color-mute)]">
                  <span>{formMessage.trim().length < 5 ? "Min 5 characters" : "✓ Ready"}</span>
                  <span>{formMessage.length}/2000</span>
                </div>
              </div>

              <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-mute)] mb-2">Page (optional)</label>
                  <input
                    value={formPage}
                    onChange={(e) => setFormPage(e.target.value)}
                    placeholder="/anime/..."
                    className="neon-rgb-border w-full rounded-xl bg-[var(--color-panel)] px-4 py-2.5 text-sm font-mono outline-none transition-colors placeholder:text-[var(--color-mute)]/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-mute)] mb-2">Email (optional)</label>
                  <input
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    type="email"
                    placeholder="you@example.com"
                    className="neon-rgb-border w-full rounded-xl bg-[var(--color-panel)] px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-[var(--color-mute)]/50"
                  />
                </div>
              </div>

              {formError && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                  {formError}
                </div>
              )}

              <AnimatePresence>
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400 flex items-center gap-2"
                  >
                    <span>✓</span> Feedback submitted! Thanks for helping improve ZyniVerse.
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-[var(--color-magenta)] via-[#7000ff] to-[var(--color-cyan)] py-3.5 text-sm font-bold text-white shadow-[0_0_30px_-8px_rgba(255,0,230,0.3)] hover:shadow-[0_0_50px_-6px_rgba(255,0,230,0.5)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Feedback"
                )}
              </button>
            </form>
          </TiltCard>

          {/* Featured */}
          {featured.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-12">
              <div className="flex items-center gap-2 mb-5">
                <h2 className="font-display text-xl font-bold flex items-center gap-2">
                  <span className="text-[var(--color-amber)]">★</span> Featured
                </h2>
                <span className="h-px flex-1 bg-gradient-to-r from-[var(--color-line)] to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {featured.map((f) => (
                  <motion.div key={f.id} className="neon-premium rounded-[24px]">
                    <div className="neon-premium-track" />
                    <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
                    <div className="neon-premium-content relative overflow-hidden rounded-[24px] p-6">
                      {f.featuredImage && (
                        <div className="absolute inset-0 opacity-[0.08]">
                          <Image src={f.featuredImage} alt="" fill className="object-cover" sizes="50vw" />
                        </div>
                      )}
                      <div className="relative">
                        <span className="mb-3 inline-block rounded-full border border-[var(--color-amber)]/30 bg-[var(--color-amber)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-amber)]">
                          ★ Community Highlight
                        </span>
                        {f.featuredHeading && <h3 className="font-display text-xl font-bold mt-2">{f.featuredHeading}</h3>}
                        {f.featuredDescription && <p className="mt-1 text-sm text-[var(--color-mute)]">{f.featuredDescription}</p>}
                        <p className="mt-3 text-sm leading-relaxed line-clamp-3">{f.message}</p>
                        <div className="mt-5 flex items-center gap-5 border-t border-[var(--color-line)]/60 pt-4">
                          <button
                            onClick={() => handleLike(f.id)}
                            className={`flex items-center gap-1.5 text-xs transition-colors ${likedIds.has(f.id) ? "text-[var(--color-magenta)]" : "text-[var(--color-mute)] hover:text-[var(--color-magenta)]"}`}
                          >
                            <span className={`text-base ${likedIds.has(f.id) ? "" : "opacity-70"}`}>{likedIds.has(f.id) ? "♥" : "♡"}</span>
                            {f.likeCount}
                          </button>
                          <button
                            onClick={() => { setExpandedId(expandedId === f.id ? null : f.id); loadComments(f.id); }}
                            className="flex items-center gap-1.5 text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] transition-colors"
                          >
                            <span className="text-base">💬</span> {f.replyCount}
                          </button>
                          <span className="ml-auto text-[10px] font-mono text-[var(--color-mute)]">{timeAgo(f.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* All feedback */}
          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold">All Feedback</h2>
                <span className="rounded-full bg-[var(--color-panel)] border border-[var(--color-line)] px-2.5 py-0.5 text-[10px] font-mono text-[var(--color-mute)]">
                  {_total}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[{ value: "", label: "All" }, ...TYPES.map((t) => ({ value: t.value, label: t.label }))].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTypeFilter(opt.value)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-all border ${
                      typeFilter === opt.value
                        ? "border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 text-[var(--color-cyan)]"
                        : "border-[var(--color-line)] text-[var(--color-mute)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-[var(--color-panel)] animate-pulse" />
                ))}
              </div>
            ) : allFeedback.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--color-line)] py-20 text-center">
                <p className="text-3xl mb-2">🗒️</p>
                <p className="text-sm text-[var(--color-mute)]">No feedback here yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allFeedback.map((f, i) => {
                  const isExpanded = expandedId === f.id;
                  const isLiked = likedIds.has(f.id);
                  return (
                    <TiltCard
                      key={f.id}
                      index={i}
                      className="neon-premium rounded-[24px]"
                    >
                      <div className="neon-premium-track" />
                      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
                      <div className="neon-premium-content rounded-[24px] overflow-hidden">
                      <div
                        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                        onClick={() => { setExpandedId(isExpanded ? null : f.id); loadComments(f.id); }}
                      >
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: typeDots[f.type] || typeDots.other }} />
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shrink-0 ${typeColors[f.type] || typeColors.other}`}>
                          {f.type}
                        </span>
                        {f.isFeatured && <span className="text-[var(--color-amber)] text-xs shrink-0">★</span>}
                        <p className={`flex-1 text-sm min-w-0 ${isExpanded ? "" : "truncate"}`}>{f.message}</p>
                        <span className="flex items-center gap-3 text-[10px] font-mono text-[var(--color-mute)] shrink-0">
                          <span className={isLiked ? "text-[var(--color-magenta)]" : ""}>♥ {f.likeCount}</span>
                          <span>💬 {f.replyCount}</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </span>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="border-t border-[var(--color-line)]"
                          >
                            <div className="p-4 space-y-4">
                              <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-[var(--color-mute)]">
                                {f.page && <span className="rounded-full bg-black/30 border border-[var(--color-line)] px-2.5 py-1">📍 {f.page}</span>}
                                <span>🕒 {new Date(f.createdAt).toLocaleString()}</span>
                              </div>

                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleLike(f.id)}
                                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all border ${
                                    isLiked
                                      ? "bg-[var(--color-magenta)]/15 text-[var(--color-magenta)] border-[var(--color-magenta)]/30"
                                      : "bg-white/5 text-[var(--color-mute)] border-transparent hover:text-[var(--color-magenta)]"
                                  }`}
                                >
                                  {isLiked ? "♥" : "♡"} {f.likeCount}
                                </button>
                              </div>

                              {session?.user ? (
                                <div className="flex gap-2">
                                  <input
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="neon-rgb-border flex-1 rounded-lg bg-black/40 px-3 py-2 text-sm outline-none placeholder:text-[var(--color-mute)]/50"
                                    onKeyDown={(e) => e.key === "Enter" && handleComment(f.id)}
                                  />
                                  <button
                                    onClick={() => handleComment(f.id)}
                                    disabled={postingComment === f.id || !commentText.trim()}
                                    className="neon-rgb-border rounded-lg bg-[var(--color-panel)] px-4 py-2 text-sm font-semibold text-[var(--color-cyan)] transition-all hover:text-[var(--color-ink)] disabled:opacity-50 disabled:pointer-events-none"
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
                                          <Image src={c.user.avatar} alt="" width={20} height={20} className="w-5 h-5 rounded-full" />
                                        ) : (
                                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-cyan)] flex items-center justify-center text-[9px] font-bold text-black">
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
                          </motion.div>
                        )}
                      </AnimatePresence>
                      </div>
                    </TiltCard>
                  );
                })}
              </div>
            )}
          </motion.section>
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}

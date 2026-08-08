"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FeedbackReply {
  id: string;
  message: string;
  createdAt: string;
  user: { id: string; username: string; avatar: string | null };
}

interface Feedback {
  id: string;
  type: string;
  message: string;
  page: string | null;
  email: string | null;
  userId: string | null;
  status: string;
  isFeatured: boolean;
  featuredHeading: string | null;
  featuredDescription: string | null;
  featuredImage: string | null;
  likeCount: number;
  replyCount: number;
  createdAt: string;
  author: { username: string; avatar: string | null } | null;
  replies: FeedbackReply[];
  _count: { likes: number; comments: number };
}

interface Stats {
  total: number;
  pending: number;
  replied: number;
  resolved: number;
  featured: number;
  today: number;
}

const TYPE_META: Record<string, { label: string; color: string }> = {
  bug: { label: "Bug", color: "#f87171" },
  suggestion: { label: "Suggestion", color: "#60a5fa" },
  feature: { label: "Feature", color: "#4ade80" },
  other: { label: "Other", color: "#a1a1aa" },
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "#f59e0b" },
  replied: { label: "Replied", color: "#29f2e0" },
  resolved: { label: "Resolved", color: "#4ade80" },
};

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "bug", label: "Bug" },
  { value: "suggestion", label: "Suggestion" },
  { value: "feature", label: "Feature" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "replied", label: "Replied" },
  { value: "resolved", label: "Resolved" },
];

function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(from + (target - from) * eased);
      fromRef.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function formatSeen(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function KpiCard({ icon, label, value, color, sub }: { icon: string; label: string; value: number; color: string; sub?: string }) {
  const n = useCountUp(value);
  return (
    <div className="neon-premium rounded-[20px]">
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.92)" }} />
      <div className="neon-premium-content rounded-[20px] p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">{label}</p>
          <span className="text-base" style={{ filter: `drop-shadow(0 0 6px ${color}aa)` }}>{icon}</span>
        </div>
        <p className="mt-2 font-mono text-2xl font-bold" style={{ color }}>{n.toLocaleString("en-IN")}</p>
        {sub && <p className="mt-1 text-[10px] font-mono text-[var(--color-mute)]">{sub}</p>}
      </div>
    </div>
  );
}

function FilterPill({ active, color, label, onClick }: { active: boolean; color: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border px-3 py-1.5 text-xs font-mono transition-all"
      style={
        active
          ? { borderColor: `${color}66`, color, background: `${color}1a`, boxShadow: `0 0 12px ${color}33` }
          : { borderColor: "var(--color-line)", color: "var(--color-mute)", background: "var(--color-panel)" }
      }
    >
      {label}
    </button>
  );
}

function Badge({ color, label, filled }: { color: string; label: string; filled?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{
        color,
        background: filled ? `${color}22` : "transparent",
        border: `1px solid ${color}55`,
        boxShadow: `0 0 10px ${color}22`,
      }}
    >
      {label}
    </span>
  );
}

function FeedbackCard({
  feedback,
  expanded,
  onToggle,
  replyText,
  setReplyText,
  replying,
  onReply,
  onStatus,
  onFeatureOpen,
  onDelete,
}: {
  feedback: Feedback;
  expanded: boolean;
  onToggle: () => void;
  replyText: string;
  setReplyText: (v: string) => void;
  replying: boolean;
  onReply: (id: string) => void;
  onStatus: (id: string, status: string) => void;
  onFeatureOpen: (f: Feedback) => void;
  onDelete: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const type = TYPE_META[feedback.type] || TYPE_META.other;
  const status = STATUS_META[feedback.status] || STATUS_META.pending;
  const authorName = feedback.author?.username || (feedback.email ? feedback.email.split("@")[0] : "Anonymous");

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const px = (e.clientX - cx) / (rect.width / 2);
    const py = (e.clientY - cy) / (rect.height / 2);
    el.style.transform = `perspective(900px) rotateY(${px * 4}deg) rotateX(${-py * 4}deg) scale(1.015)`;
  }, []);

  const handlePointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)";
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="neon-premium rounded-[20px]"
      style={{ transition: "transform 0.2s ease-out" }}
    >
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.94)" }} />
      <div className="neon-premium-content rounded-[20px]">
        <button
          onClick={onToggle}
          className="w-full p-5 text-left transition-colors hover:bg-white/[0.02]"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={type.color} label={type.label} />
            <Badge color={status.color} label={status.label} />
            {feedback.isFeatured && <Badge color="#ffd700" label="★ Featured" filled />}
            <span className="ml-auto font-mono text-[10px] text-[var(--color-mute)]">{formatSeen(feedback.createdAt)}</span>
          </div>

          <p className={`mt-3 text-sm leading-relaxed ${expanded ? "text-[var(--color-ink)]" : "line-clamp-2 text-[var(--color-ink)]/90"}`}>
            {feedback.message}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--color-mute)]">
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: type.color, boxShadow: `0 0 6px ${type.color}` }} />
              {authorName}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--color-mute)]">
              ♥ <span style={{ color: "#f43f5e" }}>{feedback.likeCount}</span>
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--color-mute)]">
              💬 <span style={{ color: "#60a5fa" }}>{feedback.replyCount}</span>
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--color-mute)]">
              📝 <span style={{ color: "#c084fc" }}>{feedback._count.comments}</span>
            </span>
            <span
              className={`ml-auto font-mono text-[10px] transition-all ${expanded ? "text-[var(--color-cyan)]" : "text-[var(--color-mute)]"}`}
            >
              {expanded ? "▲ Close" : "▼ Open"}
            </span>
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="border-t border-[var(--color-line)] p-5">
                <p className="text-sm leading-relaxed text-[var(--color-ink)]">{feedback.message}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {feedback.author?.username && (
                    <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-void)]/60 px-2.5 py-0.5 text-[10px] font-mono text-[var(--color-mute)]">
                      @{feedback.author.username}
                    </span>
                  )}
                  {feedback.page && (
                    <span className="rounded-full border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-2.5 py-0.5 text-[10px] font-mono text-[var(--color-cyan)]">
                      {feedback.page}
                    </span>
                  )}
                  {feedback.email && (
                    <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-void)]/60 px-2.5 py-0.5 text-[10px] font-mono text-[var(--color-mute)]">
                      {feedback.email}
                    </span>
                  )}
                </div>

                {feedback.replies.length > 0 && (
                  <div className="mt-5 space-y-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-mute)]">Admin Replies</p>
                    {feedback.replies.map((r) => (
                      <div key={r.id} className="flex items-start gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold"
                          style={{ color: "var(--color-cyan)", borderColor: "rgba(41,242,224,0.4)", background: "rgba(41,242,224,0.08)" }}
                        >
                          {r.user.username ? r.user.username[0].toUpperCase() : "A"}
                        </div>
                        <div className="min-w-0 flex-1 rounded-xl border border-[var(--color-cyan)]/15 bg-[var(--color-cyan)]/5 px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[var(--color-cyan)]">{r.user.username}</span>
                            <span className="font-mono text-[10px] text-[var(--color-mute)]">{formatSeen(r.createdAt)}</span>
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink)]">{r.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  {(Object.keys(STATUS_META) as string[]).map((s) => {
                    const meta = STATUS_META[s];
                    const active = feedback.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => onStatus(feedback.id, s)}
                        className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                        style={
                          active
                            ? { color: meta.color, background: `${meta.color}22`, border: `1px solid ${meta.color}66`, boxShadow: `0 0 12px ${meta.color}33` }
                            : { color: "var(--color-mute)", background: "white/5", border: "1px solid var(--color-line)" }
                        }
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => onFeatureOpen(feedback)}
                    className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                    style={
                      feedback.isFeatured
                        ? { color: "#ffd700", background: "#ffd7001a", border: "1px solid #ffd70066", boxShadow: "0 0 12px #ffd70033" }
                        : { color: "var(--color-mute)", background: "white/5", border: "1px solid var(--color-line)" }
                    }
                  >
                    {feedback.isFeatured ? "★ Unfeature" : "☆ Feature"}
                  </button>
                  <button
                    onClick={() => onDelete(feedback.id)}
                    className="ml-auto rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>

                <div className="mt-5 flex gap-2">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${authorName}...`}
                    className="flex-1 rounded-full border border-[var(--color-line)] bg-black/40 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-cyan)]"
                    onKeyDown={(e) => e.key === "Enter" && onReply(feedback.id)}
                  />
                  <button
                    onClick={() => onReply(feedback.id)}
                    disabled={replying || !replyText.trim()}
                    className="rounded-full neon-rgb-border bg-[var(--color-void)]/60 px-5 py-2.5 text-sm font-semibold text-[var(--color-cyan)] transition-opacity hover:text-[var(--color-ink)] disabled:opacity-40"
                  >
                    {replying ? "Sending..." : "Reply"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function FeatureModal({
  feedback,
  onCancel,
  onSave,
}: {
  feedback: Feedback;
  onCancel: () => void;
  onSave: (heading: string, desc: string, image: string) => void;
}) {
  const [heading, setHeading] = useState(feedback.featuredHeading || "");
  const [desc, setDesc] = useState(feedback.featuredDescription || "");
  const [image, setImage] = useState(feedback.featuredImage || "");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.94, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 14 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="neon-premium w-full max-w-lg rounded-[20px]"
      >
        <div className="neon-premium-track" />
        <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.96)" }} />
        <div className="neon-premium-content rounded-[20px] p-6">
          <div className="flex items-center gap-3">
            <span className="text-xl" style={{ filter: "drop-shadow(0 0 8px #ffd700aa)" }}>⭐</span>
            <h2 className="font-display text-lg font-bold text-[var(--color-ink)]">
              {feedback.isFeatured ? "Edit Featured Card" : "Feature This Feedback"}
            </h2>
          </div>
          <p className="mt-3 line-clamp-2 rounded-xl border border-[var(--color-line)] bg-black/30 px-4 py-3 text-sm text-[var(--color-mute)]">
            &ldquo;{feedback.message}&rdquo;
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">Custom Heading</label>
              <input
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="e.g. Great suggestion!"
                className="w-full rounded-xl border border-[var(--color-line)] bg-black/40 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-amber)]"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">Description</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Optional description for the card..."
                rows={3}
                className="w-full resize-none rounded-xl border border-[var(--color-line)] bg-black/40 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-amber)]"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">Image URL</label>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://... (optional)"
                className="w-full rounded-xl border border-[var(--color-line)] bg-black/40 px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-amber)]"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium text-[var(--color-mute)] transition-colors hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(heading, desc, image)}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#ffd700]/80 to-[#f59e0b] px-4 py-2.5 text-sm font-bold text-black transition-opacity hover:opacity-90"
            >
              {feedback.isFeatured ? "Update & Unfeature" : "Feature It"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CardSkeleton() {
  return (
    <div className="neon-premium animate-pulse rounded-[20px]">
      <div className="neon-premium-track" />
      <div className="neon-premium-overlay" style={{ background: "rgba(10,10,15,0.94)" }} />
      <div className="neon-premium-content rounded-[20px] p-5">
        <div className="flex gap-2">
          <div className="h-5 w-20 rounded-full bg-white/5" />
          <div className="h-5 w-16 rounded-full bg-white/5" />
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full rounded bg-white/10" />
          <div className="h-3 w-3/4 rounded bg-white/5" />
        </div>
        <div className="mt-4 flex gap-4">
          <div className="h-2.5 w-24 rounded bg-white/5" />
          <div className="h-2.5 w-16 rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [total, setTotal] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState<string | null>(null);
  const [featureModal, setFeatureModal] = useState<Feedback | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const fetchPage = useCallback(
    async (from: number) => {
      if (from === 0) setInitialLoading(true);
      else setLoadingMore(true);
      const params = new URLSearchParams();
      if (typeFilter) params.set("type", typeFilter);
      if (statusFilter) params.set("status", statusFilter);
      params.set("limit", "20");
      params.set("offset", String(from));

      const res = await fetch(`/api/admin/feedback?${params}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setTotal(data.total);
        setFeedbacks((prev) => (from === 0 ? data.feedbacks : [...prev, ...data.feedbacks]));
        setLastUpdated(new Date());
      }
      setInitialLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    },
    [typeFilter, statusFilter]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPage(0);
  }, [fetchPage]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPage(0);
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    setReplying(id);
    const res = await fetch(`/api/admin/feedback/${id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: replyText }),
    });
    setReplying(null);
    if (res.ok) {
      setReplyText("");
      showToast("Reply sent to the user");
      fetchPage(0);
    } else {
      showToast("Failed to send reply");
    }
  };

  const handleStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/feedback/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) showToast(`Marked as ${status}`);
    fetchPage(0);
  };

  const handleFeature = async (heading: string, desc: string, image: string) => {
    if (!featureModal) return;
    const res = await fetch(`/api/admin/feedback/${featureModal.id}/feature`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isFeatured: !featureModal.isFeatured,
        featuredHeading: heading || null,
        featuredDescription: desc || null,
        featuredImage: image || null,
      }),
    });
    setFeatureModal(null);
    if (res.ok) showToast(featureModal.isFeatured ? "Removed from featured" : "Feedback is now featured on the homepage");
    fetchPage(0);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this feedback permanently?")) return;
    const res = await fetch(`/api/admin/feedback/${id}`, { method: "DELETE" });
    if (res.ok) showToast("Feedback deleted");
    fetchPage(0);
  };

  const hasMore = feedbacks.length < total;

  return (
    <div className="mx-auto max-w-6xl">
      <section className="mb-8">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-magenta)]/40 bg-[var(--color-magenta)]/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)] shadow-[0_0_16px_rgba(255,64,146,0.25)]">
          ✦ Feedback Inbox
        </p>
        <div className="neon-rgb-border inline-block rounded-2xl px-5 py-3">
          <h1 className="bg-gradient-to-r from-[var(--color-cyan)] via-white to-[var(--color-magenta)] bg-clip-text font-display text-3xl font-bold text-transparent sm:text-4xl">
            Feedback Control
          </h1>
        </div>
        <p className="mt-4 max-w-2xl text-sm text-[var(--color-mute)]">
          Community submissions from the feedback form — review, reply, feature and resolve everything in real time.
        </p>
      </section>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 text-xs font-mono text-[var(--color-mute)]">
          {stats ? `${stats.total} total submissions` : "Loading..."}
        </span>
        <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-2 font-mono text-xs text-[var(--color-mute)]">
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString("en-IN")}` : "Waiting for first update"}
        </span>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 rounded-full neon-rgb-border bg-[var(--color-void)]/60 px-4 py-2 text-xs font-mono text-[var(--color-mute)] transition-colors hover:text-[var(--color-cyan)]"
        >
          <span className={`inline-block h-2 w-2 rounded-full bg-[var(--color-cyan)] ${refreshing ? "animate-ping" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh now"}
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <KpiCard icon="💬" label="Total Submissions" value={stats.total} color="var(--color-cyan)" sub="all time" />
          <KpiCard icon="🕐" label="Pending" value={stats.pending} color="#f59e0b" sub="needs attention" />
          <KpiCard icon="↩️" label="Replied" value={stats.replied} color="#29f2e0" sub="awaiting user" />
          <KpiCard icon="✅" label="Resolved" value={stats.resolved} color="#4ade80" sub="closed" />
          <KpiCard icon="⭐" label="Featured" value={stats.featured} color="#ffd700" sub="on homepage" />
          <KpiCard icon="📅" label="Today" value={stats.today} color="#ff2d78" sub="new today" />
        </div>
      )}

      <div className="mt-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {TYPE_OPTIONS.map((t) => (
            <FilterPill
              key={t.value || "all-type"}
              active={typeFilter === t.value}
              color={TYPE_META[t.value]?.color || "var(--color-cyan)"}
              label={t.label}
              onClick={() => setTypeFilter(t.value)}
            />
          ))}
          <span className="mx-2 h-5 w-px bg-[var(--color-line)]" />
          {STATUS_OPTIONS.map((s) => (
            <FilterPill
              key={s.value || "all-status"}
              active={statusFilter === s.value}
              color={STATUS_META[s.value]?.color || "var(--color-cyan)"}
              label={s.label}
              onClick={() => setStatusFilter(s.value)}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <p className="text-sm text-[var(--color-mute)]">
            Showing <span className="font-semibold text-[var(--color-cyan)]">{feedbacks.length}</span> of{" "}
            <span className="font-semibold text-[var(--color-ink)]">{total}</span> submissions
          </p>
          <span className="h-px flex-1 bg-gradient-to-r from-[var(--color-line)] to-transparent" />
        </div>

        {initialLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)]/50 px-6 py-16">
            <p className="text-lg text-[var(--color-mute)]">No feedback found</p>
            <p className="text-sm text-[var(--color-mute)]/70">
              {typeFilter || statusFilter ? "Try changing the filters." : "When someone submits feedback, it appears here."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {feedbacks.map((f) => (
              <FeedbackCard
                key={f.id}
                feedback={f}
                expanded={expandedId === f.id}
                onToggle={() => setExpandedId(expandedId === f.id ? null : f.id)}
                replyText={replyText}
                setReplyText={setReplyText}
                replying={replying === f.id}
                onReply={handleReply}
                onStatus={handleStatus}
                onFeatureOpen={setFeatureModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="pt-4 text-center">
            <button
              onClick={() => fetchPage(feedbacks.length)}
              disabled={loadingMore}
              className="rounded-full neon-rgb-border bg-[var(--color-void)]/60 px-6 py-2.5 text-sm font-mono text-[var(--color-cyan)] transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {loadingMore ? "Loading more..." : `Load more (${total - feedbacks.length} remaining)`}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {featureModal && (
          <FeatureModal key={featureModal.id} feedback={featureModal} onCancel={() => setFeatureModal(null)} onSave={handleFeature} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-[var(--color-cyan)]/40 bg-black/90 px-5 py-2.5 font-mono text-xs text-[var(--color-cyan)] shadow-[0_0_20px_rgba(41,242,224,0.25)]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

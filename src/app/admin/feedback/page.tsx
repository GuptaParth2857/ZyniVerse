"use client";

import { useEffect, useState, useCallback } from "react";

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
  status: string;
  isFeatured: boolean;
  featuredHeading: string | null;
  featuredDescription: string | null;
  featuredImage: string | null;
  likeCount: number;
  replyCount: number;
  createdAt: string;
  replies: FeedbackReply[];
  _count: { likes: number; comments: number };
}

const typeColors: Record<string, string> = {
  bug: "bg-red-500/20 text-red-400",
  suggestion: "bg-blue-500/20 text-blue-400",
  feature: "bg-green-500/20 text-green-400",
  other: "bg-gray-500/20 text-gray-400",
};

const statusColors: Record<string, string> = {
  pending: "bg-[var(--color-amber)]/20 text-[var(--color-amber)]",
  replied: "bg-[var(--color-cyan)]/20 text-[var(--color-cyan)]",
  resolved: "bg-green-500/20 text-green-400",
};

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState<string | null>(null);
  const [featureModal, setFeatureModal] = useState<Feedback | null>(null);
  const [featureHeading, setFeatureHeading] = useState("");
  const [featureDesc, setFeatureDesc] = useState("");
  const [featureImage, setFeatureImage] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    if (statusFilter) params.set("status", statusFilter);
    params.set("limit", "50");

    const res = await fetch(`/api/admin/feedback?${params}`);
    if (res.ok) {
      const data = await res.json();
      setFeedbacks(data.feedbacks);
      setTotal(data.total);
    }
    setLoading(false);
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    setReplying(id);
    const res = await fetch(`/api/admin/feedback/${id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: replyText }),
    });
    if (res.ok) {
      setReplyText("");
      fetchFeedbacks();
    }
    setReplying(null);
  };

  const handleStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/feedback/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchFeedbacks();
  };

  const handleFeature = async () => {
    if (!featureModal) return;
    setSaving(true);
    await fetch(`/api/admin/feedback/${featureModal.id}/feature`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isFeatured: !featureModal.isFeatured,
        featuredHeading: featureHeading || null,
        featuredDescription: featureDesc || null,
        featuredImage: featureImage || null,
      }),
    });
    setFeatureModal(null);
    setSaving(false);
    fetchFeedbacks();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this feedback?")) return;
    await fetch(`/api/admin/feedback/${id}`, { method: "DELETE" });
    fetchFeedbacks();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Admin</p>
      <h1 className="font-display text-3xl font-bold mt-1">Feedback Management</h1>
      <p className="mt-1 text-sm text-[var(--color-mute)]">{total} total submissions</p>

      <div className="flex flex-wrap gap-3 mt-6">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-sm outline-none"
        >
          <option value="">All Types</option>
          <option value="bug">Bug Report</option>
          <option value="suggestion">Suggestion</option>
          <option value="feature">Feature Request</option>
          <option value="other">Other</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-sm outline-none"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="replied">Replied</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[var(--color-mute)] text-sm">Loading...</div>
      ) : feedbacks.length === 0 ? (
        <div className="py-20 text-center text-[var(--color-mute)] text-sm">No feedback found.</div>
      ) : (
        <div className="mt-6 space-y-3">
          {feedbacks.map((f) => (
            <div key={f.id} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] overflow-hidden">
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}
              >
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase shrink-0 ${typeColors[f.type] || typeColors.other}`}>
                  {f.type}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase shrink-0 ${statusColors[f.status] || statusColors.pending}`}>
                  {f.status}
                </span>
                {f.isFeatured && (
                  <span className="rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-[var(--color-amber)]/20 text-[var(--color-amber)]">★ Featured</span>
                )}
                <p className="flex-1 text-sm truncate">{f.message}</p>
                <span className="text-[10px] text-[var(--color-mute)] shrink-0">
                  ♥ {f.likeCount} · 💬 {f.replyCount}
                </span>
                <span className="text-[10px] text-[var(--color-mute)] shrink-0">
                  {new Date(f.createdAt).toLocaleDateString()}
                </span>
              </div>

              {expandedId === f.id && (
                <div className="border-t border-[var(--color-line)] p-4 space-y-4">
                  <div>
                    <p className="text-sm mb-2">{f.message}</p>
                    {f.page && <p className="text-[10px] text-[var(--color-mute)]">Page: {f.page}</p>}
                    {f.email && <p className="text-[10px] text-[var(--color-mute)]">Email: {f.email}</p>}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(["pending", "replied", "resolved"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatus(f.id, s)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                          f.status === s
                            ? "bg-[var(--color-cyan)]/20 text-[var(--color-cyan)]"
                            : "bg-white/5 text-[var(--color-mute)] hover:bg-white/10"
                        }`}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setFeatureModal(f);
                        setFeatureHeading(f.featuredHeading || "");
                        setFeatureDesc(f.featuredDescription || "");
                        setFeatureImage(f.featuredImage || "");
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        f.isFeatured
                          ? "bg-[var(--color-amber)]/20 text-[var(--color-amber)]"
                          : "bg-white/5 text-[var(--color-mute)] hover:bg-white/10"
                      }`}
                    >
                      {f.isFeatured ? "★ Unfeature" : "☆ Feature"}
                    </button>
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all ml-auto"
                    >
                      Delete
                    </button>
                  </div>

                  {f.replies.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-[var(--color-mute)] uppercase tracking-wider">Admin Replies</p>
                      {f.replies.map((r) => (
                        <div key={r.id} className="rounded-lg bg-[var(--color-cyan)]/5 border border-[var(--color-cyan)]/10 p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-[var(--color-cyan)]">{r.user.username}</span>
                            <span className="text-[10px] text-[var(--color-mute)]">{new Date(r.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-sm">{r.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 rounded-lg border border-[var(--color-line)] bg-black/40 px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors"
                      onKeyDown={(e) => e.key === "Enter" && handleReply(f.id)}
                    />
                    <button
                      onClick={() => handleReply(f.id)}
                      disabled={replying === f.id || !replyText.trim()}
                      className="rounded-lg bg-[var(--color-cyan)] px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {replying === f.id ? "..." : "Reply"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {featureModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setFeatureModal(null)}>
          <div className="w-full max-w-lg rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">{featureModal.isFeatured ? "Edit Featured" : "Feature This Feedback"}</h2>
            <p className="text-sm text-[var(--color-mute)] mb-4 truncate">&quot;{featureModal.message}&quot;</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--color-mute)] mb-1 block">Custom Heading</label>
                <input
                  value={featureHeading}
                  onChange={(e) => setFeatureHeading(e.target.value)}
                  placeholder="e.g. Great suggestion!"
                  className="w-full rounded-lg border border-[var(--color-line)] bg-black/40 px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--color-mute)] mb-1 block">Description</label>
                <textarea
                  value={featureDesc}
                  onChange={(e) => setFeatureDesc(e.target.value)}
                  placeholder="Optional description for the card..."
                  rows={3}
                  className="w-full rounded-lg border border-[var(--color-line)] bg-black/40 px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--color-mute)] mb-1 block">Image URL</label>
                <input
                  value={featureImage}
                  onChange={(e) => setFeatureImage(e.target.value)}
                  placeholder="https://... (optional)"
                  className="w-full rounded-lg border border-[var(--color-line)] bg-black/40 px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setFeatureModal(null)}
                className="flex-1 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFeature}
                disabled={saving}
                className="flex-1 rounded-lg bg-[var(--color-cyan)] px-4 py-2 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {saving ? "Saving..." : featureModal.isFeatured ? "Update & Unfeature" : "Feature It"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";

interface CommunityTag {
  id: string;
  tag: string;
  upvotes: number;
  downvotes: number;
  score: number;
  myVote: number;
}

export default function CommunityTagPanel({ mediaId }: { mediaId: number }) {
  const [tags, setTags] = useState<CommunityTag[]>([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch(`/api/community-tags/${mediaId}`);
      const data = await res.json();
      setTags(data.tags || []);
    } catch {}
    setLoading(false);
  }, [mediaId]);

  useEffect(() => { fetchTags(); }, [fetchTags]);

  const handleVote = async (communityTagId: string, vote: number) => {
    await fetch("/api/community-tags/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ communityTagId, vote }),
    });
    fetchTags();
  };

  const handleCreate = async () => {
    if (!newTag.trim() || submitting) return;
    setSubmitting(true);
    await fetch("/api/community-tags/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaId, tag: newTag.trim(), vote: 1 }),
    });
    setNewTag("");
    setSubmitting(false);
    fetchTags();
  };

  if (loading) return <div className="animate-pulse h-24 bg-white/5 rounded-xl" />;

  return (
    <div>
      <h3 className="text-sm font-semibold text-white/70 mb-2">Community Tags</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((t) => (
          <div key={t.id} className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5">
            <button
              onClick={() => handleVote(t.id, t.myVote === 1 ? 0 : 1)}
              className={`px-3 py-1.5 text-xs rounded-l-full transition-colors ${
                t.myVote === 1
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-white/60 hover:text-white/80"
              }`}
            >
              ▲ {t.upvotes}
            </button>
            <span className="text-xs text-white/80 px-1">{t.tag}</span>
            <button
              onClick={() => handleVote(t.id, t.myVote === -1 ? 0 : -1)}
              className={`px-3 py-1.5 text-xs rounded-r-full transition-colors ${
                t.myVote === -1
                  ? "bg-pink-500/20 text-pink-400"
                  : "text-white/60 hover:text-white/80"
              }`}
            >
              ▼ {t.downvotes}
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="Add a tag..."
          className="flex-1 px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50"
        />
        <button
          onClick={handleCreate}
          disabled={!newTag.trim() || submitting}
          className="px-3 py-1.5 text-xs bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 disabled:opacity-30"
        >
          + Add
        </button>
      </div>
    </div>
  );
}

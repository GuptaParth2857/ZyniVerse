"use client";

import { useEffect, useState } from "react";

const COMMON_TAGS = ["Underrated", "Overrated", "Masterpiece", "Guilty Pleasure", "Classic", "Hidden Gem", "Overhyped", "Slow Burn", "Binge-Worthy", "Emotional", "Mind-Bending", "Feel-Good", "Dark", "Wholesome", "Action-Packed", "Thought-Provoking", "Nostalgic", "Underwatched"];

export default function TagVotePanel({ mediaId }: { mediaId: number }) {
  const [tags, setTags] = useState<{ tag: string; score: number; votes: number }[]>([]);
  const [myVotes, setMyVotes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tags/${mediaId}`)
      .then((r) => r.json())
      .then((d) => { setTags(d.tags || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mediaId]);

  const vote = async (tag: string) => {
    const newVote = myVotes[tag] === 1 ? 0 : 1;
    setMyVotes((prev) => ({ ...prev, [tag]: newVote }));
    await fetch("/api/tags/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaId, tag, vote: newVote }),
    });
    const resp = await fetch(`/api/tags/${mediaId}`);
    const d = await resp.json();
    setTags(d.tags || []);
  };

  if (loading) return <div className="animate-pulse h-24 bg-white/5 rounded-xl" />;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {COMMON_TAGS.map((tag) => {
          const active = myVotes[tag] === 1;
          const tagData = tags.find((t) => t.tag === tag);
          return (
            <button key={tag} onClick={() => vote(tag)}
              className={`px-5 py-2.5 text-xs rounded-full border transition-colors ${
                active ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "border-white/10 text-white/60 hover:border-white/30"
              }`}>
              {tag} {tagData ? `(${tagData.votes})` : ""}
            </button>
          );
        })}
      </div>
      {tags.length > 0 && (
        <div className="text-xs text-white/40">
          Top tagged: {tags.slice(0, 5).map((t) => `${t.tag} (${t.score})`).join(", ")}
        </div>
      )}
    </div>
  );
}

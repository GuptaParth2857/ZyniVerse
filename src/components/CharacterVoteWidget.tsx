"use client";

import { useEffect, useState } from "react";

export default function CharacterVoteWidget({ characterId, mediaId, characterName, characterImage }: {
  characterId: number; mediaId: number; characterName: string; characterImage: string;
}) {
  const [total, setTotal] = useState(0);
  const [voters, setVoters] = useState(0);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/characters/vote/${characterId}`)
      .then((r) => r.json())
      .then((d) => { setTotal(d.totalVotes || 0); setVoters(d.voterCount || 0); setLoading(false); })
      .catch(() => setLoading(false));
  }, [characterId]);

  const vote = async () => {
    try {
      const resp = await fetch("/api/characters/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId, mediaId, vote: 1 }),
      });
      const d = await resp.json();
      setTotal(d.totalVotes || total + 1);
      setVoters(d.voterCount || voters + 1);
      setVoted(true);
    } catch {}
  };

  if (loading) return null;

  return (
    <div className="flex items-center gap-2">
      <button onClick={vote} disabled={voted}
        className={`p-1.5 rounded-lg transition-colors ${voted ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"}`}>
        <svg className="w-4 h-4" fill={voted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
      </button>
      <div className="text-xs">
        <span className="text-white/80 font-medium">{total}</span>
        <span className="text-white/30 ml-1">({voters})</span>
      </div>
    </div>
  );
}

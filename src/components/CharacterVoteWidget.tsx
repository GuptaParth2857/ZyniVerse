"use client";

import { useEffect, useState } from "react";
import { logError } from "@/lib/logger";
import { loadCharacterVoteStats, setCharacterVoteStats } from "@/lib/character-votes-client";

export default function CharacterVoteWidget({ characterId, mediaId }: {
  characterId: number; mediaId: number;
}) {
  const [total, setTotal] = useState(0);
  const [voters, setVoters] = useState(0);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    loadCharacterVoteStats(characterId)
      .then((d) => {
        if (!alive) return;
        setTotal(d.totalVotes);
        setVoters(d.voterCount);
        setLoading(false);
      })
      .catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [characterId]);

  const vote = async () => {
    try {
      const resp = await fetch("/api/characters/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId, mediaId, vote: 1 }),
      });
      const d = await resp.json();
      const nextTotal = d.totalVotes || total + 1;
      const nextVoters = d.voterCount || voters + 1;
      setTotal(nextTotal);
      setVoters(nextVoters);
      setCharacterVoteStats(characterId, { totalVotes: nextTotal, voterCount: nextVoters });
      setVoted(true);
    } catch (e) { logError(e); }
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

"use client";

import { useState } from "react";

interface Nominee {
  id: string;
  mediaId: number;
  title: string;
  image: string | null;
  votes: number;
}

export default function AwardVotingCard({
  category,
  categoryName,
  emoji,
  nominees,
  year,
  onVote,
  status,
}: {
  category: string;
  categoryName: string;
  emoji: string;
  nominees: Nominee[];
  year: number;
  onVote: (category: string, nomineeId: string) => void;
  status: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const sorted = [...nominees].sort((a, b) => b.votes - a.votes);

  return (
    <div className="p-4 rounded-xl border border-white/10 bg-white/5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{emoji}</span>
        <h3 className="text-sm font-bold text-white/90">{categoryName}</h3>
        {status === "nominating" && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Nominating</span>
        )}
        {status === "voting" && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">Voting</span>
        )}
      </div>
      <div className="space-y-2">
        {sorted.map((n, i) => {
          const isSelected = selected === n.id;
          return (
            <button
              key={n.id}
              onClick={() => {
                setSelected(n.id);
                onVote(category, n.id);
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                isSelected
                  ? "bg-cyan-500/20 border border-cyan-500/40"
                  : "bg-white/5 hover:bg-white/[0.07] border border-transparent"
              }`}
            >
              <span className="text-xs text-white/40 w-4">#{i + 1}</span>
              {n.image && (
                <img src={n.image} alt="" className="w-8 h-10 rounded object-cover" />
              )}
              <span className="text-xs text-white/80 flex-1 text-left">{n.title}</span>
              <span className="text-[10px] text-white/40">{n.votes} votes</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

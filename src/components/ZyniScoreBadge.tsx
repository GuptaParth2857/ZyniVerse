"use client";

import { useEffect, useState } from "react";

interface ZyniScoreData {
  weightedScore: number;
  bayesianScore: number;
  totalVotes: number;
  verifiedVotes: number;
  distribution: number[];
}

function getScoreColor(score: number): string {
  if (score >= 8) return "text-emerald-400";
  if (score >= 6) return "text-cyan-400";
  if (score >= 4) return "text-amber-400";
  return "text-pink-400";
}

function getScoreGlow(score: number): string {
  if (score >= 8) return "shadow-emerald-500/30";
  if (score >= 6) return "shadow-cyan-500/30";
  if (score >= 4) return "shadow-amber-500/30";
  return "shadow-pink-500/30";
}

export default function ZyniScoreBadge({
  mediaId,
  compact = false,
}: {
  mediaId: number;
  compact?: boolean;
}) {
  const [data, setData] = useState<ZyniScoreData | null>(null);

  useEffect(() => {
    fetch(`/api/zyniscore/${mediaId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, [mediaId]);

  if (!data || data.totalVotes === 0) return null;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 font-bold ${getScoreColor(data.bayesianScore)}`}>
        ★ {data.bayesianScore.toFixed(1)}
      </span>
    );
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-20 h-20 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm shadow-lg ${getScoreGlow(data.bayesianScore)}`}
    >
      <span className={`text-2xl font-bold ${getScoreColor(data.bayesianScore)}`}>
        {data.bayesianScore.toFixed(1)}
      </span>
      <span className="text-[10px] text-white/40 mt-0.5">
        ZyniScore
      </span>
      <span className="text-[8px] text-white/30">
        {data.totalVotes} votes
      </span>
    </div>
  );
}

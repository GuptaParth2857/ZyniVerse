"use client";

import { useEffect, useState } from "react";

interface ScoreData {
  weightedScore: number;
  bayesianScore: number;
  totalVotes: number;
  verifiedVotes: number;
  distribution: number[];
  averageRating: number;
}

export default function ZyniScoreDetail({ mediaId }: { mediaId: number }) {
  const [data, setData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/zyniscore/${mediaId}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mediaId]);

  if (loading) return <div className="animate-pulse h-48 bg-white/5 rounded-xl" />;
  if (!data || data.totalVotes === 0) {
    return (
      <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-center">
        <p className="text-white/40 text-sm">No community ratings yet</p>
        <p className="text-white/30 text-xs mt-1">Be the first to rate!</p>
      </div>
    );
  }

  const maxDist = Math.max(...data.distribution, 1);

  return (
    <div className="p-4 rounded-xl border border-white/10 bg-white/5">
      <div className="flex items-center gap-4 mb-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-cyan-400">{data.bayesianScore.toFixed(1)}</div>
          <div className="text-[10px] text-white/40">ZyniScore</div>
        </div>
        <div className="flex-1">
          <div className="text-xs text-white/50 mb-1">Score Distribution ({data.totalVotes} votes)</div>
          {[...Array(10)].map((_, i) => {
            const score = 10 - i;
            const count = data.distribution[score - 1] || 0;
            const pct = (count / maxDist) * 100;
            return (
              <div key={score} className="flex items-center gap-1 mb-0.5">
                <span className="text-[10px] text-white/40 w-3 text-right">{score}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-cyan-500/70 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-white/30 w-4 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="p-2 rounded-lg bg-white/5">
          <div className="text-sm font-semibold text-white/80">{data.verifiedVotes}</div>
          <div className="text-[10px] text-emerald-400">Verified Watchers</div>
        </div>
        <div className="p-2 rounded-lg bg-white/5">
          <div className="text-sm font-semibold text-white/80">{data.averageRating.toFixed(1)}</div>
          <div className="text-[10px] text-white/40">Avg Rating</div>
        </div>
      </div>
    </div>
  );
}

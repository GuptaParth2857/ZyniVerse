"use client";

import { useEffect, useState } from "react";

export default function MatchBadge({ mediaId, compact }: { mediaId: number; compact?: boolean }) {
  const [match, setMatch] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/match/${mediaId}`)
      .then((r) => r.json())
      .then((d) => { if (d.match !== undefined) setMatch(d.match); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mediaId]);

  if (loading) return null;
  if (match === null) return null;
  if (match < 30) return null;

  if (compact) {
    return (
      <span className={`text-xs font-semibold ${match >= 70 ? "text-emerald-400" : match >= 50 ? "text-amber-400" : "text-white/40"}`}>
        {match}% match
      </span>
    );
  }

  return (
    <div className={`px-3 py-2 rounded-lg text-xs ${match >= 70 ? "bg-emerald-500/10 text-emerald-400" : match >= 50 ? "bg-amber-500/10 text-amber-400" : "bg-white/5 text-white/40"}`}>
      <span className="font-bold text-sm">{match}%</span> match for you
    </div>
  );
}

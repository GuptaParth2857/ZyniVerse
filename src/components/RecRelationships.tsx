"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface RecEntry {
  malId: number;
  title: string;
  image: string;
  reason: string;
  allReasons: string[];
}

export default function RecRelationships({ mediaId }: { mediaId: number }) {
  const [recs, setRecs] = useState<RecEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/recs/${mediaId}`)
      .then((r) => r.json())
      .then((d) => { setRecs(d.recs || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mediaId]);

  if (loading) return <div className="animate-pulse h-40 bg-white/5 rounded-xl" />;
  if (recs.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Why You Might Like These</h3>
      <div className="grid gap-3">
        {recs.map((rec, i) => (
          <Link key={i} href={`/anime/${rec.malId}`}
            className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
            <img src={rec.image} alt={rec.title} className="w-10 h-14 object-cover rounded" loading="lazy" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{rec.title}</div>
              <div className="text-xs text-emerald-400 mt-0.5">{rec.reason}</div>
              {rec.allReasons.length > 1 && (
                <div className="text-[10px] text-white/30 mt-1">
                  Also: {rec.allReasons.slice(1).join(", ")}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface RecItem {
  mediaId: number;
  count: number;
  avgScore: number;
}

interface Props {
  mediaId: number;
}

export default function UsersAlsoLiked({ mediaId }: Props) {
  const [recs, setRecs] = useState<RecItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users-also-liked/${mediaId}`)
      .then((r) => r.json())
      .then((d) => { setRecs(d.recommendations || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mediaId]);

  if (loading) return <div className="animate-pulse h-24 rounded-xl bg-[var(--color-panel)]" />;
  if (recs.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
      <h3 className="font-display text-sm font-bold mb-3">Users Also Liked</h3>
      <div className="space-y-1.5">
        {recs.slice(0, 8).map((r) => (
          <Link key={r.mediaId} href={`/anime/${r.mediaId}`}
            className="flex items-center gap-3 rounded-lg border border-[var(--color-line)] bg-black/20 p-2.5 hover:border-[var(--color-cyan)]/40 transition-all group"
          >
            <span className="text-[10px] font-mono text-[var(--color-mute)] w-4 shrink-0">#{r.mediaId}</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs truncate group-hover:text-[var(--color-cyan)] transition-colors">Anime #{r.mediaId}</p>
              <p className="text-[9px] text-[var(--color-mute)]">{r.count} users · Avg {(r.avgScore / 10).toFixed(1)}</p>
            </div>
            <span className="text-[10px] font-mono text-[var(--color-cyan)]">{r.count > 99 ? "99+" : r.count}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

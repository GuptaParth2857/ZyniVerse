"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageTransition } from "@/components/PageTransition";

interface ThemeGroup {
  mediaId: number;
  title: string;
  image: string | null;
  count: number;
}

export default function ThemesBrowsePage() {
  const [groups, setGroups] = useState<ThemeGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/themes")
      .then((r) => r.json())
      .then((d) => { setGroups(d.groups || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 animate-page-in">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Music</p>
          <h1 className="font-display text-3xl font-bold mt-1">Theme Songs Database</h1>
          <p className="text-sm text-[var(--color-mute)] mt-1">Browse opening and ending themes from popular anime</p>
        </div>
        {loading ? (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-[var(--color-panel)]" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((g) => (
              <Link key={g.mediaId} href={`/anime/${g.mediaId}`}
                className="flex items-center gap-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 hover:border-[var(--color-magenta)]/40 transition-all group"
              >
                {g.image && (
                  <div className="relative h-14 w-10 rounded overflow-hidden shrink-0 border border-[var(--color-line)]">
                    <img src={g.image} alt="" className="object-cover h-full w-full" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate group-hover:text-[var(--color-cyan)] transition-colors">{g.title}</p>
                  <p className="text-[10px] text-[var(--color-mute)]">{g.count} theme songs</p>
                </div>
                <span className="text-[10px] text-[var(--color-mute)]">View →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}

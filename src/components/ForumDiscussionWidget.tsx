"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ForumDiscussionWidgetProps {
  animeId: number;
  animeTitle: string;
  animeImage?: string;
}

export default function ForumDiscussionWidget({ animeId, animeTitle, animeImage }: ForumDiscussionWidgetProps) {
  const [threads, setThreads] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/forum/threads?animeId=${animeId}&limit=5`)
      .then(r => r.json())
      .then(d => setThreads(d.threads || []))
      .catch(() => {});
  }, [animeId]);

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
      <h3 className="font-display text-sm font-bold mb-3 flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-cyan)]">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        Discussion
      </h3>

      {threads.length === 0 ? (
        <p className="text-xs text-[var(--color-mute)]">No discussions yet.</p>
      ) : (
        <div className="space-y-2">
          {threads.map((t) => (
            <Link key={t.id} href={`/forum/thread/${t.id}`}
              className="block rounded-lg px-2 py-1.5 text-xs text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:bg-white/5 transition-colors truncate"
            >
              {t.title}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <Link href={`/forum/anime/${animeId}`}
          className="flex-1 rounded-lg border border-[var(--color-line)] px-5 py-2.5 text-xs font-semibold text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:border-[var(--color-cyan)] text-center transition-colors"
        >View All Threads</Link>
        <Link href={`/forum/create?animeId=${animeId}&animeTitle=${encodeURIComponent(animeTitle)}&animeImage=${encodeURIComponent(animeImage || "")}`}
          className="flex-1 rounded-lg bg-[var(--color-cyan)] px-5 py-2.5 text-xs font-bold text-black text-center hover:opacity-90 transition"
        >+ New Thread</Link>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface HistoryItem {
  chapter: number;
  title: string | null;
  readAt: string;
  entry: {
    mediaId: number;
    title: string;
    coverImage: string | null;
    subType: string;
  };
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function MangaReadingHistory({ mediaId }: { mediaId: number }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/manga/history?limit=15")
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setHistory((d.history || []) as HistoryItem[]); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return null;

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
      <h3 className="font-display text-sm font-bold mb-3 flex items-center gap-2">
        <span className="h-3 w-1 rounded-full bg-[var(--color-violet)]" />
        Reading History
      </h3>
      {history.length === 0 ? (
        <p className="text-xs text-[var(--color-mute)]">No chapters read yet. Track your reading to build a history.</p>
      ) : (
        <ol className="space-y-1.5 max-h-80 overflow-y-auto">
          {history.map((h) => (
            <li key={`${h.entry.mediaId}-${h.chapter}`}>
              <Link
                href={`/manga/read/${h.entry.mediaId}?chapter=${h.chapter}&title=${encodeURIComponent(h.entry.title)}`}
                className={`group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5 ${
                  h.entry.mediaId === mediaId ? "bg-[var(--color-violet)]/10" : ""
                }`}
              >
                <div className="relative h-10 w-8 shrink-0 rounded overflow-hidden border border-[var(--color-line)]">
                  {h.entry.coverImage && (
                    <Image src={h.entry.coverImage} alt="" fill className="object-cover" sizes="32px" unoptimized />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate group-hover:text-[var(--color-violet)] transition-colors">
                    {h.entry.title}
                  </p>
                  <p className="text-[10px] text-[var(--color-mute)]">
                    {h.entry.subType === "manga" ? "Manga" : h.entry.subType.replace("_", " ")} • Ch. {h.chapter}
                    {h.title ? ` — ${h.title}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-mono text-[var(--color-mute)]">{timeAgo(h.readAt)}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

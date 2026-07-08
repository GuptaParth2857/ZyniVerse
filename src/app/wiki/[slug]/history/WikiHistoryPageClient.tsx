"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface HistoryEntry {
  id: string;
  version: number;
  title: string;
  summary?: string | null;
  createdAt: string;
  editor: { id: string; username: string };
}

export default function WikiHistoryPageClient() {
  const resolvedParams = useParams();
  const slug = resolvedParams?.slug as string;

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof slug !== "string") return;
    fetch(`/api/wiki/${slug}/history`)
      .then((r) => r.json())
      .then((data) => setHistory(data.history || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--color-mute)] mb-2">
          <Link href="/wiki" className="hover:text-[var(--color-cyan)]">Wiki</Link>
          <span>/</span>
          <Link href={`/wiki/${slug}`} className="hover:text-[var(--color-cyan)]">{slug}</Link>
          <span>/</span>
          <span className="text-[var(--color-cyan)]">History</span>
        </div>
        <h1 className="font-display text-2xl font-bold">Revision History</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 animate-pulse">
              <div className="h-4 w-1/4 bg-[var(--color-line)] rounded" />
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <p className="text-center py-10 text-sm text-[var(--color-mute)]">No history available.</p>
      ) : (
        <div className="space-y-2">
          {history.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold">v{entry.version}</span>
                  <span className="text-sm font-medium">{entry.title}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-[var(--color-mute)] mt-1">
                  <span>by {entry.editor.username}</span>
                  <span>{new Date(entry.createdAt).toLocaleString()}</span>
                  {entry.summary && <span>— {entry.summary}</span>}
                </div>
              </div>
              <Link href={`/wiki/${slug}`} className="text-[10px] text-[var(--color-cyan)] hover:underline shrink-0">
                View
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href={`/wiki/${slug}`} className="text-sm text-[var(--color-cyan)] hover:underline">
          ← Back to page
        </Link>
      </div>
    </div>
  );
}

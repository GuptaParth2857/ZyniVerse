"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { getDoujinshi, getParodies, getCircles } from "@/lib/doujinshi-data";
import type { DoujinshiEntry } from "@/lib/doujinshi-data";
import DoujinshiCard from "@/components/DoujinshiCard";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Loader from "@/components/Loader";

export default function DoujinshiBrowseClient() {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [selectedParody, setSelectedParody] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [trackedMap, setTrackedMap] = useState<Record<string, string>>({});

  const entries = useMemo(() => {
    return getDoujinshi(
      search || undefined,
      selectedParody || undefined,
      selectedTag || undefined,
    );
  }, [search, selectedParody, selectedTag]);

  const parodies = useMemo(() => getParodies(), []);
  const circles = useMemo(() => getCircles(), []);
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    getDoujinshi().forEach((d) => d.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/doujinshi/my")
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, string> = {};
        data.entries?.forEach((e: { doujinshi: { id: string }; entry: { status: string } }) => {
          map[e.doujinshi.id] = e.entry.status;
        });
        setTrackedMap(map);
      })
      .catch(() => {});
  }, [session]);

  async function handleTrack(id: string, status: string) {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/doujinshi/${id}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setTrackedMap((prev) => {
          const next = { ...prev };
          if (next[id]) delete next[id];
          else next[id] = status;
          return next;
        });
      }
    } catch {}
  }

  return (
    <PageTransition>
      <ErrorBoundary label="DoujinshiBrowse">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">Doujinshi</h1>
            <p className="text-sm text-[var(--color-mute)]">
              Discover and track doujinshi — fan works, original creations, and community favorites.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-mute)] pointer-events-none"
                >
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search doujinshi..."
                  className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 backdrop-blur-sm py-3.5 pl-12 pr-4 text-sm text-white placeholder-[var(--color-mute)]/50 outline-none transition-all duration-300 focus:border-[var(--color-magenta)]"
                />
              </div>
              <select
                value={selectedParody}
                onChange={(e) => setSelectedParody(e.target.value)}
                className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-sm outline-none focus:border-[var(--color-magenta)]"
              >
                <option value="">All Parodies</option>
                {parodies.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-2 text-sm outline-none focus:border-[var(--color-magenta)]"
              >
                <option value="">All Tags</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>#{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results */}
          {entries.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-[var(--color-mute)] text-sm">No doujinshi found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {entries.map((entry) => (
                <DoujinshiCard
                  key={entry.id}
                  entry={entry}
                  onTrack={handleTrack}
                  trackedStatus={trackedMap[entry.id] || null}
                />
              ))}
            </div>
          )}

          {/* Info */}
          <div className="mt-12 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-5">
            <h3 className="font-display text-sm font-bold mb-2">About Doujinshi</h3>
            <p className="text-xs text-[var(--color-mute)] leading-relaxed">
              Doujinshi are self-published works, often fan-made, that celebrate anime, manga, and gaming culture.
              This directory only includes original works and fan works available through legal free sources like MangaDex.
            </p>
          </div>
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}

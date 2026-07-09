"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { DoujinshiEntry } from "@/lib/mangadex-api";
import DoujinshiCard from "@/components/DoujinshiCard";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Loader from "@/components/Loader";

export default function DoujinshiBrowseClient() {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [entries, setEntries] = useState<DoujinshiEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackedMap, setTrackedMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const sp = new URLSearchParams();
    if (debouncedSearch) sp.set("search", debouncedSearch);
    sp.set("perPage", "50");
    fetch(`/api/doujinshi?${sp.toString()}`)
      .then((r) => r.json())
      .then((data) => setEntries(data.entries || []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

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

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    entries.forEach((d) => d.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    if (!selectedTag) return entries;
    return entries.filter((e) => e.tags.includes(selectedTag));
  }, [entries, selectedTag]);

  const handleTrack = useCallback(async (id: string, status: string) => {
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
  }, [session]);

  return (
    <PageTransition>
      <ErrorBoundary label="DoujinshiBrowse">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">Doujinshi</h1>
            <p className="text-sm text-[var(--color-mute)]">
              Discover and track doujinshi from MangaDex.
            </p>
          </div>

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
                  placeholder="Search MangaDex doujinshi..."
                  className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-void)]/90 backdrop-blur-sm py-3.5 pl-12 pr-4 text-sm text-white placeholder-[var(--color-mute)]/50 outline-none transition-all duration-300 focus:border-[var(--color-magenta)]"
                />
              </div>
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

          {loading ? (
            <Loader />
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-[var(--color-mute)] text-sm">No doujinshi found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.map((entry) => (
                <DoujinshiCard
                  key={entry.id}
                  entry={entry}
                  onTrack={handleTrack}
                  trackedStatus={trackedMap[entry.id] || null}
                />
              ))}
            </div>
          )}
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
}

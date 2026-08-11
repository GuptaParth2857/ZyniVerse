"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { PageTransition } from "@/components/PageTransition";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/manga";
import { logError } from "@/lib/logger";

interface MangaListEntry {
  id: string;
  mediaId: number;
  title: string;
  coverImage: string | null;
  subType: string;
  status: string;
  chapters: number;
  volumes: number;
  totalChapters: number | null;
  totalVolumes: number | null;
  score: number | null;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
}

const STATUS_TABS = ["ALL", "READING", "PLANNING", "COMPLETED", "PAUSED", "DROPPED", "REREADING"];
const STATUS_OPTIONS = ["READING", "COMPLETED", "PLANNING", "DROPPED", "PAUSED", "REREADING"];

export default function MyMangaListClient() {
  const { data: session, status: sessionStatus } = useSession();
  const [entries, setEntries] = useState<MangaListEntry[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async (status: string) => {
    setLoading(true);
    try {
      const q = status === "ALL" ? "" : `?status=${status}`;
      const res = await fetch(`/api/manga/list${q}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setEntries(data.entries || []);
      setError(null);
    } catch (e) {
      logError(e);
      setError("Could not load your manga list. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!session?.user) {
      setLoading(false);
      return;
    }
    fetchList(filter);
  }, [session, sessionStatus, filter, fetchList]);

  async function changeStatus(mediaId: number, status: string) {
    try {
      const res = await fetch(`/api/manga/list/${mediaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchList(filter);
    } catch (e) { logError(e); }
  }

  async function removeEntry(mediaId: number) {
    try {
      const res = await fetch("/api/manga/list", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId }),
      });
      if (res.ok) fetchList(filter);
    } catch (e) { logError(e); }
  }

  const filtered = filter === "ALL" ? entries : entries.filter((e) => e.status === filter);
  const counts = useCallback(() => {
    const c: Record<string, number> = { ALL: entries.length };
    for (const e of entries) c[e.status] = (c[e.status] || 0) + 1;
    return c;
  }, [entries]);
  const countMap = counts();

  if (sessionStatus === "loading") return <Loader label="Loading your manga list..." />;
  if (!session?.user) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-3xl px-4 py-16">
          <EmptyState
            icon="bookmark"
            title="Sign in to track manga"
            description="Track reading progress, chapters and scores across all your manga, light novels, manhwa and manhua."
            actionLabel="Sign In"
            actionHref="/login"
          />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">My Manga List</h1>
            <p className="mt-1 text-sm text-[var(--color-mute)]">
              Track chapters, volumes and scores across your whole reading library.
            </p>
          </div>
          <Link
            href="/manga"
            className="rounded-full bg-[var(--color-violet)] px-5 py-2 text-sm font-semibold text-black hover:opacity-90 transition-opacity"
          >
            Browse Manga
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap gap-1.5">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === s
                  ? "bg-[var(--color-violet)] text-black"
                  : "border border-[var(--color-line)] text-[var(--color-mute)] hover:border-[var(--color-violet)] hover:text-[var(--color-violet)]"
              }`}
            >
              {STATUS_LABELS[s] || s}
              {countMap[s] ? <span className="ml-1.5 font-mono text-[10px] opacity-70">{countMap[s]}</span> : null}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader label="Loading..." />
        ) : error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6 text-sm text-red-400">{error}</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="bookmark"
            title={filter === "ALL" ? "Your manga shelf is empty" : `No ${STATUS_LABELS[filter]?.toLowerCase()} titles`}
            description="Add manga from any title page — track chapters read, volumes and your personal score."
            actionLabel="Discover Manga"
            actionHref="/manga"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e) => {
              const pct = e.totalChapters
                ? Math.min(100, Math.round((e.chapters / e.totalChapters) * 100))
                : e.status === "COMPLETED" ? 100 : 0;
              return (
                <div
                  key={e.id}
                  className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-3 transition-colors hover:border-[var(--color-violet)]/40"
                >
                  <div className="flex gap-3">
                    <Link href={`/manga/${e.mediaId}`} className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg border border-[var(--color-line)]">
                      {e.coverImage ? (
                        <Image src={e.coverImage} alt={e.title} fill className="object-cover" sizes="96px" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[var(--color-void)] text-2xl">📚</div>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/manga/${e.mediaId}`} className="line-clamp-2 text-sm font-semibold text-white hover:text-[var(--color-violet)] transition-colors">
                        {e.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-black"
                          style={{ backgroundColor: STATUS_COLORS[e.status] || "var(--color-mute)" }}
                        >
                          {STATUS_LABELS[e.status] || e.status}
                        </span>
                        {e.subType !== "manga" && (
                          <span className="rounded-full border border-[var(--color-line)] px-2 py-0.5 text-[10px] uppercase text-[var(--color-mute)]">
                            {e.subType.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 space-y-0.5 font-mono text-[11px] text-[var(--color-mute)]">
                        <div>📖 {e.chapters} / {e.totalChapters ?? "—"} ch</div>
                        {e.totalVolumes ? <div>📚 {e.volumes} / {e.totalVolumes} vol</div> : null}
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
                        <div className="h-full rounded-full bg-[var(--color-violet)] transition-all duration-300" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        {e.score ? (
                          <span className="font-mono text-xs font-bold text-[var(--color-violet)]">★ {e.score}/10</span>
                        ) : (
                          <span className="text-[10px] text-[var(--color-mute)]">Not rated</span>
                        )}
                        <div className="flex items-center gap-1">
                          <select
                            value={e.status}
                            onChange={(ev) => changeStatus(e.mediaId, ev.target.value)}
                            className="rounded-lg bg-[var(--color-void)] px-1.5 py-1 text-[10px] outline-none focus:border-[var(--color-violet)]"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => removeEntry(e.mediaId)}
                            title="Remove from list"
                            className="rounded-lg px-1.5 py-1 text-[10px] text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}

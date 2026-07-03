"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Loader, { ErrorState } from "@/components/Loader";
import { PageTransition } from "@/components/PageTransition";
import { getMediaBatch } from "@/lib/anilist";
import type { MediaBasic } from "@/lib/anilist";

interface ProfileData {
  user: {
    id: string; username: string; email?: string; createdAt: string;
    entries: { mediaId: number; type: string; status: string; progress: number; total: number; score: number | null }[];
    reviews: { id: string; mediaId: number; rating: number; comment?: string; createdAt: string; user: { username: string } }[];
  };
  stats: {
    total: number; current: number; planning: number; completed: number;
    dropped: number; paused: number; episodesWatched: number;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"entries" | "reviews" | "stats">("entries");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [mediaMeta, setMediaMeta] = useState<Map<number, MediaBasic>>(new Map());

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;
    setLoading(true); setError(null);
    fetch("/api/profile")
      .then((r) => r.json())
      .then(async (d) => {
        setProfile(d);
        const ids = d.user.entries.map((e: any) => e.mediaId).filter(Boolean);
        if (ids.length > 0) {
          try {
            const batch = await getMediaBatch(ids);
            const map = new Map<number, MediaBasic>();
            batch.forEach((m) => map.set(m.id, m));
            setMediaMeta(map);
          } catch {}
        }
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [status, router]);

  if (status === "loading" || loading) return <Loader label="Loading profile..." />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState message={error} /></div>;
  if (!profile) return null;

  const { user, stats } = profile;

  const genreDist = useMemo(() => {
    const counts = new Map<string, number>();
    user.entries.forEach((e) => {
      const meta = mediaMeta.get(e.mediaId);
      meta?.genres?.forEach((g) => counts.set(g, (counts.get(g) || 0) + 1));
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [user.entries, mediaMeta]);

  const formatDist = useMemo(() => {
    const counts = new Map<string, number>();
    user.entries.forEach((e) => {
      const meta = mediaMeta.get(e.mediaId);
      if (meta?.format) counts.set(meta.format, (counts.get(meta.format) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [user.entries, mediaMeta]);

  const statusDist = useMemo(() => {
    const counts: Record<string, number> = { CURRENT: 0, PLANNING: 0, COMPLETED: 0, DROPPED: 0, PAUSED: 0, REWATCHING: 0 };
    user.entries.forEach((e) => { if (counts[e.status] !== undefined) counts[e.status]++; });
    return Object.entries(counts).filter(([, v]) => v > 0);
  }, [user.entries]);

  const maxGenre = Math.max(...genreDist.map(([, v]) => v), 1);
  const maxFormat = Math.max(...formatDist.map(([, v]) => v), 1);

  const filteredEntries = statusFilter === "ALL"
    ? user.entries
    : user.entries.filter((e) => e.status === statusFilter);

  return (
    <PageTransition><div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 pb-8 border-b border-[var(--color-line)]">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] text-3xl font-bold text-black">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-bold">{user.username}</h1>
          <p className="text-sm text-[var(--color-mute)]">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-6 gap-3">
        {[
          { label: "Total", value: stats.total, color: "var(--color-ink)" },
          { label: "Watching", value: stats.current, color: "var(--color-cyan)" },
          { label: "Planning", value: stats.planning, color: "var(--color-violet)" },
          { label: "Completed", value: stats.completed, color: "#22c55e" },
          { label: "Dropped", value: stats.dropped, color: "var(--color-magenta)" },
          { label: "Episodes", value: stats.episodesWatched, color: "var(--color-cyan)" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-center">
            <div className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-[var(--color-mute)] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-8 flex items-center gap-2 border-b border-[var(--color-line)] pb-3">
        {(["entries", "reviews", "stats"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
              tab === t ? "text-[var(--color-magenta)] border-b-2 border-[var(--color-magenta)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
            }`}
          >{t === "entries" ? "My List" : t === "reviews" ? "Reviews" : "Stats"}</button>
        ))}
        {tab === "entries" && (
          <div className="ml-auto flex gap-1">
            {["ALL", "CURRENT", "PLANNING", "COMPLETED", "DROPPED", "PAUSED"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 text-[10px] font-semibold rounded-full transition-colors ${
                  statusFilter === s
                    ? "bg-[var(--color-magenta)] text-black"
                    : "text-[var(--color-mute)] border border-[var(--color-line)] hover:border-[var(--color-magenta)]"
                }`}
              >{s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}</button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {tab === "entries" && (
        <div className="mt-6">
          {filteredEntries.length === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--color-mute)]">
              No entries. <Link href="/search" className="text-[var(--color-cyan)] hover:underline">Browse anime</Link>
            </p>
          ) : (
            <div className="space-y-2">
              {filteredEntries.map((e) => (
                <Link key={`${e.mediaId}-${e.status}`} href={`/${e.type.toLowerCase()}/${e.mediaId}`}
                  className="flex items-center justify-between rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 hover:border-[var(--color-cyan)]/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${
                      e.status === "CURRENT" ? "bg-[var(--color-cyan)]" :
                      e.status === "PLANNING" ? "bg-[var(--color-violet)]" :
                      e.status === "COMPLETED" ? "bg-green-500" :
                      e.status === "DROPPED" ? "bg-[var(--color-magenta)]" :
                      "bg-yellow-500"
                    }`} />
                    <span className="text-sm font-medium">#{e.mediaId}</span>
                    <span className="text-[10px] font-mono uppercase text-[var(--color-mute)]">{e.type}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--color-mute)]">
                    {e.progress > 0 && <span>{e.progress}/{e.total || "?"} eps</span>}
                    {e.score && <span className="text-[var(--color-cyan)]">{e.score}/10</span>}
                    <span className={`font-semibold ${
                      e.status === "CURRENT" ? "text-[var(--color-cyan)]" :
                      e.status === "COMPLETED" ? "text-green-400" :
                      e.status === "PLANNING" ? "text-[var(--color-violet)]" :
                      e.status === "DROPPED" ? "text-[var(--color-magenta)]" :
                      "text-yellow-400"
                    }`}>{e.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "reviews" && (
        <div className="mt-6 space-y-3">
          {user.reviews.length === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--color-mute)]">No reviews yet.</p>
          ) : (
            user.reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
                <div className="flex items-center justify-between">
                  <Link href={`/anime/${r.mediaId}`} className="text-sm font-semibold hover:text-[var(--color-cyan)]">
                    Media #{r.mediaId}
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[var(--color-magenta)]/20 px-2 py-0.5 text-xs font-bold text-[var(--color-magenta)]">{r.rating}/10</span>
                    <span className="text-[10px] text-[var(--color-mute)]">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {r.comment && <p className="mt-2 text-sm text-[var(--color-mute)]">{r.comment}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "stats" && (
        <div className="mt-6 space-y-8">
          {/* Status Distribution */}
          <div>
            <h3 className="font-display text-sm font-bold mb-3">Status Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {statusDist.map(([status, count]) => {
                const colors: Record<string, string> = { CURRENT: "var(--color-cyan)", PLANNING: "var(--color-violet)", COMPLETED: "#22c55e", DROPPED: "var(--color-magenta)", PAUSED: "#eab308", REWATCHING: "#f97316" };
                return (
                  <div key={status} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 text-center">
                    <div className="text-2xl font-bold font-mono" style={{ color: colors[status] || "var(--color-ink)" }}>{count}</div>
                    <div className="text-xs text-[var(--color-mute)] mt-0.5 capitalize">{status.toLowerCase()}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Genre Distribution */}
          {genreDist.length > 0 && (
            <div>
              <h3 className="font-display text-sm font-bold mb-3">Top Genres</h3>
              <div className="space-y-2">
                {genreDist.map(([genre, count]) => (
                  <div key={genre} className="flex items-center gap-3">
                    <span className="w-28 text-xs text-[var(--color-mute)] truncate text-right">{genre}</span>
                    <div className="flex-1 h-5 rounded-md bg-[var(--color-line)] overflow-hidden">
                      <div className="h-full rounded-md bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-cyan)] transition-all" style={{ width: `${(count / maxGenre) * 100}%` }} />
                    </div>
                    <span className="w-6 text-xs font-mono text-[var(--color-mute)] text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Format Distribution */}
          {formatDist.length > 0 && (
            <div>
              <h3 className="font-display text-sm font-bold mb-3">Format Breakdown</h3>
              <div className="space-y-2">
                {formatDist.map(([format, count]) => (
                  <div key={format} className="flex items-center gap-3">
                    <span className="w-24 text-xs text-[var(--color-mute)] truncate text-right">{format.replace(/_/g, " ")}</span>
                    <div className="flex-1 h-5 rounded-md bg-[var(--color-line)] overflow-hidden">
                      <div className="h-full rounded-md bg-gradient-to-r from-[var(--color-violet)] to-[var(--color-cyan)] transition-all" style={{ width: `${(count / maxFormat) * 100}%` }} />
                    </div>
                    <span className="w-6 text-xs font-mono text-[var(--color-mute)] text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {genreDist.length === 0 && formatDist.length === 0 && (
            <p className="text-center text-sm text-[var(--color-mute)] py-10">Add items to your list to see stats.</p>
          )}
        </div>
      )}
    </div></PageTransition>
  );
}

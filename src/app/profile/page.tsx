"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Loader, { ErrorState } from "@/components/Loader";
import { PageTransition } from "@/components/PageTransition";
import ApiKeyManager from "@/components/ApiKeyManager";
import StatsDashboard from "@/components/StatsDashboard";
import WatchHistory from "@/components/WatchHistory";

interface ProfileData {
  user: {
    id: string; username: string; email?: string; avatar?: string; banner?: string; bio?: string; themeColor?: string; signature?: string; createdAt: string;
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
  const [tab, setTab] = useState<"entries" | "reviews" | "stats" | "import" | "api" | "lists" | "history">("entries");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [anilistUsername, setAnilistUsername] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; total: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status !== "authenticated") return;
    setLoading(true); setError(null);
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        setProfile(d);
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [status, router]);

  if (status === "loading" || loading) return <Loader label="Loading profile..." />;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState message={error} /></div>;
  if (!profile) return null;

  const { user, stats } = profile;

  const filteredEntries = statusFilter === "ALL"
    ? user.entries
    : user.entries.filter((e) => e.status === statusFilter);

  return (
    <PageTransition><div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Banner */}
      {user.banner && (
        <div className="relative h-48 -mx-4 -mt-10 sm:-mx-6 sm:-mt-10 mb-6 overflow-hidden">
          <img src={user.banner} alt="Profile banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-void)] via-transparent to-transparent" />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 pb-8 border-b border-[var(--color-line)]">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-magenta)] to-[var(--color-violet)] text-3xl font-bold text-black overflow-hidden">
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
          ) : (
            user.username.charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-bold">{user.username}</h1>
          {user.bio && <p className="text-sm text-white/60 mt-1">{user.bio}</p>}
          <p className="text-sm text-[var(--color-mute)] mt-1">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
        <Link href="/profile/edit" className="shrink-0 px-4 py-2 rounded-lg border border-[var(--color-line)] text-sm text-[var(--color-mute)] hover:text-[var(--color-cyan)] hover:border-[var(--color-cyan)] transition-colors">
          Edit Profile
        </Link>
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
      <div className="mt-8 flex items-center gap-2 border-b border-[var(--color-line)] pb-3 overflow-x-auto flex-nowrap">
        {(["entries", "reviews", "lists", "stats", "history", "import", "api"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
              tab === t ? "text-[var(--color-magenta)] border-b-2 border-[var(--color-magenta)]" : "text-[var(--color-mute)] hover:text-[var(--color-ink)]"
            }`}
          >{t === "entries" ? "My List" : t === "reviews" ? "Reviews" : t === "lists" ? "Lists" : t === "stats" ? "Stats" : t === "history" ? "Watch History" : t === "import" ? "Import" : "API Keys"}</button>
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

      {tab === "lists" && (
        <div className="mt-6">
          <ProfileLists userId={user.id} />
        </div>
      )}

      {tab === "stats" && <StatsDashboard />}

      {tab === "import" && (
        <div className="mt-6">
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-6">
            <h3 className="font-display text-sm font-bold mb-1">Import from AniList</h3>
            <p className="text-xs text-[var(--color-mute)] mb-4">
              Enter your AniList username to import your entire anime watchlist into ZyniVerse.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="AniList username"
                value={anilistUsername}
                onChange={(e) => { setAnilistUsername(e.target.value); setImportResult(null); setImportError(null); }}
                className="flex-1 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-cyan)] transition-colors"
              />
              <button
                onClick={async () => {
                  if (!anilistUsername.trim()) return;
                  setImporting(true);
                  setImportResult(null);
                  setImportError(null);
                  try {
                    const res = await fetch("/api/import/anilist", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ username: anilistUsername.trim() }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Import failed");
                    setImportResult(data);
                  } catch (err: any) {
                    setImportError(err.message);
                  } finally {
                    setImporting(false);
                  }
                }}
                disabled={importing || !anilistUsername.trim()}
                className="rounded-lg bg-[var(--color-magenta)] px-5 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {importing ? "Importing..." : "Import from AniList"}
              </button>
            </div>
            {importResult && (
              <p className="mt-3 text-sm text-green-400">
                Successfully imported {importResult.imported} of {importResult.total} entries.
              </p>
            )}
            {importError && (
              <p className="mt-3 text-sm text-[var(--color-magenta)]">{importError}</p>
            )}
          </div>
        </div>
      )}

      {tab === "api" && (
        <div className="mt-6">
          <ApiKeyManager />
        </div>
      )}

      {tab === "history" && (
        <div className="mt-6">
          <WatchHistory />
        </div>
      )}
    </div></PageTransition>
  );
}

function ProfileLists({ userId }: { userId: string }) {
  const [lists, setLists] = useState<Array<{ id: string; title: string; type: string; isPublic: boolean; itemCount: number; likes: number; createdAt: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/lists?userId=${userId}&sort=recent&limit=50`)
      .then((r) => r.json())
      .then((d) => setLists(d.lists || []))
      .catch(() => setLists([]))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-[var(--color-panel)]" />)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--color-mute)]">{lists.length} list{lists.length !== 1 ? "s" : ""}</p>
        <Link href="/lists/create" className="rounded-lg bg-[var(--color-cyan)] px-3 py-1.5 text-sm font-semibold text-black">Create List</Link>
      </div>
      {lists.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--color-mute)]">No custom lists yet.</p>
      ) : (
        <div className="space-y-2">
          {lists.map((l) => (
            <Link key={l.id} href={`/lists/${l.id}`}
              className="flex items-center justify-between rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-3 hover:border-[var(--color-cyan)]/40 transition-all"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{l.title}</p>
                <p className="text-[11px] text-[var(--color-mute)] mt-0.5">
                  {l.itemCount} items · ♥ {l.likes} · {!l.isPublic && "Private · "}{l.type} · {new Date(l.createdAt).toLocaleDateString()}
                </p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)] shrink-0 ml-2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

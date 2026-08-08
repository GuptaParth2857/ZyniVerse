"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface ReelReportItem {
  id: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  views: number;
  reportCount: number;
  likesCount?: number;
  commentsCount?: number;
  createdAt: string;
  user: { id: string; username: string; avatar: string | null };
  reports?: { reason: string; createdAt: string }[];
}

type Tab = "all" | "reported";

function ReelSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 animate-pulse sm:flex-row">
      <div className="h-40 w-28 shrink-0 rounded-xl bg-white/10 sm:w-40" />
      <div className="flex-1 space-y-3 py-1">
        <div className="h-4 w-32 rounded bg-white/10" />
        <div className="h-5 w-2/3 rounded bg-white/10" />
        <div className="h-3 w-40 rounded bg-white/10" />
        <div className="h-3 w-24 rounded bg-white/10" />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="h-9 w-16 rounded-lg bg-white/10" />
        <div className="h-9 w-16 rounded-lg bg-white/10" />
      </div>
    </div>
  );
}

export default function AdminReelsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [allReels, setAllReels] = useState<ReelReportItem[] | null>(null);
  const [reportedReels, setReportedReels] = useState<ReelReportItem[] | null>(null);
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const loading = tab === "all" ? allReels === null : reportedReels === null;
  const reels = (tab === "all" ? allReels : reportedReels) ?? [];

  useEffect(() => {
    if (tab === "all") {
      if (allReels !== null) return;
      fetch("/api/admin/reels")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setAllReels(d?.reels || []))
        .catch(() => setAllReels([]));
    } else {
      if (reportedReels !== null) return;
      fetch("/api/admin/reels/reports")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setReportedReels(d?.reels || []))
        .catch(() => setReportedReels([]));
    }
  }, [tab, allReels, reportedReels]);

  const deleteReel = useCallback(
    async (id: string) => {
      if (!confirm("Delete this reel?")) return;
      setDeleting(id);
      try {
        const res = await fetch(`/api/reels/${id}`, { method: "DELETE" });
        if (res.ok) {
          if (tab === "all") setAllReels((a) => (a ? a.filter((x) => x.id !== id) : a));
          else setReportedReels((r) => (r ? r.filter((x) => x.id !== id) : r));
          setMessage("Reel deleted.");
        } else {
          setMessage("Delete failed.");
        }
      } catch {
        setMessage("Delete fail hua.");
      }
      setDeleting(null);
      setTimeout(() => setMessage(""), 2500);
    },
    [tab]
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">Admin · Reels</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mt-1">Reels</h1>
          <p className="mt-2 text-sm text-[var(--color-mute)] flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500" />
            </span>
            Moderate community reels
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab("all")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              tab === "all"
                ? "neon-rgb-border bg-gradient-to-b from-[var(--color-cyan)]/15 to-transparent text-[var(--color-cyan)] shadow-[0_0_20px_-5px_rgba(0,255,224,0.2)]"
                : "neon-rgb-border text-[var(--color-mute)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
            }`}
          >
            All Reels
            <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px]">{allReels?.length ?? "–"}</span>
          </button>
          <button
            onClick={() => setTab("reported")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              tab === "reported"
                ? "neon-rgb-border bg-gradient-to-b from-red-500/15 to-transparent text-red-400 shadow-[0_0_20px_-5px_rgba(255,45,120,0.25)]"
                : "neon-rgb-border text-[var(--color-mute)] hover:border-red-500/40 hover:text-red-400"
            }`}
          >
            Reported
            <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px]">{reportedReels?.length ?? "–"}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-6 rounded-lg border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 px-4 py-2.5 text-sm text-[var(--color-cyan)]">
          {message}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ReelSkeleton key={i} />
          ))}
        </div>
      ) : reels.length === 0 ? (
        <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-12 text-center">
          <div className="text-5xl mb-3">{tab === "reported" ? "🎉" : "🎬"}</div>
          <h3 className="font-display text-lg font-bold">{tab === "reported" ? "All clear!" : "No reels yet"}</h3>
          <p className="mt-1 text-sm text-[var(--color-mute)]">
            {tab === "reported" ? "No reported reels to review." : "Community uploads will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reels.map((reel) => (
            <div key={reel.id} className="overflow-hidden rounded-xl neon-rgb-border bg-[var(--color-panel)]">
              <div className="flex flex-col gap-4 p-4 sm:flex-row">
                <div className="relative h-40 w-28 shrink-0 overflow-hidden rounded-xl bg-black sm:w-40">
                  <video
                    src={reel.videoUrl}
                    poster={reel.thumbnailUrl || undefined}
                    controls
                    playsInline
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-white">
                    ▶ {reel.views}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {reel.reportCount > 0 && (
                      <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                        ⚠ {reel.reportCount} report{reel.reportCount > 1 ? "s" : ""}
                      </span>
                    )}
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">
                      {new Date(reel.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>

                  <p className="mt-2 font-display text-sm font-semibold text-[var(--color-ink)] line-clamp-2">
                    {reel.caption || "—"}
                  </p>

                  <div className="mt-2 flex items-center gap-3 text-[11px] text-[var(--color-mute)]">
                    <span className="flex items-center gap-1">♥ {reel.likesCount ?? 0}</span>
                    <span className="flex items-center gap-1">💬 {reel.commentsCount ?? 0}</span>
                    <span className="flex items-center gap-1">▶ {reel.views} views</span>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-[var(--color-mute)]">
                    <span className="relative flex h-6 w-6 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-pink-500 to-purple-600">
                      {reel.user.avatar && (
                        <Image src={reel.user.avatar} alt="" width={24} height={24} className="object-cover" />
                      )}
                    </span>
                    <span className="truncate font-medium text-[var(--color-ink)] hover:text-[var(--color-cyan)]">
                      @{reel.user.username}
                    </span>
                  </div>

                  {tab === "reported" && reel.reports && reel.reports.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {reel.reports.map((rep, i) => (
                        <span key={i} className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-[var(--color-mute)]">
                          {rep.reason}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:flex-col">
                  <Link
                    href={`/reels?reel=${reel.id}`}
                    className="inline-flex items-center justify-center rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm transition hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => deleteReel(reel.id)}
                    disabled={deleting === reel.id}
                    className="inline-flex items-center justify-center rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/30 disabled:opacity-50"
                  >
                    {deleting === reel.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

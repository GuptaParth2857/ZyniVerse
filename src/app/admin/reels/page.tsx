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
  user: { id: string; username: string; avatar: string | null };
  reports: { reason: string; createdAt: string }[];
}

export default function AdminReelsPage() {
  const [reels, setReels] = useState<ReelReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/reels/reports");
      if (res.ok) {
        const d = await res.json();
        setReels(d.reels || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const deleteReel = async (id: string) => {
    if (!confirm("Delete this reel?")) return;
    try {
      const res = await fetch(`/api/reels/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReels((r) => r.filter((x) => x.id !== id));
        setMessage("Reel deleted.");
      } else {
        setMessage("Delete failed.");
      }
    } catch {
      setMessage("Delete fail hua.");
    }
    setTimeout(() => setMessage(""), 2500);
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Reels Moderation</h1>
      <p className="mt-1 text-sm text-[var(--color-mute)]">Reported reels — review and delete</p>

      {message && (
        <div className="mt-3 rounded-lg bg-[var(--color-cyan)]/10 px-3 py-2 text-sm text-[var(--color-cyan)]">
          {message}
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-[var(--color-mute)]">Loading...</p>
      ) : reels.length === 0 ? (
        <div className="mt-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-8 text-center text-sm text-[var(--color-mute)]">
          No reported reels. 🎉
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {reels.map((reel) => (
            <div
              key={reel.id}
              className="flex flex-col gap-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 sm:flex-row"
            >
              <div className="h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-black sm:w-36">
                <video src={reel.videoUrl} poster={reel.thumbnailUrl || undefined} controls className="h-full w-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-semibold text-red-400">
                    {reel.reportCount} report{reel.reportCount > 1 ? "s" : ""}
                  </span>
                  <span className="text-xs text-[var(--color-mute)]">{reel.views} views</span>
                </div>
                <p className="mt-2 text-sm line-clamp-2">{reel.caption || "—"}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-[var(--color-mute)]">
                  <span className="relative h-5 w-5 overflow-hidden rounded-full bg-pink-600">
                    {reel.user.avatar && (
                      <Image src={reel.user.avatar} alt="" width={20} height={20} className="object-cover" />
                    )}
                  </span>
                  @{reel.user.username}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {reel.reports.map((rep, i) => (
                    <span key={i} className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-[var(--color-mute)]">
                      {rep.reason}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/reels?reel=${reel.id}`}
                  className="rounded-lg border border-[var(--color-line)] px-3 py-2 text-sm transition hover:border-[var(--color-cyan)]"
                >
                  View
                </Link>
                <button
                  onClick={() => deleteReel(reel.id)}
                  className="rounded-lg bg-red-500/20 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/30"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

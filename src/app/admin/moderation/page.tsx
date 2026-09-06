"use client";

import { useEffect, useState, useCallback } from "react";

interface ModReportItem {
  id: string;
  contentType: string;
  contentId: string;
  authorId: string | null;
  reason: string;
  note: string | null;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  preview: string | null;
  createdAt: string;
  user: { id: string; username: string; avatar: string | null };
}

const TABS = ["PENDING", "RESOLVED", "DISMISSED"] as const;
type Tab = (typeof TABS)[number];

const TYPE_COLOR: Record<string, string> = {
  MEME: "text-[var(--color-amber)]",
  FANART: "text-[var(--color-violet)]",
  COSPLAY: "text-[var(--color-cyan)]",
  CLIP: "text-[var(--color-magenta)]",
  REEL: "text-pink-400",
  POST: "text-blue-400",
  COMMENT: "text-green-400",
  REVIEW: "text-yellow-400",
  LONG_REVIEW: "text-orange-400",
  BLOG: "text-teal-400",
  WIKI: "text-indigo-400",
  MOMENT: "text-red-400",
  FORUM_THREAD: "text-cyan-400",
  FORUM_POST: "text-purple-400",
  CLUB_POST: "text-fuchsia-400",
  CLUB_COMMENT: "text-emerald-400",
  REEL_COMMENT: "text-pink-300",
};

function Skeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-4 w-24 rounded bg-white/10" />
        <div className="h-4 w-16 rounded bg-white/10" />
      </div>
      <div className="h-4 w-2/3 rounded bg-white/10" />
      <div className="mt-3 h-3 w-40 rounded bg-white/10" />
    </div>
  );
}

export default function AdminModerationPage() {
  const [tab, setTab] = useState<Tab>("PENDING");
  const [data, setData] = useState<Record<string, ModReportItem[]>>({
    PENDING: [],
    RESOLVED: [],
    DISMISSED: [],
  });
  const [loaded, setLoaded] = useState<Record<string, boolean>>({
    PENDING: false,
    RESOLVED: false,
    DISMISSED: false,
  });
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (status: Tab) => {
    try {
      const res = await fetch(`/api/admin/moderation?status=${status}`);
      const json = await res.json();
      if (res.ok && Array.isArray(json.reports)) {
        setData((prev) => ({ ...prev, [status]: json.reports }));
      }
    } catch {
      /* ignore */
    } finally {
      setLoaded((prev) => ({ ...prev, [status]: true }));
    }
  }, []);

  useEffect(() => {
    if (!loaded[tab]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void load(tab);
    }
  }, [tab, loaded, load]);

  const setStatus = useCallback(
    async (id: string, status: "RESOLVED" | "DISMISSED") => {
      setBusyId(id);
      try {
        const res = await fetch("/api/admin/moderation", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status }),
        });
        if (res.ok) {
          setData((prev) => ({
            ...prev,
            PENDING: prev.PENDING.filter((r) => r.id !== id),
          }));
          setLoaded((prev) => ({ ...prev, [status]: false }));
          setMessage(status === "RESOLVED" ? "Marked as resolved." : "Dismissed.");
        } else {
          setMessage("Update failed.");
        }
      } catch {
        setMessage("Update failed.");
      }
      setBusyId(null);
      setTimeout(() => setMessage(""), 2500);
    },
    []
  );

  const list = data[tab];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-magenta)]">
            Admin · Moderation
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mt-1">Content Reports</h1>
          <p className="mt-2 text-sm text-[var(--color-mute)] flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            Review reports across memes, art, cosplay, clips &amp; more
          </p>
        </div>

        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                tab === t
                  ? "neon-rgb-border bg-gradient-to-b from-red-500/15 to-transparent text-red-400 shadow-[0_0_20px_-5px_rgba(255,45,120,0.25)]"
                  : "neon-rgb-border text-[var(--color-mute)] hover:text-red-400"
              }`}
            >
              {t}
              <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px]">
                {loaded[t] ? data[t].length : "–"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="mb-6 rounded-lg border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 px-4 py-2.5 text-sm text-[var(--color-cyan)]">
          {message}
        </div>
      )}

      {!loaded[tab] ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-xl neon-rgb-border bg-[var(--color-panel)] p-12 text-center">
          <div className="text-5xl mb-3">🛡️</div>
          <h3 className="font-display text-lg font-bold">All clear</h3>
          <p className="mt-1 text-sm text-[var(--color-mute)]">
            No {tab.toLowerCase()} reports to review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((r) => (
            <div
              key={r.id}
              className="overflow-hidden rounded-xl neon-rgb-border bg-[var(--color-panel)]"
            >
              <div className="flex flex-wrap items-start gap-5 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--color-mute)]">
                      {r.contentType}
                    </span>
                    <span
                      className={`rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400 ${
                        tab === "PENDING" ? "text-red-400" : ""
                      }`}
                    >
                      {r.reason}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--color-mute)]">
                      {new Date(r.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="mt-2 font-display text-sm font-semibold text-[var(--color-ink)] line-clamp-2">
                    {r.preview ?? "—"}
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-xs text-[var(--color-mute)]">
                    <span>by</span>
                    <span className={TYPE_COLOR[r.contentType] ?? "text-[var(--color-ink)]"}>
                      @{r.user.username}
                    </span>
                    <span className="font-mono text-[10px]">#{r.contentId.slice(0, 8)}</span>
                  </div>

                  {r.note && (
                    <p className="mt-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-[var(--color-mute)]">
                      “{r.note}”
                    </p>
                  )}
                </div>

                {tab === "PENDING" && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => void setStatus(r.id, "DISMISSED")}
                      disabled={busyId === r.id}
                      className="inline-flex items-center justify-center rounded-lg border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-mute)] transition hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] disabled:opacity-50"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => void setStatus(r.id, "RESOLVED")}
                      disabled={busyId === r.id}
                      className="inline-flex items-center justify-center rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/30 disabled:opacity-50"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
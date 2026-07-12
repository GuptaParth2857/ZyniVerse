"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  AIRING: "\u23F0",
  FOLLOW: "\uD83D\uDC65",
  REVIEW: "\u2B50",
  COMMENT: "\uD83D\uDCAC",
  IMPORT: "\uD83D\uDCE5",
  SYSTEM: "\u2699\uFE0F",
};

const TYPES = ["ALL", "AIRING", "FOLLOW", "REVIEW", "COMMENT", "IMPORT", "SYSTEM"] as const;

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNotifications = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const currentOffset = reset ? 0 : offset;
      const res = await fetch(`/api/notifications?limit=20&offset=${currentOffset}`);
      const data = await res.json();
      if (reset) {
        setNotifications(data.notifications ?? []);
      } else {
        setNotifications((prev) => [...prev, ...(data.notifications ?? [])]);
      }
      setHasMore(data.notifications?.length === 20);
      if (!reset) setOffset(currentOffset + 20);
    } catch {} finally {
      setLoading(false);
    }
  }, [offset]);

  useEffect(() => {
    setOffset(0);
    fetchNotifications(true);
  }, []);

  useEffect(() => {
    fetchNotifications(true);
  }, [filter]);

  async function handleLoadMore() {
    await fetchNotifications();
  }

  async function handleClick(n: Notification) {
    if (!n.read) {
      try {
        await fetch(`/api/notifications/${n.id}`, { method: "PUT" });
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
        );
      } catch {}
    }
    if (n.link) router.push(n.link);
  }

  const filtered = filter === "ALL" ? notifications : notifications.filter((n) => n.type === filter);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-full px-5 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
              filter === t
                ? "bg-[var(--color-cyan)] text-black"
                : "bg-[var(--color-panel)] text-[var(--color-mute)] border border-[var(--color-line)] hover:text-[var(--color-ink)]"
            }`}
          >
            {t === "ALL" ? "All" : `${TYPE_ICONS[t] || ""} ${t.charAt(0) + t.slice(1).toLowerCase()}`}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        {filtered.length === 0 && !loading && (
          <div className="py-16 text-center text-sm text-[var(--color-mute)]">
            No notifications found
          </div>
        )}
        {filtered.map((n) => (
          <button
            key={n.id}
            onClick={() => handleClick(n)}
            className={`flex w-full items-start gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-white/5 ${
              !n.read ? "bg-white/[0.02]" : ""
            }`}
          >
            <span className="text-lg mt-0.5 shrink-0">{TYPE_ICONS[n.type] || "\uD83D\uDD14"}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className={`text-sm ${!n.read ? "font-semibold text-[var(--color-ink)]" : "text-[var(--color-mute)]"}`}>
                  {n.title}
                </p>
                {!n.read && <span className="h-2 w-2 rounded-full bg-[var(--color-cyan)] shrink-0" />}
              </div>
              {n.body && <p className="text-xs text-[var(--color-mute)] mt-0.5">{n.body}</p>}
              {n.link && <p className="text-[11px] text-[var(--color-cyan)] mt-0.5 truncate">{n.link}</p>}
              <p className="text-[10px] text-[var(--color-mute)] mt-1">{timeAgo(n.createdAt)}</p>
            </div>
          </button>
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] px-6 py-2 text-sm font-medium text-[var(--color-mute)] hover:text-[var(--color-ink)] hover:border-[var(--color-cyan)] transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { logError } from "@/lib/logger";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

interface TypeMeta {
  icon: string;
  color: string;
  label: string;
}

const TYPE_META: Record<string, TypeMeta> = {
  AIRING: { icon: "\u23F0", color: "#29f2e0", label: "Airing" },
  FOLLOW: { icon: "\uD83D\uDC65", color: "#ff2d78", label: "Follow" },
  REVIEW: { icon: "\u2B50", color: "#ffb020", label: "Review" },
  COMMENT: { icon: "\uD83D\uDCAC", color: "#8a5cff", label: "Comment" },
  IMPORT: { icon: "\uD83D\uDCE5", color: "#29f2e0", label: "Import" },
  SYSTEM: { icon: "\u2699\uFE0F", color: "#807ba3", label: "System" },
  FRIEND: { icon: "\uD83E\uDD1D", color: "#ff2d78", label: "Friend" },
  ACTIVITY: { icon: "\uD83D\uDDFA\uFE0F", color: "#8a5cff", label: "Activity" },
};

const DEFAULT_META: TypeMeta = { icon: "\uD83D\uDD14", color: "#807ba3", label: "Update" };

const TYPES = ["ALL", "AIRING", "FOLLOW", "REVIEW", "COMMENT", "IMPORT", "SYSTEM", "FRIEND", "ACTIVITY"] as const;

function metaFor(type: string): TypeMeta {
  return TYPE_META[type] || DEFAULT_META;
}

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
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<string>("ALL");
  const offsetRef = useRef(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const router = useRouter();

  const fetchNotifications = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const currentOffset = reset ? 0 : offsetRef.current;
      const res = await fetch(`/api/notifications?limit=20&offset=${currentOffset}`);
      const data = await res.json();
      if (reset) {
        setNotifications(data.notifications ?? []);
      } else {
        setNotifications((prev) => [...prev, ...(data.notifications ?? [])]);
      }
      setUnreadCount(data.unreadCount ?? 0);
      setTotal(data.total ?? 0);
      setHasMore(data.notifications?.length === 20);
      if (!reset) offsetRef.current = currentOffset + 20;
    } catch (e) { logError(e); } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    offsetRef.current = 0;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount standard pattern
    fetchNotifications(true);
  }, [fetchNotifications]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications(true);
  }, [filter, fetchNotifications]);

  async function handleLoadMore() {
    await fetchNotifications();
  }

  async function handleMarkAll() {
    if (unreadCount === 0 || marking) return;
    setMarking(true);
    try {
      await fetch("/api/notifications", { method: "PUT" });
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch (e) { logError(e); } finally {
      setMarking(false);
    }
  }

  async function handleClick(n: Notification) {
    if (!n.read) {
      try {
        await fetch(`/api/notifications/${n.id}`, { method: "PUT" });
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (e) { logError(e); }
    }
    if (n.link) router.push(n.link);
  }

  const filtered = filter === "ALL" ? notifications : notifications.filter((n) => n.type === filter);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1.5 text-xs text-[var(--color-mute)]">
            <span className="font-semibold text-[var(--color-ink)]">{total}</span>
            total
          </span>
          {unreadCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-full border border-[var(--color-cyan)]/30 bg-[var(--color-cyan)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--color-cyan)]">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] shadow-[0_0_6px_var(--color-cyan)]" />
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={marking}
            className="rounded-full bg-gradient-to-r from-[var(--color-magenta)] to-[var(--color-violet)] px-4 py-1.5 text-xs font-bold text-black transition-transform hover:scale-105 disabled:opacity-50"
          >
            {marking ? "Marking..." : "Mark all read"}
          </button>
        )}
      </div>

      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
        {TYPES.map((t) => {
          const active = filter === t;
          const meta = t === "ALL" ? { icon: "\uD83D\uDCE2", color: "#29f2e0", label: "All" } : metaFor(t);
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-all ${
                active
                  ? "neon-rgb-border bg-[var(--color-panel)] text-[var(--color-ink)]"
                  : "border border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-mute)] hover:border-[var(--color-line)] hover:text-[var(--color-ink)]"
              }`}
              style={active ? { "--act-color": meta.color } as CSSProperties : undefined}
            >
              <span className="mr-1" style={{ color: meta.color }}>{meta.icon}</span>
              {meta.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && !loading && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] text-2xl">
              {filter === "ALL" ? "\uD83D\uDCE3" : metaFor(filter).icon}
            </div>
            <p className="text-sm text-[var(--color-mute)]">
              {filter === "ALL" ? "No notifications yet" : `No ${metaFor(filter).label.toLowerCase()} notifications`}
            </p>
          </div>
        )}

        {filtered.map((n) => {
          const meta = metaFor(n.type);
          return (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`neon-rgb-border flex w-full items-start gap-3 rounded-2xl bg-[var(--color-panel)] px-4 py-3.5 text-left transition-all ${
                !n.read ? "" : "opacity-80"
              }`}
              style={{ "--act-color": meta.color } as CSSProperties}
            >
              <span
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg"
                style={{ color: meta.color, borderColor: `color-mix(in srgb, ${meta.color} 35%, transparent)`, background: `color-mix(in srgb, ${meta.color} 10%, transparent)` }}
              >
                {meta.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm ${!n.read ? "font-semibold text-[var(--color-ink)]" : "text-[var(--color-mute)]"}`}>
                    {n.title}
                  </p>
                  {!n.read && (
                    <span
                      className="pulse-dot mt-1.5 h-2 w-2 shrink-0 rounded-full"
                      style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}` }}
                    />
                  )}
                </div>
                {n.body && <p className="mt-0.5 text-xs text-[var(--color-mute)]">{n.body}</p>}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span
                    className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: meta.color, borderColor: `color-mix(in srgb, ${meta.color} 30%, transparent)` }}
                  >
                    {meta.label}
                  </span>
                  <span className="text-[10px] text-[var(--color-mute)]">{timeAgo(n.createdAt)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] px-7 py-2.5 text-sm font-medium text-[var(--color-mute)] transition-all hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] hover:shadow-[0_0_16px_-4px_var(--color-cyan)] disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

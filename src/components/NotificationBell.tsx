"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function NotificationBell() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  async function fetchUnreadCount() {
    try {
      const res = await fetch("/api/notifications/unread");
      const data = await res.json();
      setUnreadCount(data.count ?? 0);
    } catch {}
  }

  useEffect(() => {
    if (!session?.user?.id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function openPanel() {
    setOpen(true);
    try {
      const res = await fetch("/api/notifications?limit=10");
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } catch {}
  }

  async function handleMarkAllRead() {
    try {
      await fetch("/api/notifications", { method: "PUT" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  }

  if (!session?.user?.id) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={openPanel}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-line)] bg-[var(--color-panel)] text-sm hover:border-[var(--color-cyan)] transition-colors"
        aria-label="Notifications"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--color-mute)]">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--color-magenta)] px-1 text-[9px] font-bold text-black leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl backdrop-blur-xl overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-line)]">
              <span className="text-sm font-semibold text-[var(--color-ink)]">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-xs text-[var(--color-cyan)] hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-[var(--color-mute)]">No notifications yet</div>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.link ?? "#"}
                    onClick={() => setOpen(false)}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/5 border-b border-[var(--color-line)] last:border-0 ${
                      !n.read ? "bg-white/[0.02]" : ""
                    }`}
                  >
                    <span className="text-base mt-0.5 shrink-0">{TYPE_ICONS[n.type] || "\uD83D\uDD14"}</span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${!n.read ? "font-semibold text-[var(--color-ink)]" : "text-[var(--color-mute)]"}`}>
                        {n.title}
                      </p>
                      {n.body && <p className="text-xs text-[var(--color-mute)] mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-[10px] text-[var(--color-mute)] mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-[var(--color-cyan)] shrink-0" />}
                  </Link>
                ))
              )}
            </div>
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-center text-sm font-medium text-[var(--color-cyan)] border-t border-[var(--color-line)] hover:bg-white/5 transition-colors"
            >
              View all
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

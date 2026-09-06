"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

interface AchToast {
  id: string;
  earnedAt: string;
  name: string;
  icon: string;
  description: string;
  points: number;
  category: string;
  kind: "achievement";
}

interface LevelToast {
  id: string;
  createdAt: string;
  body: string;
  kind: "levelup";
}

type Toast = AchToast | LevelToast;

const CURSOR_KEY = "zyni.toast.cursor";
const POLL_MS = 120000;
const TOAST_LIFETIME = 8000;

export default function ToastFeed() {
  const { data: session, status } = useSession();
  const [queue, setQueue] = useState<Toast[]>([]);
  const cursorRef = useRef<string | null>(null);
  const authedRef = useRef(false);

  function push(t: Toast) {
    setQueue((q) => [...q, t]);
    setTimeout(() => setQueue((q) => q.filter((x) => x.id !== t.id)), TOAST_LIFETIME);
  }

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      authedRef.current = false;
      return;
    }
    authedRef.current = true;
    let stopped = false;

    async function poll() {
      if (stopped || !authedRef.current) return;
      try {
        if (!cursorRef.current) {
          try { cursorRef.current = localStorage.getItem(CURSOR_KEY); } catch { /* ignore */ }
        }
        const after = cursorRef.current ?? new Date(Date.now()).toISOString();
        const res = await fetch(`/api/achievements/recent?after=${encodeURIComponent(after)}`);
        const data = await res.json();
        if (!stopped) {
          let newest: string | null = null;
          const items: Toast[] = [];
          (data.toasts || []).forEach((a: Omit<AchToast, "id" | "kind">) => {
            items.push({ ...a, id: `ach-${a.earnedAt}`, kind: "achievement" });
            if (!newest || a.earnedAt > newest) newest = a.earnedAt;
          });
          (data.levelUps || []).forEach((l: Omit<LevelToast, "id" | "kind">) => {
            items.push({ ...l, id: `lvl-${l.createdAt}`, kind: "levelup" });
            if (!newest || l.createdAt > newest) newest = l.createdAt;
          });
          if (newest) {
            const prevCursor = cursorRef.current;
            cursorRef.current = newest;
            try { localStorage.setItem(CURSOR_KEY, newest); } catch { /* ignore */ }
            // Only toast items newer than the last acknowledged cursor
            items
              .filter((t) => {
                if (!prevCursor) return true;
                const ts = t.kind === "achievement" ? t.earnedAt : t.createdAt;
                return ts > prevCursor;
              })
              .forEach(push);
          }
        }
      } catch { /* silent */ }
    }

    void poll();
    const iv = setInterval(poll, POLL_MS);
    return () => { stopped = true; clearInterval(iv); };
  }, [status, session?.user?.id]);

  return (
    <div className="fixed right-4 top-20 z-[80] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-3">
      <AnimatePresence>
        {queue.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className={`overflow-hidden rounded-2xl border-2 bg-[var(--color-panel)] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)] ${
              t.kind === "levelup" ? "border-[var(--color-magenta)]/40" : "border-[var(--color-cyan)]/40"
            }`}
          >
            <div className="flex items-start gap-3 px-3 py-2.5">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-cyan)]/25 to-[var(--color-magenta)]/25 text-lg">
                {t.kind === "levelup" ? "🎉" : t.icon || "🏅"}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-bold ${t.kind === "levelup" ? "text-[var(--color-magenta)]" : "text-[var(--color-cyan)]"}`}>
                  {t.kind === "levelup" ? "Level Up!" : `Achievement Unlocked: ${t.name}`}
                </p>
                <p className="text-[11px] text-[var(--color-mute)]">{t.kind === "levelup" ? t.body : t.description}</p>
                {(t.kind === "achievement" && t.points > 0) && (
                  <span className="mt-1 inline-block rounded-full border border-[var(--color-cyan)]/40 bg-[var(--color-cyan)]/10 px-2 py-0.5 text-[9px] font-bold text-[var(--color-cyan)]">
                    +{t.points} XP
                  </span>
                )}
              </div>
              <button
                onClick={() => setQueue((q) => q.filter((x) => x.id !== t.id))}
                className="shrink-0 text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
                aria-label="Dismiss"
              >✕</button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
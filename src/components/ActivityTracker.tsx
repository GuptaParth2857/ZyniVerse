"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { logError } from "@/lib/logger";

const BATCH_KEY = "activity_pending";
const BATCH_SIZE = 8;
const FLUSH_INTERVAL_MS = 900000;
const ACHIEVEMENT_INTERVAL_MS = 1800000;

function getPending(): Array<{ action: string; data: Record<string, unknown>; ts: number }> {
  try {
    return JSON.parse(localStorage.getItem(BATCH_KEY) || "[]");
  } catch {
    return [];
  }
}

function addPending(entry: { action: string; data: Record<string, unknown>; ts: number }) {
  const pending = getPending();
  pending.push(entry);
  localStorage.setItem(BATCH_KEY, JSON.stringify(pending));
}

function flushPending() {
  const pending = getPending();
  if (pending.length === 0) return;
  localStorage.removeItem(BATCH_KEY);

  fetch("/api/activity/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ batch: pending }),
  }).catch((e) => logError(e));
}

function extractMediaId(pathname: string): number | null {
  const match = pathname.match(/\/anime\/(\d+)/);
  return match ? Number(match[1]) : null;
}

function detectAction(pathname: string, searchParams: URLSearchParams): { action: string; data: Record<string, unknown> } {
  if (pathname.startsWith("/anime/")) {
    const mediaId = extractMediaId(pathname);
    if (pathname.includes("/filler")) return { action: "view_filler", data: { mediaId } };
    return { action: "view_anime", data: { mediaId } };
  }
  if (pathname.startsWith("/search")) {
    const genre = searchParams.get("genre");
    const q = searchParams.get("q");
    if (genre) return { action: "view_genre", data: { genres: [genre] } };
    if (q) return { action: "search", data: { query: q } };
    return { action: "search", data: {} };
  }
  if (pathname.startsWith("/schedule")) return { action: "view_schedule", data: {} };
  if (pathname.startsWith("/seasonal")) return { action: "view_seasonal", data: {} };
  if (pathname.startsWith("/watch-order")) return { action: "view_watch_order", data: {} };
  if (pathname.startsWith("/characters")) return { action: "view_character", data: {} };
  if (pathname.startsWith("/recommendations")) return { action: "view_recommendations", data: {} };
  if (pathname.startsWith("/manga")) return { action: "view_manga", data: {} };
  if (pathname.startsWith("/blog")) return { action: "view_blog", data: {} };
  if (pathname.startsWith("/wiki")) return { action: "view_wiki", data: {} };
  if (pathname.startsWith("/cosplay")) return { action: "view_cosplay", data: {} };
  return { action: "view_anime", data: {} };
}

export default function ActivityTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const lastTracked = useRef<string>("");
  const viewCount = useRef(0);
  const achievementTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!pathname) return;
    const key = `${pathname}?${searchParams.toString()}`;
    if (key !== lastTracked.current) {
      lastTracked.current = key;
      const { action, data } = detectAction(pathname, searchParams);
      addPending({ action, data, ts: Date.now() });
      viewCount.current++;

      if (viewCount.current >= BATCH_SIZE) {
        viewCount.current = 0;
        flushPending();
      }
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const interval = setInterval(() => {
      if (!document.hidden) flushPending();
    }, FLUSH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!userId || typeof window === "undefined") return;
    achievementTimer.current = setInterval(() => {
      fetch("/api/achievements/check-activity", { method: "POST" }).catch((e) => logError(e));
    }, ACHIEVEMENT_INTERVAL_MS);
    return () => {
      if (achievementTimer.current) clearInterval(achievementTimer.current);
    };
  }, [userId]);

  useEffect(() => {
    return () => {
      flushPending();
    };
  }, []);

  return null;
}

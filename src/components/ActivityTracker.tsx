"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function trackActivity(action: string, data?: Record<string, unknown>) {
  try {
    fetch("/api/activity/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...data }),
    });
  } catch {}
}

function checkAchievements() {
  try {
    fetch("/api/achievements/check-activity", { method: "POST" });
  } catch {}
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
  const lastTracked = useRef<string>("");
  const achievementCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!pathname) return;
    const key = `${pathname}?${searchParams.toString()}`;
    if (key === lastTracked.current) return;
    lastTracked.current = key;
    const { action, data } = detectAction(pathname, searchParams);
    trackActivity(action, data);

    if (achievementCheckTimer.current) clearTimeout(achievementCheckTimer.current);
    achievementCheckTimer.current = setTimeout(checkAchievements, 3000);
  }, [pathname, searchParams]);

  useEffect(() => {
    return () => {
      if (achievementCheckTimer.current) clearTimeout(achievementCheckTimer.current);
    };
  }, []);

  return null;
}

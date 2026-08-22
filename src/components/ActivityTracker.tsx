"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { logError } from "@/lib/logger";

function trackActivity(action: string, data?: Record<string, unknown>) {
  try {
    fetch("/api/activity/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...data }),
    }).catch((e) => logError(e));
  } catch (e) { logError(e); }
}

function checkAchievements() {
  try {
    fetch("/api/achievements/check-activity", { method: "POST" }).catch((e) => logError(e));
  } catch (e) { logError(e); }
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
  const achievementCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!pathname) return;
    const key = `${pathname}?${searchParams.toString()}`;
    if (key !== lastTracked.current) {
      lastTracked.current = key;
      const { action, data } = detectAction(pathname, searchParams);
      trackActivity(action, data);
    }

    // Achievements only exist for signed-in users — skip the round-trip
    // for guests entirely.
    if (!userId) return;
    if (achievementCheckTimer.current) clearTimeout(achievementCheckTimer.current);
    achievementCheckTimer.current = setTimeout(checkAchievements, 3000);
  }, [pathname, searchParams, userId]);

  useEffect(() => {
    return () => {
      if (achievementCheckTimer.current) clearTimeout(achievementCheckTimer.current);
    };
  }, []);

  return null;
}

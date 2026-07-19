import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchAllEpgFromPw } from "@/lib/epg-pw";
import { getAnimaxSchedule } from "@/lib/animax-schedule";

export const revalidate = 0;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: { task: string; status: number; detail?: string }[] = [];

  // 1. Fetch EPG data from epg.pw (free, works from any IP — no datacenter blocking)
  try {
    const epgData = await fetchAllEpgFromPw();

    for (const entry of epgData) {
      if (!entry.channelId || Object.keys(entry.days).length === 0) continue;
      const jsonData = JSON.parse(JSON.stringify(entry.days));
      await prisma.epgCache.upsert({
        where: { channelId: entry.channelId },
        update: { data: jsonData },
        create: { channelId: entry.channelId, data: jsonData },
      });
    }
    results.push({ task: "epg-cache", status: 200, detail: `${epgData.length} channels cached from epg.pw` });
  } catch (error) {
    results.push({ task: "epg-cache", status: 500, detail: error instanceof Error ? error.message : "Failed" });
  }

  // 2. Cache Animax schedule (hardcoded weekly rotation)
  try {
    const animaxResult = getAnimaxSchedule();
    const animaxDays: Record<string, typeof animaxResult.schedules[number]["slots"]> = {};
    for (const ds of animaxResult.schedules) {
      animaxDays[ds.day] = ds.slots;
    }
    if (Object.keys(animaxDays).length > 0) {
      const jsonData = JSON.parse(JSON.stringify(animaxDays));
      await prisma.epgCache.upsert({
        where: { channelId: "animax" },
        update: { data: jsonData },
        create: { channelId: "animax", data: jsonData },
      });
      results.push({ task: "animax-cache", status: 200, detail: "Animax cached (hardcoded schedule)" });
    } else {
      results.push({ task: "animax-cache", status: 200, detail: "Animax: no data (keeping existing cache)" });
    }
  } catch (error) {
    results.push({ task: "animax-cache", status: 500, detail: error instanceof Error ? error.message : "Failed" });
  }

  // 3. Warm caches
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";
  const routes = ["/api/tv-schedule/live", "/api/airing/live"];

  for (const route of routes) {
    try {
      const res = await fetch(`${baseUrl}${route}`, {
        headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
        next: { revalidate: 0 },
      });
      results.push({ task: `warm:${route}`, status: res.status });
    } catch {
      results.push({ task: `warm:${route}`, status: 500 });
    }
  }

  // 4. Update live-action anime data
  try {
    const { fetchLiveActionUpdates } = await import("@/lib/live-action-updater");
    const updateResult = await fetchLiveActionUpdates();
    const updatedCount = Object.values(updateResult.updates).length;
    results.push({
      task: "live-action-updates",
      status: 200,
      detail: `${updatedCount} titles checked, cache updated at ${updateResult.lastUpdated}`,
    });
  } catch (error) {
    results.push({
      task: "live-action-updates",
      status: 500,
      detail: error instanceof Error ? error.message : "Failed to update live-action data",
    });
  }

  return NextResponse.json({ refreshedAt: new Date().toISOString(), results });
}

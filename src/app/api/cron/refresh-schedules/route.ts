import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchAllEpgSchedules } from "@/lib/epg";

export const revalidate = 0;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: { task: string; status: number; detail?: string }[] = [];

  // 1. Fetch EPG data from JioTV and cache in Supabase
  try {
    const epgResults = await fetchAllEpgSchedules();
    for (const entry of epgResults) {
      await prisma.epgCache.upsert({
        where: { channelId: entry.channelId },
        update: { data: entry.days },
        create: { channelId: entry.channelId, data: entry.days },
      });
    }
    results.push({ task: "epg-cache", status: 200, detail: `${epgResults.length} channels cached` });
  } catch (error) {
    results.push({ task: "epg-cache", status: 500, detail: error instanceof Error ? error.message : "Failed" });
  }

  // 2. Warm other caches
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

  return NextResponse.json({ refreshedAt: new Date().toISOString(), results });
}

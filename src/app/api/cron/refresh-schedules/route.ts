import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

const RAILWAY_EPG_URL = "https://zyniverse.up.railway.app/api/epg";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: { task: string; status: number; detail?: string }[] = [];

  // 1. Fetch real EPG data from Railway (proxy for JioTV API — Vercel IPs get blocked)
  try {
    const res = await fetch(RAILWAY_EPG_URL, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`Railway EPG returned ${res.status}`);
    const data = await res.json() as { channels: { channelId: string; days: Record<string, unknown[]> }[] };

    for (const entry of data.channels) {
      if (!entry.channelId || Object.keys(entry.days).length === 0) continue;
      const jsonData = JSON.parse(JSON.stringify(entry.days));
      await prisma.epgCache.upsert({
        where: { channelId: entry.channelId },
        update: { data: jsonData },
        create: { channelId: entry.channelId, data: jsonData },
      });
    }
    results.push({ task: "epg-cache", status: 200, detail: `${data.channels.length} channels cached from Railway` });
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

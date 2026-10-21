import { NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { fetchWeeklyAiringSchedule } from "@/lib/anilist-schedule";

// Dynamic, not ISR: this route hits the AniList GraphQL API. ISR was
// forcing a build-time prerender that could hang `next build`.
export const dynamic = "force-dynamic";

async function GET_inner() {
  try {
    const schedule = await fetchWeeklyAiringSchedule();
    const grouped: Record<string, typeof schedule> = {};
    for (const entry of schedule) {
      if (!grouped[entry.day]) grouped[entry.day] = [];
      grouped[entry.day].push(entry);
    }
    for (const day of Object.keys(grouped)) {
      grouped[day].sort((a, b) => a.airTime.localeCompare(b.airTime));
    }
    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      days: grouped,
      total: schedule.length,
    });
  } catch (error) {
    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      days: {},
      total: 0,
      error: error instanceof Error ? error.message : "Failed to fetch",
    });
  }
}


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}

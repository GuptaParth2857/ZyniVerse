import { NextResponse } from "next/server";
import { fetchWeeklyAiringSchedule } from "@/lib/anilist-schedule";

export const revalidate = 1800;

export async function GET() {
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
    const message = error instanceof Error ? error.message : "Failed to fetch airing schedule";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/api-key";
import { getAiringSchedule } from "@/lib/anilist";

export async function GET(req: NextRequest) {
  const auth = await verifyApiKey(req);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const hoursBack = parseInt(searchParams.get("hours_back") || "6");
  const hoursAhead = parseInt(searchParams.get("hours_ahead") || "72");
  const now = Math.floor(Date.now() / 1000);

  try {
    const schedule = await getAiringSchedule(now - hoursBack * 3600, now + hoursAhead * 3600);
    return NextResponse.json({
      data: schedule.map((s) => ({
        mediaId: s.media.id,
        title: s.media.title.english || s.media.title.romaji,
        episode: s.episode,
        airingAt: s.airingAt,
        timeUntilAiring: (s as any).timeUntilAiring,
        coverImage: s.media.coverImage?.large || null,
        format: s.media.format,
        genres: s.media.genres,
      })),
      count: schedule.length,
      timeRange: {
        from: now - hoursBack * 3600,
        to: now + hoursAhead * 3600,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}

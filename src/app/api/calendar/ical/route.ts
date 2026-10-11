import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAiringSchedule } from "@/lib/anilist";
export const dynamic = "force-dynamic";

function formatICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeICal(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}@zyniverse.in`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const paramUserId = searchParams.get("userId");

  let userId = paramUserId ?? null;

  if (!userId) {
    const session = await auth();
    userId = session?.user?.id ?? null;
  }

  if (!userId) {
    return NextResponse.json({ error: "userId required or login required" }, { status: 400 });
  }

  const watchingEntries = await prisma.listEntry.findMany({
    where: { userId, status: "CURRENT" },
    select: { mediaId: true },
  });

  const mediaIds = watchingEntries.map((e) => e.mediaId);
  if (mediaIds.length === 0) {
    const empty = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ZyniVerse//Anime Watchlist Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:ZyniVerse Watchlist
END:VCALENDAR`;

    return new NextResponse(empty, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="zyniverse_watchlist.ics"',
        "Cache-Control": "no-cache",
      },
    });
  }

  const now = Math.floor(Date.now() / 1000);
  const threeMonthsLater = now + 90 * 24 * 60 * 60;

  const mediaIdSet = new Set(mediaIds);

  let scheduleItems: { media?: { id: number; title?: { romaji?: string; english?: string } }; episode?: number; airingAt?: number }[] = [];

  try {
    scheduleItems = await getAiringSchedule(now, threeMonthsLater);
  } catch {}

  const episodeProgress = await prisma.episodeProgress.findMany({
    where: { userId: { equals: userId } },
    select: { mediaId: true, episode: true },
  });

  const watchedSet = new Set(episodeProgress.map((p) => `${p.mediaId}-${p.episode}`));

  const vevents = scheduleItems
    .filter((item) => {
      const mediaId = item.media?.id;
      const episode = item.episode;
      if (!mediaId || !episode) return false;
      if (!mediaIdSet.has(mediaId)) return false;
      return !watchedSet.has(`${mediaId}-${episode}`);
    })
    .map((item) => {
      const title = item.media?.title?.english || item.media?.title?.romaji || `Anime #${item.media?.id}`;
      const ep = item.episode || 1;
      const airDate = item.airingAt ? new Date(item.airingAt * 1000) : new Date();
      const endDate = new Date(airDate.getTime() + 30 * 60 * 1000);

      return `BEGIN:VEVENT
UID:${generateUID()}
DTSTART:${formatICalDate(airDate)}
DTEND:${formatICalDate(endDate)}
SUMMARY:${escapeICal(`${title} Episode ${ep}`)}
DESCRIPTION:${escapeICal(`Episode ${ep} of ${title}\\nWatch on ZyniVerse: https://zyverse.in/anime/${item.media?.id}`)}
URL:https://zyverse.in/anime/${item.media?.id}
STATUS:CONFIRMED
END:VEVENT`;
    });

  const ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ZyniVerse//Anime Watchlist Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:ZyniVerse Watchlist
X-WR-TIMEZONE:Asia/Kolkata
${vevents.join("\n")}
END:VCALENDAR`;

  return new NextResponse(ical, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="zyniverse_watchlist.ics"',
      "Cache-Control": "no-cache",
    },
  });
}

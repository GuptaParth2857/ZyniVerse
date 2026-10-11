import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveUserId } from "@/lib/resolve-user";
import { getMediaBatch } from "@/lib/anilist";

const STATUS_MAP: Record<string, string> = {
  CURRENT: "watching",
  COMPLETED: "completed",
  PLANNED: "plan to watch",
  PLANNING: "plan to watch",
  DROPPED: "dropped",
  PAUSED: "on-hold",
  REWATCHING: "rewatching",
  REPEATING: "rewatching",
};

export async function GET(req: NextRequest) {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const format = req.nextUrl.searchParams.get("format") || "csv";

  const entries = await prisma.listEntry.findMany({
    where: { userId },
    select: {
      mediaId: true,
      type: true,
      status: true,
      progress: true,
      total: true,
      score: true,
      startedAt: true,
      completedAt: true,
    },
    orderBy: { mediaId: "asc" },
  });

  // Resolve real titles from AniList (chunked to respect the 50-id batch limit);
  // fall back to numeric placeholders only if AniList is unreachable.
  const titleMap = new Map<number, string>();
  try {
    const ids = entries.map((e) => e.mediaId);
    for (let i = 0; i < ids.length; i += 50) {
      const media = await getMediaBatch(ids.slice(i, i + 50));
      for (const m of media) {
        titleMap.set(m.id, m.title?.english || m.title?.romaji || `Anime #${m.id}`);
      }
    }
  } catch {
    // ignore, titles fall back to numeric ids below
  }
  const titleFor = (id: number) => titleMap.get(id) || `Anime #${id}`;

  if (format === "xml") {
    const fmtDate = (d: Date | null | undefined) => {
      if (!d) return "0000-00-00";
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    const rows = entries
      .map((e) => {
        const status = STATUS_MAP[e.status] || e.status.toLowerCase();
        const score = e.score ?? 0;
        return `    <anime>
      <series_animedb_id>${e.mediaId}</series_animedb_id>
      <my_status>${status}</my_status>
      <my_watched_episodes>${e.progress ?? 0}</my_watched_episodes>
      <my_score>${score}</my_score>
      <my_start_date>${fmtDate(e.startedAt)}</my_start_date>
      <my_finish_date>${fmtDate(e.completedAt)}</my_finish_date>
    </anime>`;
      })
      .join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<myanimelist>
${rows}
</myanimelist>`;
    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="zyniverse-myanimelist-${Date.now()}.xml"`,
      },
    });
  }

  if (format === "json") {
    const data = entries.map((e) => ({
      media_id: e.mediaId,
      title: titleFor(e.mediaId),
      type: e.type,
      status: STATUS_MAP[e.status] || e.status.toLowerCase(),
      episodes_watched: e.progress,
      total_episodes: e.total,
      score: e.score,
      start_date: e.startedAt?.toISOString().split("T")[0] || null,
      finish_date: e.completedAt?.toISOString().split("T")[0] || null,
    }));
    const json = JSON.stringify(data, null, 2);
    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="zyniverse-watchlist-${Date.now()}.json"`,
      },
    });
  }

  // Default: CSV
  const header = "anime_id,title,status,episodes_watched,total_episodes,score,start_date,finish_date";
  const rows = entries.map((e) => {
    const title = titleFor(e.mediaId);
    const status = STATUS_MAP[e.status] || e.status.toLowerCase();
    const start = e.startedAt?.toISOString().split("T")[0] || "";
    const finish = e.completedAt?.toISOString().split("T")[0] || "";
    const score = e.score != null ? String(e.score) : "";
    return `${e.mediaId},"${title.replace(/"/g, '""')}",${status},${e.progress},${e.total || ""},${score},${start},${finish}`;
  });

  const csv = [header, ...rows].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="zyniverse-watchlist-${Date.now()}.csv"`,
    },
  });
}

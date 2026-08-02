import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveUserId } from "@/lib/resolve-user";

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

  if (format === "json") {
    const data = entries.map((e) => ({
      media_id: e.mediaId,
      title: `Anime #${e.mediaId}`,
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
    const title = `Anime #${e.mediaId}`;
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

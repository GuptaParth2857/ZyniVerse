import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
export const dynamic = "force-dynamic";

type ContentKind = "MEME" | "FANART" | "COSPLAY" | "CLIP" | "REEL" | "POST" | "COMMENT" | "REVIEW" | "LONG_REVIEW" | "BLOG" | "WIKI" | "FORUM_THREAD" | "FORUM_POST" | "CLUB_POST" | "CLUB_COMMENT" | "REEL_COMMENT" | "MOMENT";

const PREVIEW_MODELS: Partial<Record<ContentKind, { model: string; titleField: string }>> = {
  MEME: { model: "meme", titleField: "title" },
  FANART: { model: "fanArt", titleField: "title" },
  COSPLAY: { model: "cosplay", titleField: "title" },
  CLIP: { model: "sceneClip", titleField: "title" },
  REEL: { model: "reel", titleField: "title" },
  POST: { model: "post", titleField: "title" },
  COMMENT: { model: "comment", titleField: "content" },
  REVIEW: { model: "review", titleField: "comment" },
  LONG_REVIEW: { model: "longReview", titleField: "title" },
  BLOG: { model: "blogPost", titleField: "title" },
  WIKI: { model: "wikiPage", titleField: "title" },
  MOMENT: { model: "moment", titleField: "quote" },
  REEL_COMMENT: { model: "reelComment", titleField: "content" },
  FORUM_THREAD: { model: "forumThread", titleField: "title" },
  FORUM_POST: { model: "forumPost", titleField: "content" },
  CLUB_POST: { model: "clubPost", titleField: "title" },
  CLUB_COMMENT: { model: "clubPostComment", titleField: "content" },
};

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") || "PENDING";

  try {
    const reports = await prisma.contentReport.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { id: true, username: true, avatar: true } } },
    });

    const previews: Record<string, string> = {};
    for (const report of reports) {
      const cfg = PREVIEW_MODELS[report.contentType as ContentKind];
      if (!cfg) continue;
      try {
        const row = await (prisma as unknown as Record<string, { findUnique: (args: { where: { id: string }; select: Record<string, boolean | string> }) => Promise<Record<string, string | null> | null> }>)[cfg.model].findUnique({
          where: { id: report.contentId },
          select: { [cfg.titleField]: true },
        });
        if (row) previews[report.id] = String(row[cfg.titleField] ?? "");
      } catch {
        /* content may have been deleted */
      }
    }

    return NextResponse.json({
      reports: reports.map((r) => ({
        ...r,
        preview: previews[r.id] ?? null,
      })),
      status,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load reports" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = body?.id as string | undefined;
  const newStatus = (body?.status as string | undefined)?.toUpperCase();

  if (!id || !["RESOLVED", "DISMISSED", "PENDING"].includes(newStatus || "")) {
    return NextResponse.json({ error: "Invalid status or id" }, { status: 400 });
  }

  try {
    const report = await prisma.contentReport.update({
      where: { id },
      data: { status: newStatus as "RESOLVED" | "DISMISSED" | "PENDING" },
    });
    return NextResponse.json({ ok: true, report });
  } catch {
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}
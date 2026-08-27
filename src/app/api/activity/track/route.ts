import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const VALID_ACTIONS = [
  "view_anime",
  "search",
  "view_filler",
  "view_watch_order",
  "add_to_list",
  "remove_from_list",
  "view_schedule",
  "view_seasonal",
  "view_genre",
  "view_character",
  "view_recommendations",
  "click_recommendation",
  "view_manga",
  "view_blog",
  "view_wiki",
  "view_cosplay",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session = await auth();
    const userId = session?.user?.id || null;

    if (Array.isArray(body.batch)) {
      const entries = body.batch
        .filter((e: { action: string }) => e.action && VALID_ACTIONS.includes(e.action))
        .map((e: { action: string; data?: Record<string, unknown> }) => ({
          userId,
          action: e.action,
          mediaId: e.data?.mediaId ? Number(e.data.mediaId) : null,
          query: typeof e.data?.query === "string" ? (e.data.query as string).trim().slice(0, 200) : null,
          genres: Array.isArray(e.data?.genres) ? (e.data.genres as string[]).slice(0, 10) : [],
          metadata: e.data || undefined,
        }));

      if (entries.length > 0) {
        await prisma.userActivity.createMany({ data: entries });
      }
    } else {
      const { action, mediaId, query, genres, metadata } = body;
      if (!action || !VALID_ACTIONS.includes(action)) {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
      }
      await prisma.userActivity.create({
        data: {
          userId,
          action,
          mediaId: mediaId ? Number(mediaId) : null,
          query: query?.trim()?.slice(0, 200) || null,
          genres: Array.isArray(genres) ? genres.slice(0, 10) : [],
          metadata: metadata || undefined,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Activity track error:", e);
    return NextResponse.json({ error: "Failed to track" }, { status: 500 });
  }
}

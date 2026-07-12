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
    const { action, mediaId, query, genres, metadata } = body;

    if (!action || !VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const session = await auth();
    const userId = session?.user?.id || null;

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

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Activity track error:", e);
    return NextResponse.json({ error: "Failed to track" }, { status: 500 });
  }
}

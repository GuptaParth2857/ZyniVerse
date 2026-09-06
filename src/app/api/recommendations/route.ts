import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveUserId } from "@/lib/resolve-user";
import { auth } from "@/lib/auth";
import { searchMedia, getTrending, getTopRated, getUpcoming, bestTitle } from "@/lib/anilist";
import type { Media } from "@/lib/anilist";
import { getAIRecommendations } from "@/lib/ai-recommender";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

const VALID_GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery",
  "Psychological", "Romance", "Sci-Fi", "Slice of Life", "Sports",
  "Supernatural", "Thriller", "Mecha",
];

function mediaToRec(m: Media, reason = ""): {
  id: number; title: string; image: string; score: number; reason: string;
  format: string; episodes: number; genres: string[]; matchTags: string[];
} {
  return {
    id: m.id,
    title: bestTitle(m.title),
    image: m.coverImage?.extraLarge || m.coverImage?.large || m.coverImage?.medium || "",
    score: m.averageScore || 0,
    reason,
    format: m.format || "",
    episodes: m.episodes || 0,
    genres: m.genres || [],
    matchTags: [],
  };
}

async function discovery(type: string, genre: string | null, userId: string | null) {
  const PER = 24;
  const seen = new Set<number>();
  const push = (list: { id: number }[]) => {
    const out: typeof list = [];
    for (const it of list) {
      if (seen.has(it.id)) continue;
      seen.add(it.id);
      out.push(it);
    }
    return out;
  };

  switch (type) {
    case "ai":
    case "personalized": {
      // "AI Picks" uses taste from anonymous+personal activity; "For You" is
      // strictly the logged-in user's taste profile (falls back to trending).
      const recs = await getAIRecommendations(userId ?? undefined);
      return push(recs.map((r) => ({
        id: r.id, title: r.title, image: r.image, score: r.score,
        reason: r.reason, format: r.format, episodes: r.episodes,
        genres: r.genres, matchTags: r.matchTags,
      }))).slice(0, type === "personalized" ? 24 : 12);
    }
    case "top_rated": {
      const top = await getTopRated(PER);
      return push(top.map((m) => mediaToRec(m, "One of the highest-rated anime — a must-watch."))).slice(0, 24);
    }
    case "upcoming": {
      const up = await getUpcoming(PER);
      return push(up.map((m) => mediaToRec(m, "Coming soon — add it to your watchlist."))).slice(0, 24);
    }
    case "genre": {
      if (!genre || !VALID_GENRES.includes(genre)) {
        return NextResponse.json({ error: "A valid genre is required for genre discovery." }, { status: 400 });
      }
      const g = await searchMedia({ genre, sort: "POPULARITY_DESC", perPage: PER });
      return push(g.media.map((m) => mediaToRec(m, `Top ${genre} anime picked for you.`))).slice(0, 24);
    }
    case "trending":
    default: {
      const tr = await getTrending(PER);
      return push(tr.map((m) => mediaToRec(m, "Trending now — join the conversation."))).slice(0, 24);
    }
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const type = (url.searchParams.get("type") || "").trim().toLowerCase();
  const genre = url.searchParams.get("genre")?.trim() || null;

  // Fan recommendations (from feature D): /api/recommendations?fromId=&toId=
  if (!type && (url.searchParams.get("fromId") || url.searchParams.get("toId"))) {
    const fromId = Number(url.searchParams.get("fromId"));
    const toId = Number(url.searchParams.get("toId"));
    const order = url.searchParams.get("order") || "top";
    const where = fromId ? { fromMediaId: fromId } : toId ? { toMediaId: toId } : undefined;
    const recs = await prisma.mediaRecommendation.findMany({
      where,
      orderBy: order === "new" ? { createdAt: "desc" } : { upvotes: "desc" },
      take: 50,
    });
    return NextResponse.json({ recommendations: recs });
  }

  // Discovery mode (fixes the Recommendations page)
  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session?.user?.id ?? null;
  } catch { /* anonymous browsing still works */ }

  try {
    const body = await discovery(type, genre, userId);
    if (body instanceof NextResponse) return body;
    return NextResponse.json({ recommendations: body });
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Failed to load recommendations, try again shortly." }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const userId = await resolveUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const fromMediaId = Number(body.fromMediaId);
  const fromTitle = String(body.fromTitle || "").trim();
  const fromType = body.fromType || "ANIME";
  const toMediaId = Number(body.toMediaId);
  const toTitle = String(body.toTitle || "").trim();
  const toType = body.toType || "ANIME";
  const meaning = String(body.meaning || "").trim();

  if (!fromMediaId || !toMediaId || !toTitle || !meaning) {
    return NextResponse.json({ error: "fromMediaId, toMediaId, toTitle and meaning required" }, { status: 400 });
  }
  if (meaning.length > 500) {
    return NextResponse.json({ error: "Meaning too long (max 500 chars)" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });

  const rec = await prisma.mediaRecommendation.create({
    data: {
      fromMediaId,
      fromTitle,
      fromType,
      toMediaId,
      toTitle,
      toType,
      meaning,
      userId,
      authorUsername: user?.username ?? null,
    },
  });

  return NextResponse.json({ recommendation: rec }, { status: 201 });
}
import { NextResponse } from "next/server";
import { getTrending, bestTitle } from "@/lib/anilist";

export const revalidate = 86400;

function dayKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function pickForDay<T>(list: T[], day: string): T {
  let hash = 0;
  for (let i = 0; i < day.length; i++) hash = (hash * 31 + day.charCodeAt(i)) >>> 0;
  return list[hash % list.length];
}

export async function GET() {
  const day = dayKey(new Date());

  let trending;
  try {
    trending = await getTrending(60);
  } catch {
    return NextResponse.json({ error: "Could not load today's pick" }, { status: 502 });
  }

  if (!trending.length) {
    return NextResponse.json({ error: "Could not load today's pick" }, { status: 502 });
  }

  const anime = pickForDay(trending, day);
  const title = bestTitle(anime.title);

  return NextResponse.json({
    day,
    anime: {
      id: anime.id,
      title,
      image: anime.coverImage?.extraLarge || anime.coverImage?.large || anime.coverImage?.medium || "",
      format: anime.format || "",
      episodes: anime.episodes || 0,
      genres: anime.genres || [],
      score: anime.averageScore || 0,
      popularity: anime.popularity || 0,
      status: anime.status || "",
      synopsis: anime.description || "",
    },
    why: `Today ka pick hai — ${title}. Stream yeh trending anime aur apna mood match karo.`,
  }, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}

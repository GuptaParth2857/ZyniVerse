import { NextRequest, NextResponse } from "next/server";
import { getDoujinshi } from "@/lib/mangadex-api";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const sort = (searchParams.get("sort") as "popular" | "latest" | "rating" | "title") || "popular";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const perPage = Math.min(50, Math.max(1, Number(searchParams.get("perPage")) || 20));
  const offset = (page - 1) * perPage;
  const genres = searchParams.get("genres")?.split(",").filter(Boolean) || undefined;

  try {
    const { entries, total } = await getDoujinshi({ search, limit: perPage, offset, sort, genres });
    return NextResponse.json({
      entries,
      total,
      page,
      perPage,
      hasMore: offset + perPage < total,
    });
  } catch (err) {
    console.error("[doujinshi] API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch doujinshi from MangaDex", entries: [], total: 0 },
      { status: 502 },
    );
  }
}

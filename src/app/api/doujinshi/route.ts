import { NextRequest, NextResponse } from "next/server";
import { getDoujinshi } from "@/lib/mangadex-api";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const sort = (searchParams.get("sort") as "popular" | "latest" | "rating" | "title") || "popular";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const perPage = Math.min(50, Math.max(1, Number(searchParams.get("perPage")) || 20));
  const offset = (page - 1) * perPage;

  try {
    const { entries, total } = await getDoujinshi({ search, limit: perPage, offset, sort });
    return NextResponse.json({
      entries,
      total,
      page,
      perPage,
      hasMore: offset + perPage < total,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch doujinshi from MangaDex" },
      { status: 502 },
    );
  }
}

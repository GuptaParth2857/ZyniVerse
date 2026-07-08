import { NextRequest, NextResponse } from "next/server";
import { getMangaDexChapterPages } from "@/lib/manga-reader";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get("chapterId");
  const source = searchParams.get("source") || "mangadex";

  if (!chapterId) {
    return NextResponse.json({ error: "chapterId is required" }, { status: 400 });
  }

  if (source === "mangadex") {
    const pages = await getMangaDexChapterPages(chapterId);
    return NextResponse.json({ pages });
  }

  return NextResponse.json({ pages: [] });
}

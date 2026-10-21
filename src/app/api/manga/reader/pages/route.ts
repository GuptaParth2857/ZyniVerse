import { NextRequest, NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { getMangaDexChapterPages } from "@/lib/manga-reader";
export const dynamic = "force-dynamic";

async function GET_inner(req: NextRequest) {
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


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}

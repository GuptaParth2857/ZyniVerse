import { NextRequest, NextResponse } from "next/server";
import { getMangaDexChapters } from "@/lib/manga-reader";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source") || "mangadex";
  const mangaId = searchParams.get("mangaId");
  const language = searchParams.get("language") || "en";

  if (!mangaId) {
    return NextResponse.json({ error: "mangaId is required" }, { status: 400 });
  }

  if (source === "mangadex") {
    const chapters = await getMangaDexChapters(mangaId, language);
    return NextResponse.json({ chapters });
  }

  return NextResponse.json({ chapters: [] });
}

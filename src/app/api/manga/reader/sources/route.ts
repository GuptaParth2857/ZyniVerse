import { NextRequest, NextResponse } from "next/server";
import { getSourcesForManga } from "@/lib/manga-reader";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title");

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const sources = getSourcesForManga(title);
  return NextResponse.json({ sources });
}

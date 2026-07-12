import { NextRequest, NextResponse } from "next/server";
import { searchCharacter } from "@/lib/jikan";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchCharacter(q.trim());
  return NextResponse.json({ results });
}

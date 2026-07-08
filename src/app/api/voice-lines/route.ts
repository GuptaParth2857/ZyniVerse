import { NextRequest, NextResponse } from "next/server";
import { getDynamicVoiceLines } from "@/lib/voice-lines";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const animeId = searchParams.get("animeId")
    ? parseInt(searchParams.get("animeId")!)
    : undefined;
  const character = searchParams.get("character") || undefined;
  const language = searchParams.get("language") || undefined;
  const type = searchParams.get("type") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const all = await getDynamicVoiceLines(search, animeId, character, language, type);
  const total = all.length;
  const start = (page - 1) * limit;
  const lines = all.slice(start, start + limit);

  return NextResponse.json({ lines, total, page, limit });
}

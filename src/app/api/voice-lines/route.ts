import { NextRequest, NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { getDynamicVoiceLines } from "@/lib/voice-lines";
export const dynamic = "force-dynamic";

async function GET_inner(req: NextRequest) {
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


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}

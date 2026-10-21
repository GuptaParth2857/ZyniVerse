import { NextRequest, NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { searchVoiceActors } from "@/lib/voice-actors";
export const dynamic = "force-dynamic";

async function GET_inner(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");

  if (!query.trim()) {
    return NextResponse.json({ actors: [], total: 0 });
  }

  try {
    const result = await searchVoiceActors(query.trim(), page);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to search voice actors" }, { status: 500 });
  }
}


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}

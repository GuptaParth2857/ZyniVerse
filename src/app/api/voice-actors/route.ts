import { NextRequest, NextResponse } from "next/server";
import { searchVoiceActors } from "@/lib/voice-actors";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");

  if (!query.trim()) {
    return NextResponse.json({ actors: [], total: 0 });
  }

  try {
    const result = await searchVoiceActors(query.trim(), page);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

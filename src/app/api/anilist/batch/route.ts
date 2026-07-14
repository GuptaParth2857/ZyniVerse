import { NextRequest, NextResponse } from "next/server";
import { getMediaBatch } from "@/lib/anilist";

export async function POST(req: NextRequest) {
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids array required" }, { status: 400 });
    }
    const media = await getMediaBatch(ids.slice(0, 50));
    return NextResponse.json({ media });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

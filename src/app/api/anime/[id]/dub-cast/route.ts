import { NextRequest, NextResponse } from "next/server";
import { getIndianDubCast } from "@/lib/voice-actors";
import { logError } from "@/lib/logger";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const mediaId = Number((await params).id);
  if (!Number.isInteger(mediaId) || mediaId <= 0) {
    return NextResponse.json({ error: "Invalid anime id" }, { status: 404 });
  }

  try {
    const roles = await getIndianDubCast(mediaId);
    return NextResponse.json({ roles });
  } catch (e) {
    logError(e);
    return NextResponse.json({ roles: [] }, { status: 500 });
  }
}
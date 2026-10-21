import { NextRequest, NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { getIndianDubCast } from "@/lib/voice-actors";
import { logError } from "@/lib/logger";

async function GET_inner(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}

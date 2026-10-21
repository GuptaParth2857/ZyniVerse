import { NextRequest, NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { getVoiceActor } from "@/lib/voice-actors";

async function GET_inner(req: NextRequest,
  { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const actor = await getVoiceActor(parseInt(id));
    return NextResponse.json({ actor });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal server error" }, { status: 500 });
  }
}


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}

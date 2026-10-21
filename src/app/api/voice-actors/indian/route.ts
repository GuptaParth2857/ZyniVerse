import { NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { getIndianVoiceActors } from "@/lib/voice-actors";

async function GET_inner() {
  const actors = await getIndianVoiceActors();
  return NextResponse.json({ actors, total: actors.length });
}


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}

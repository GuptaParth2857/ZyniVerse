import { NextResponse } from "next/server";
import { getIndianVoiceActors } from "@/lib/voice-actors";

export async function GET() {
  const actors = await getIndianVoiceActors();
  return NextResponse.json({ actors, total: actors.length });
}

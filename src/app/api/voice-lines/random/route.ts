import { NextResponse } from "next/server";
import { getDynamicRandomVoiceLine } from "@/lib/voice-lines";

export async function GET() {
  const line = await getDynamicRandomVoiceLine();
  return NextResponse.json({ line });
}

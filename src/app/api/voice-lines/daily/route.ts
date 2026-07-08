import { NextResponse } from "next/server";
import { getDynamicQuoteOfTheDay } from "@/lib/voice-lines";

export async function GET() {
  const line = await getDynamicQuoteOfTheDay();
  return NextResponse.json({ line });
}

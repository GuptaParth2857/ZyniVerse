import { NextResponse } from "next/server";
import { getDynamicQuoteOfTheDay } from "@/lib/voice-lines";

export async function GET() {
  const line = await getDynamicQuoteOfTheDay();
  return NextResponse.json(
    { line },
    // Quote changes once a day; let the CDN serve it to everyone.
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
  );
}

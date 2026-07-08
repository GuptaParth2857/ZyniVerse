import { NextResponse } from "next/server";
import { getStreamingSources } from "@/lib/streaming";
import { apiLimiter } from "@/lib/rate-limiter";

export async function GET(request: Request) {
  const limited = apiLimiter.middleware(request);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");

  if (!title) {
    return NextResponse.json({ error: "title query parameter is required" }, { status: 400 });
  }

  if (title.length > 200) {
    return NextResponse.json({ error: "title too long" }, { status: 400 });
  }

  const sources = getStreamingSources(title);

  return NextResponse.json({ sources });
}

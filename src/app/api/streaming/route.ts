import { NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { getStreamingSources } from "@/lib/streaming";
import { apiLimiter } from "@/lib/rate-limiter";
export const dynamic = "force-dynamic";

async function GET_inner(request: Request) {
  const limited = await apiLimiter.middleware(request);
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


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}

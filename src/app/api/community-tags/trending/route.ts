import { NextResponse } from "next/server";
import { getTrendingTags } from "@/lib/community-tags";

export async function GET() {
  const tags = await getTrendingTags(50);
  return NextResponse.json({ tags }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}

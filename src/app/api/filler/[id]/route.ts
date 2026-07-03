import { NextRequest, NextResponse } from "next/server";
import { getFillerForAnime } from "@/lib/filler";
import { apiLimiter } from "@/lib/rate-limiter";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const { id } = await params;
  const anilistId = Number(id);
  if (isNaN(anilistId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const title = req.nextUrl.searchParams.get("title") || undefined;

  try {
    const data = await getFillerForAnime(anilistId, title);
    if (!data) {
      return NextResponse.json({ found: false }, { status: 200 });
    }
    return NextResponse.json({ found: true, ...data }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch filler data" }, { status: 500 });
  }
}

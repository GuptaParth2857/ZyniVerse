import { getUserStats } from "@/lib/stats";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { resolveUserId } from "@/lib/resolve-user";

export async function GET(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const yearParam = Number(url.searchParams.get("year"));
  const year = Number.isInteger(yearParam) && yearParam >= 2010 ? yearParam : undefined;

  const stats = await getUserStats(userId, year);
  return NextResponse.json(stats);
}

import { getUserStats } from "@/lib/stats";
import { withPublicCache } from "@/lib/api-cache";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { resolveUserId } from "@/lib/resolve-user";

async function GET_inner(req: NextRequest) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const yearParam = Number(url.searchParams.get("year"));
  const year = Number.isInteger(yearParam) && yearParam >= 2010 ? yearParam : undefined;

  const stats = await getUserStats(userId, year);
  return NextResponse.json(stats);
}


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}

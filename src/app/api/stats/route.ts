import { getUserStats } from "@/lib/stats";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { resolveUserId } from "@/lib/resolve-user";

export async function GET(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stats = await getUserStats(userId);
  return NextResponse.json(stats);
}

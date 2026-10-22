import { NextRequest, NextResponse } from "next/server";
import { startSession, countryFromRequest, isAutomatedRequest } from "@/lib/analytics";
import { createRateLimiter } from "@/lib/rate-limiter";

// The client posts /api/analytics/session once per page load. Cap it so a
// refresh loop or a script cannot turn every request into a DB insert.
const sessionLimiter = createRateLimiter("analytics-session", {
  maxRequests: 10,
  windowMs: 60 * 1000,
});

export async function POST(req: NextRequest) {
  try {
    // A known crawler/tool User-Agent never gets a session row. This is the
    // single biggest source of database growth: during the 2026-10-11..20
    // crawl storm this endpoint created ~19.6k sessions/day, 94% of them
    // `Chrome / Linux` from datacenter IPs. Each one was a Vercel invocation
    // and a row in a 54.8 MB table.
    if (isAutomatedRequest(req.headers)) {
      return NextResponse.json({ sessionId: null });
    }

    if (!sessionLimiter.checkSync(sessionLimiter.getClientIp(req)).allowed) {
      return NextResponse.json({ sessionId: null });
    }

    const body = await req.json();
    const sessionId = await startSession({
      sessionId: body.sessionId,
      userId: body.userId,
      device: body.device,
      browser: body.browser,
      os: body.os,
      country: countryFromRequest(req.headers),
    });
    return NextResponse.json({ sessionId });
  } catch {
    return NextResponse.json({ sessionId: null });
  }
}

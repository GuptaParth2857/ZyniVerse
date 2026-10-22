import { NextResponse } from "next/server";
import {
  trackPageView,
  trackPageViewBatch,
  countryFromRequest,
  isAutomatedRequest,
  userAgentFromRequest,
} from "@/lib/analytics";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Crawlers that execute JavaScript (headless scrapers) reach this
    // endpoint too. Recording them costs a serverless invocation plus a
    // database write per batch and pollutes the dashboard numbers, so they
    // are dropped here.
    if (isAutomatedRequest(req.headers)) {
      return NextResponse.json({ ok: true });
    }

    const country = countryFromRequest(req.headers);
    const userAgent = userAgentFromRequest(req.headers, body.userAgent);

    if (Array.isArray(body.batch)) {
      await trackPageViewBatch(
        body.batch.map((e: { path: string; sessionId?: string; referrer?: string }) => ({
          path: e.path,
          sessionId: e.sessionId,
          referrer: e.referrer,
          country,
          userAgent,
        }))
      );
    } else {
      await trackPageView({
        path: body.path,
        userId: body.userId,
        sessionId: body.sessionId,
        referrer: body.referrer,
        userAgent,
        country,
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

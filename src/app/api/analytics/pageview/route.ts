import { NextResponse } from "next/server";
import { trackPageView, trackPageViewBatch, countryFromRequest } from "@/lib/analytics";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const country = countryFromRequest(req.headers);

    if (Array.isArray(body.batch)) {
      await trackPageViewBatch(
        body.batch.map((e: { path: string; sessionId?: string; referrer?: string }) => ({
          path: e.path,
          sessionId: e.sessionId,
          referrer: e.referrer,
          country,
        }))
      );
    } else {
      await trackPageView({
        path: body.path,
        userId: body.userId,
        sessionId: body.sessionId,
        referrer: body.referrer,
        userAgent: body.userAgent,
        country,
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

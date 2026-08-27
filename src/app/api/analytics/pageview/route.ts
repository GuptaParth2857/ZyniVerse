import { NextResponse } from "next/server";
import { trackPageView, countryFromRequest } from "@/lib/analytics";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const country = countryFromRequest(req.headers);

    if (Array.isArray(body.batch)) {
      for (const entry of body.batch) {
        await trackPageView({
          path: entry.path,
          userId: entry.userId,
          sessionId: entry.sessionId,
          referrer: entry.referrer,
          userAgent: entry.userAgent,
          country,
        });
      }
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

import { NextResponse } from "next/server";
import { trackPageView } from "@/lib/analytics";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await trackPageView({
      path: body.path,
      userId: body.userId,
      sessionId: body.sessionId,
      referrer: body.referrer,
      userAgent: body.userAgent,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

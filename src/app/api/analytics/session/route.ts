import { NextResponse } from "next/server";
import { startSession } from "@/lib/analytics";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionId = await startSession({
      userId: body.userId,
      device: body.device,
      browser: body.browser,
      os: body.os,
    });
    return NextResponse.json({ sessionId });
  } catch {
    return NextResponse.json({ sessionId: null });
  }
}

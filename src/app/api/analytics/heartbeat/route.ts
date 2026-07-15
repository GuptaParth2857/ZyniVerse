import { NextResponse } from "next/server";
import { updateSessionActivity } from "@/lib/analytics";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await updateSessionActivity(body.sessionId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

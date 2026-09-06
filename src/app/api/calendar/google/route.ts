import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let userId = searchParams.get("userId") ?? null;

  if (!userId) {
    const session = await auth();
    userId = session?.user?.id ?? null;
  }

  if (!userId) {
    return NextResponse.json({ error: "userId required or login required" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";
  const icalUrl = `${baseUrl}/api/calendar/ical?userId=${encodeURIComponent(userId)}`;
  const googleImportUrl = `https://calendar.google.com/calendar/r/ical/${encodeURIComponent(icalUrl)}`;

  return NextResponse.json({
    importUrl: googleImportUrl,
    icalUrl,
  });
}

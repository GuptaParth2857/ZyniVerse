import { NextRequest, NextResponse } from "next/server";
import { syncLiveActionPosters } from "@/lib/live-action-posters";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { results, errors } = await syncLiveActionPosters();
    return NextResponse.json({
      success: true,
      matched: results.filter((r) => r.matched).length,
      checked: results.length,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Cron refresh failed", details: String(error) },
      { status: 500 }
    );
  }
}

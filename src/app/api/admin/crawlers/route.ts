import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getBotStats, resetBotStats, BOT_TREND_DAYS } from "@/lib/bot-stats";

// `requireAdmin()` reads `headers()` through `auth()`; without force-dynamic the
// handler is prerendered at build time and the request-time error is swallowed
// by the try/catch (same fix as /api/admin/visitors/active).
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const daysParam = Number(new URL(req.url).searchParams.get("days"));
    const days =
      Number.isFinite(daysParam) && daysParam >= 7 && daysParam <= 90
        ? Math.floor(daysParam)
        : BOT_TREND_DAYS;

    return NextResponse.json(await getBotStats(days), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to build crawler stats:", error);
    return NextResponse.json({ error: "Failed to load crawler stats" }, { status: 500 });
  }
}

/** Clear the counters, e.g. after a crawler appears in the list for testing. */
export async function DELETE() {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const deleted = await resetBotStats();
    return NextResponse.json({ ok: true, deleted });
  } catch (error) {
    console.error("Failed to reset crawler stats:", error);
    return NextResponse.json({ error: "Failed to reset" }, { status: 500 });
  }
}

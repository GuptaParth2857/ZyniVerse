import { NextResponse } from "next/server";
import { recordBotHit } from "@/lib/bot-stats";

/**
 * Internal ingestion endpoint for crawler hits.
 *
 * Called from `src/proxy.ts` via `event.waitUntil()`: crawlers don't run
 * JavaScript, so the client-side analytics beacon can never see them and the
 * only place they can be observed is the server request path.
 *
 * Not linked or advertised anywhere, and /api/ is disallowed in robots.txt
 * (`PRIVATE_PATHS`). `recordBotHit` re-runs the User-Agent classifier itself, so
 * a request with a browser UA is silently ignored — spoofing the endpoint
 * requires sending a bot-shaped UA, i.e. exactly what we want to count.
 */

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | { path?: unknown; userAgent?: unknown; country?: unknown }
      | null;

    const path = typeof body?.path === "string" ? body.path : req.headers.get("x-bot-path");
    const userAgent =
      typeof body?.userAgent === "string" && body.userAgent ? body.userAgent : req.headers.get("user-agent");
    const country =
      typeof body?.country === "string" && body.country
        ? body.country
        : req.headers.get("x-vercel-ip-country");

    const bot = await recordBotHit({ userAgent, path, country });
    return NextResponse.json({ ok: true, bot: bot?.id ?? null });
  } catch {
    // Never surface an error to the caller — this is fire-and-forget telemetry.
    return NextResponse.json({ ok: false });
  }
}

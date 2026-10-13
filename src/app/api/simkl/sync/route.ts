import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveUserId } from "@/lib/resolve-user";
import { runSimklSync } from "@/lib/sync-simkl";
import { simklConfigured } from "@/lib/simkl-client";
import { apiLimiter } from "@/lib/rate-limiter";
import { decryptSecret } from "@/lib/token-encryption";

export const runtime = "nodejs";

export async function GET() {
  const configured = simklConfigured();
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ connected: false, configured });

  const account = await prisma.externalAccount.findUnique({
    where: { userId_provider: { userId, provider: "simkl" } },
    select: { createdAt: true, syncAt: true, lastSyncData: true },
  });
  if (!account) return NextResponse.json({ connected: false, configured });

  return NextResponse.json({
    connected: true,
    configured,
    connectedAt: account.createdAt.toISOString(),
    lastSync: account.syncAt ? account.syncAt.toISOString() : null,
    lastSyncData: account.lastSyncData,
  });
}

export async function POST(req: NextRequest) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!simklConfigured()) return NextResponse.json({ error: "Simkl not configured" }, { status: 500 });

  const account = await prisma.externalAccount.findUnique({
    where: { userId_provider: { userId, provider: "simkl" } },
    select: { accessToken: true, syncAt: true },
  });
  if (!account) return NextResponse.json({ error: "Not connected" }, { status: 400 });

  if (account.syncAt && Date.now() - account.syncAt.getTime() < 60_000) {
    return NextResponse.json({ error: "Too soon since last sync. Try again in a minute." }, { status: 429 });
  }

  try {
    const accessToken = decryptSecret(account.accessToken);
    if (!accessToken) {
      return NextResponse.json(
        { error: "Could not decrypt Simkl token. Please reconnect your Simkl account." },
        { status: 502 }
      );
    }
    const summary = await runSimklSync(userId, accessToken);
    const syncAt = new Date();
    await prisma.externalAccount.update({
      where: { userId_provider: { userId, provider: "simkl" } },
      data: { syncAt, lastSyncData: JSON.parse(JSON.stringify(summary)) },
    });
    return NextResponse.json({ ok: true, syncAt: syncAt.toISOString(), summary });
  } catch {
    return NextResponse.json({ error: "Sync failed. Please reconnect your Simkl account." }, { status: 502 });
  }
}
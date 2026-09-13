import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runSimklSync } from "@/lib/sync-simkl";

export const revalidate = 0;
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.externalAccount.findMany({
    where: { provider: "simkl" },
  });

  const results: { userId: string; status: number; detail?: string }[] = [];

  for (const account of accounts) {
    try {
      const summary = await runSimklSync(account.userId, account.accessToken);
      await prisma.externalAccount.update({
        where: { id: account.id },
        data: { syncAt: new Date(), lastSyncData: JSON.parse(JSON.stringify(summary)) },
      });
      results.push({ userId: account.userId, status: 200, detail: `${summary.imported} imported, ${summary.updated} updated, ${summary.episodes} episodes` });
    } catch (error) {
      results.push({ userId: account.userId, status: 502, detail: error instanceof Error ? error.message : "Failed" });
    }
  }

  return NextResponse.json({ ok: true, synced: results.length, results });
}
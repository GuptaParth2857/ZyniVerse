import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey, getUsage, checkRateLimit, getTier } from "@/lib/api-key";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await verifyApiKey(req);
  if (auth.error) return auth.error;

  const apiKey = await prisma.apiKey.findFirst({
    where: { userId: auth.userId, active: true },
    orderBy: { createdAt: "desc" },
  });

  if (!apiKey) {
    return NextResponse.json({ error: "No active API key found" }, { status: 404 });
  }

  const usage = await getUsage(apiKey.id);
  const tier = getTier(apiKey.tier);
  const rateLimit = await checkRateLimit(apiKey);

  return NextResponse.json({
    key: apiKey.name,
    tier: apiKey.tier,
    today: usage.today,
    thisMonth: usage.thisMonth,
    total: usage.total,
    limit: tier.requestsPerDay,
    remaining: rateLimit.remaining,
    resetAt: rateLimit.resetAt.toISOString(),
  });
}

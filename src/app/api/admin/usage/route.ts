import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { API_TIERS } from "@/lib/api-key";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });

  if (user?.email !== "admin@zyverse.in") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalRequests, todayRequests, monthRequests, keysPerTier, topUsers] = await Promise.all([
    prisma.apiUsageLog.count(),
    prisma.apiUsageLog.count({ where: { timestamp: { gte: startOfDay } } }),
    prisma.apiUsageLog.count({ where: { timestamp: { gte: startOfMonth } } }),
    prisma.apiKey.groupBy({
      by: ["tier"],
      _count: { id: true },
    }),
    prisma.apiUsageLog.groupBy({
      by: ["keyId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
  ]);

  const topUserDetails = await Promise.all(
    topUsers.map(async (u) => {
      const key = await prisma.apiKey.findUnique({
        where: { id: u.keyId },
        include: { user: { select: { username: true, email: true } } },
      });
      return { key: key?.name || "Unknown", user: key?.user || null, requests: u._count.id };
    })
  );

  const tierBreakdown = keysPerTier.map((t) => ({
    tier: t.tier,
    count: t._count.id,
    limit: API_TIERS[t.tier]?.requestsPerDay || 100,
  }));

  return NextResponse.json({
    totalRequests,
    todayRequests,
    monthRequests,
    tierBreakdown,
    topUsers: topUserDetails,
  });
}

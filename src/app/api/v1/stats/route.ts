import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [requestsToday, requestsAllTime, activeKeys, totalKeys, developers] = await Promise.all([
      prisma.apiUsageLog.count({ where: { timestamp: { gte: startOfDay } } }),
      prisma.apiUsageLog.count(),
      prisma.apiKey.count({ where: { active: true } }),
      prisma.apiKey.count(),
      prisma.apiKey.findMany({ where: { active: true }, select: { userId: true }, distinct: ["userId"] }),
    ]);

    return NextResponse.json({
      status: "operational",
      requestsToday,
      requestsAllTime,
      activeKeys,
      totalKeys,
      developers: developers.length,
      generatedAt: now.toISOString(),
    });
  } catch (e) {
    console.error("API stats error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

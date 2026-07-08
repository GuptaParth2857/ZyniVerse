import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [impressions, clicks, topPlacements] = await Promise.all([
    prisma.adImpression.count(),
    prisma.adClick.count(),
    prisma.adImpression.groupBy({
      by: ["placement"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
  ]);

  const clickData = await prisma.adClick.groupBy({
    by: ["placement"],
    _count: { id: true },
  });

  const clickMap = new Map(clickData.map((c) => [c.placement, c._count.id]));

  const top = topPlacements.map((p) => ({
    placement: p.placement,
    impressions: p._count.id,
    clicks: clickMap.get(p.placement) || 0,
  }));

  return NextResponse.json({
    impressions,
    clicks,
    ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : "0.00",
    topPlacements: top,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const body = await req.json();
  const { action, placement, page } = body;

  if (!placement || !page) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (action === "impression") {
    await prisma.adImpression.create({
      data: {
        placement,
        page,
        userId: session?.user?.id || null,
      },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "click") {
    await prisma.adClick.create({
      data: {
        placement,
        page,
        userId: session?.user?.id || null,
      },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

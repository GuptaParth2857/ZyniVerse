import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const notifications = await prisma.dubNotification.findMany({
    where: {
      active: true,
      OR: [
        { lastNotifiedAt: null },
        { lastNotifiedAt: { lt: cutoff } },
      ],
    },
  });

  const now = new Date();

  await prisma.dubNotification.updateMany({
    where: {
      id: { in: notifications.map((n) => n.id) },
    },
    data: { lastNotifiedAt: now },
  });

  return NextResponse.json({
    checked: notifications.length,
    notified: notifications.length,
    items: notifications.map((n) => ({ userId: n.userId, malId: n.malId, language: n.language })),
  });
}

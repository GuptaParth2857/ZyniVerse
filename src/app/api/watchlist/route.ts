import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ items: [] });

  const items = await prisma.listEntry.findMany({
    where: { userId: session.user.id },
    select: { mediaId: true, type: true, status: true, progress: true, total: true, score: true },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mediaId, type, action, status } = await req.json();
  if (action === "add" && status) {
    await prisma.listEntry.upsert({
      where: { userId_mediaId: { userId: session.user.id, mediaId } },
      update: { status, type: type || "ANIME" },
      create: { userId: session.user.id, mediaId, type: type || "ANIME", status, progress: 0, total: 0 },
    });
  } else if (action === "remove") {
    await prisma.listEntry.deleteMany({
      where: { userId: session.user.id, mediaId },
    });
  } else if (action === "update" && status) {
    await prisma.listEntry.upsert({
      where: { userId_mediaId: { userId: session.user.id, mediaId } },
      update: { status, progress: status === "COMPLETED" ? { increment: 1 } : undefined },
      create: { userId: session.user.id, mediaId, type: type || "ANIME", status, progress: 0, total: 0 },
    });
  }
  return NextResponse.json({ ok: true });
}

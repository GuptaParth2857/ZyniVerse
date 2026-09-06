import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limiter";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  const rateLimited = apiLimiter.middleware(req);
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, entryId } = await params;
  const tracker = await prisma.seasonalTracker.findUnique({ where: { id } });
  if (!tracker) {
    return NextResponse.json({ error: "Tracker not found" }, { status: 404 });
  }
  if (tracker.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const entry = await prisma.seasonalTrackerEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.trackerId !== id) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  const { status, progress, score, totalEpisodes } = await req.json();
  const updated = await prisma.seasonalTrackerEntry.update({
    where: { id: entryId },
    data: {
      ...(status !== undefined && { status }),
      ...(progress !== undefined && { progress: parseInt(progress) }),
      ...(score !== undefined && { score: score !== null ? parseInt(score) : null }),
      ...(totalEpisodes !== undefined && { totalEpisodes: totalEpisodes !== null ? parseInt(totalEpisodes) : null }),
    },
  });

  return NextResponse.json({ entry: updated });
}

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";

const LEVEL_BY_RARITY: Record<string, number> = {
  common: 1,
  rare: 3,
  epic: 5,
  legendary: 10,
};

export async function POST(req: NextRequest) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { frameId } = await req.json();
  if (!frameId) {
    return NextResponse.json({ error: "frameId is required" }, { status: 400 });
  }

  const frame = await prisma.profileFrame.findUnique({ where: { id: frameId } });
  if (!frame || !frame.isActive) {
    return NextResponse.json({ error: "Frame not found" }, { status: 404 });
  }

  const existing = await prisma.userFrame.findUnique({
    where: { userId_frameId: { userId: session.user.id, frameId } },
  });

  const minLevel = LEVEL_BY_RARITY[frame.rarity] ?? 1;

  const points = await prisma.userPoints.findUnique({
    where: { userId: session.user.id },
  });
  const level = points?.level ?? 1;
  if (level < minLevel) {
    return NextResponse.json(
      { error: `Reach level ${minLevel} to unlock this frame`, requiredLevel: minLevel, currentLevel: level },
      { status: 403 }
    );
  }

  if (existing) {
    return NextResponse.json({ unlocked: true, message: "Already unlocked" });
  }

  await prisma.userFrame.create({
    data: { userId: session.user.id, frameId },
  });

  return NextResponse.json({ unlocked: true });
}

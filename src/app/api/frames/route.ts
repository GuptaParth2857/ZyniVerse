import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rarity = searchParams.get("rarity");
  const category = searchParams.get("category");

  const where: Record<string, unknown> = { isActive: true };
  if (rarity) where.rarity = rarity;
  if (category) where.category = category;

  const session = await auth();
  const userId = session?.user?.id;

  const rarityOrder: Record<string, number> = { common: 0, rare: 1, epic: 2, legendary: 3 };
  const frames = (await prisma.profileFrame.findMany({
    where,
  })).sort((a, b) => (rarityOrder[a.rarity] ?? 0) - (rarityOrder[b.rarity] ?? 0) || a.name.localeCompare(b.name));

  const userFrames: Record<string, { isActive: boolean; unlockedAt: Date }> = {};
  if (userId) {
    const uf = await prisma.userFrame.findMany({
      where: { userId },
    });
    for (const f of uf) {
      userFrames[f.frameId] = { isActive: f.isActive, unlockedAt: f.unlockedAt };
    }
  }

  const enriched = frames.map((frame) => ({
    ...frame,
    unlocked: !!userFrames[frame.id],
    userActive: userFrames[frame.id]?.isActive || false,
    unlockedAt: userFrames[frame.id]?.unlockedAt || null,
  }));

  return NextResponse.json({ frames: enriched });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, imageUrl, rarity, category, unlockCondition } = await req.json();
  if (!name?.trim() || !imageUrl?.trim()) {
    return NextResponse.json({ error: "name and imageUrl required" }, { status: 400 });
  }

  const validRarity = ["common", "rare", "epic", "legendary"].includes(rarity) ? rarity : "common";

  const frame = await prisma.profileFrame.create({
    data: {
      name: name.trim(),
      imageUrl: imageUrl.trim(),
      rarity: validRarity,
      category: category?.trim() || "default",
      unlockCondition: unlockCondition?.trim() || null,
    },
  });

  return NextResponse.json({ frame });
}

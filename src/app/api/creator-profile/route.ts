import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      _count: { select: { tips: true } },
    },
  });

  return NextResponse.json({ profile });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { displayName, bio, kofiUrl, buymeacoffeeUrl, upiId } = await req.json();

  const profile = await prisma.creatorProfile.upsert({
    where: { userId: session.user.id },
    update: {
      ...(displayName !== undefined && { displayName: displayName?.trim() || null }),
      ...(bio !== undefined && { bio: bio?.trim() || null }),
      ...(kofiUrl !== undefined && { kofiUrl: kofiUrl?.trim() || null }),
      ...(buymeacoffeeUrl !== undefined && { buymeacoffeeUrl: buymeacoffeeUrl?.trim() || null }),
      ...(upiId !== undefined && { upiId: upiId?.trim() || null }),
    },
    create: {
      userId: session.user.id,
      displayName: displayName?.trim() || null,
      bio: bio?.trim() || null,
      kofiUrl: kofiUrl?.trim() || null,
      buymeacoffeeUrl: buymeacoffeeUrl?.trim() || null,
      upiId: upiId?.trim() || null,
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      _count: { select: { tips: true } },
    },
  });

  return NextResponse.json({ profile });
}

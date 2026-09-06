import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { frameId } = await req.json();
  if (!frameId) return NextResponse.json({ error: "frameId required" }, { status: 400 });

  const userFrame = await prisma.userFrame.findUnique({
    where: { userId_frameId: { userId: session.user.id, frameId } },
  });
  if (!userFrame) return NextResponse.json({ error: "Frame not unlocked" }, { status: 400 });

  await prisma.userFrame.updateMany({
    where: { userId: session.user.id },
    data: { isActive: false },
  });

  const updated = await prisma.userFrame.update({
    where: { id: userFrame.id },
    data: { isActive: true },
    include: { frame: true },
  });

  return NextResponse.json({ userFrame: updated });
}

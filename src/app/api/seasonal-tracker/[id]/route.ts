import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const tracker = await prisma.seasonalTracker.findUnique({
    where: { id },
    include: { entries: { orderBy: { addedAt: "desc" } } },
  });

  if (!tracker) {
    return NextResponse.json({ error: "Tracker not found" }, { status: 404 });
  }
  if (tracker.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ tracker });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const moment = await prisma.moment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        _count: { select: { likes: true } },
      },
    });

    if (!moment) {
      return NextResponse.json({ error: "Moment not found" }, { status: 404 });
    }

    await prisma.moment.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    return NextResponse.json(moment);
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Failed to fetch moment" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const moment = await prisma.moment.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!moment) {
      return NextResponse.json({ error: "Moment not found" }, { status: 404 });
    }
    if (moment.userId !== session.user.id && !isAdminEmail(session.user?.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.moment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Failed to delete moment" }, { status: 500 });
  }
}

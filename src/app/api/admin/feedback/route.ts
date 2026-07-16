import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });
    if (user?.email !== "admin@zyverse.in") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));
    const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
    const type = searchParams.get("type") || undefined;
    const status = searchParams.get("status") || undefined;
    const featured = searchParams.get("featured");

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (featured === "true") where.isFeatured = true;
    if (featured === "false") where.isFeatured = false;

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          replies: {
            orderBy: { createdAt: "asc" },
            include: { user: { select: { id: true, username: true, avatar: true } } },
          },
          _count: { select: { likes: true, comments: true } },
        },
      }),
      prisma.feedback.count({ where }),
    ]);

    return NextResponse.json({ feedbacks, total });
  } catch (e) {
    console.error("Admin feedback list error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

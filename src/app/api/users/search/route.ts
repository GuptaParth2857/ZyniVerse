import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        username: { contains: q, mode: "insensitive" },
        id: { not: session.user.id },
      },
      select: { id: true, username: true, avatar: true, bio: true },
      take: 10,
      orderBy: { username: "asc" },
    });
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

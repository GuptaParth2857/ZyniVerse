import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberships = await prisma.clubMember.findMany({
    where: { userId: session.user.id },
    include: {
      club: {
        include: {
          owner: { select: { id: true, username: true, avatar: true } },
          _count: { select: { members: true, posts: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const clubs = memberships.map((m) => ({ ...m.club, role: m.role, joinedAt: m.joinedAt }));

  return NextResponse.json({ clubs });
}

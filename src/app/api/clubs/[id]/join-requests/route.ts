import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: clubId } = await params;

  const member = await prisma.clubMember.findFirst({
    where: { clubId, userId: session.user.id, role: { in: ["owner", "admin"] } },
  });
  if (!member) return NextResponse.json({ error: "Admin or owner only" }, { status: 403 });

  const requests = await prisma.clubJoinRequest.findMany({
    where: { clubId, status: "pending" },
    include: { user: { select: { id: true, username: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ requests });
}

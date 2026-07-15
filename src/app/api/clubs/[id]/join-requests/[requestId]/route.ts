import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: clubId, requestId } = await params;
  const { action } = await req.json();

  const member = await prisma.clubMember.findFirst({
    where: { clubId, userId: session.user.id, role: { in: ["owner", "admin"] } },
  });
  if (!member) return NextResponse.json({ error: "Admin or owner only" }, { status: 403 });

  const joinRequest = await prisma.clubJoinRequest.findUnique({
    where: { id: requestId },
  });
  if (!joinRequest || joinRequest.clubId !== clubId) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (!["approve", "deny"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  if (action === "approve") {
    const banned = await prisma.clubBan.findUnique({
      where: { clubId_userId: { clubId, userId: joinRequest.userId } },
    });
    if (banned) {
      return NextResponse.json({ error: "User is banned from this club" }, { status: 403 });
    }

    const alreadyMember = await prisma.clubMember.findFirst({
      where: { clubId, userId: joinRequest.userId },
    });
    if (!alreadyMember) {
      await prisma.clubMember.create({
        data: { clubId, userId: joinRequest.userId, role: "member" },
      });
      await prisma.club.update({
        where: { id: clubId },
        data: { memberCount: { increment: 1 } },
      });
    }
    await prisma.clubJoinRequest.delete({ where: { id: requestId } });
  } else if (action === "deny") {
    await prisma.clubJoinRequest.delete({ where: { id: requestId } });
  }

  return NextResponse.json({ success: true });
}

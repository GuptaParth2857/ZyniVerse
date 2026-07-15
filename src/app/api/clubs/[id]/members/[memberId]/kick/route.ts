import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: clubId, memberId } = await params;

  const actor = await prisma.clubMember.findFirst({
    where: { clubId, userId: session.user.id, role: { in: ["owner", "admin"] } },
  });
  if (!actor) return NextResponse.json({ error: "Admin or owner only" }, { status: 403 });

  const target = await prisma.clubMember.findFirst({
    where: { clubId, userId: memberId },
  });
  if (!target) return NextResponse.json({ error: "Member not found" }, { status: 404 });
  if (target.role === "owner") return NextResponse.json({ error: "Cannot kick owner" }, { status: 400 });

  await prisma.clubMember.delete({ where: { id: target.id } });
  await prisma.club.update({
    where: { id: clubId },
    data: { memberCount: { decrement: 1 } },
  });

  return NextResponse.json({ success: true });
}

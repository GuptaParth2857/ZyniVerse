import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const commission = await prisma.commission.findUnique({ where: { id } });
  if (!commission) {
    return NextResponse.json({ error: "Commission not found" }, { status: 404 });
  }
  if (commission.userId === session.user.id) {
    return NextResponse.json({ error: "Cannot request your own commission" }, { status: 400 });
  }

  const existing = await prisma.commissionRequest.findFirst({
    where: { commissionId: id, requesterId: session.user.id, status: "pending" },
  });
  if (existing) {
    return NextResponse.json({ error: "You already have a pending request" }, { status: 400 });
  }

  const { message } = await req.json();

  const request = await prisma.commissionRequest.create({
    data: {
      commissionId: id,
      requesterId: session.user.id,
      message: message || null,
    },
  });

  return NextResponse.json({ request });
}

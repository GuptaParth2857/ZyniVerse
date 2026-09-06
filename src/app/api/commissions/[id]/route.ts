import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const commission = await prisma.commission.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      _count: { select: { requests: true } },
    },
  });

  if (!commission) {
    return NextResponse.json({ error: "Commission not found" }, { status: 404 });
  }

  return NextResponse.json({
    commission: {
      ...commission,
      requestCount: commission._count.requests,
      _count: undefined,
    },
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const commission = await prisma.commission.findUnique({ where: { id } });
  if (!commission) {
    return NextResponse.json({ error: "Commission not found" }, { status: 404 });
  }
  if (commission.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, description, imageUrl, category, priceMin, priceMax, turnaround, portfolio, isActive } = await req.json();

  const updated = await prisma.commission.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
      ...(category !== undefined && { category }),
      ...(priceMin !== undefined && { priceMin: priceMin ? parseInt(priceMin) : null }),
      ...(priceMax !== undefined && { priceMax: priceMax ? parseInt(priceMax) : null }),
      ...(turnaround !== undefined && { turnaround: turnaround || null }),
      ...(portfolio !== undefined && { portfolio: JSON.stringify(portfolio || []) }),
      ...(isActive !== undefined && { isActive }),
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      _count: { select: { requests: true } },
    },
  });

  return NextResponse.json({
    commission: {
      ...updated,
      requestCount: updated._count.requests,
      _count: undefined,
    },
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const commission = await prisma.commission.findUnique({ where: { id } });
  if (!commission) {
    return NextResponse.json({ error: "Commission not found" }, { status: 404 });
  }
  if (commission.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.commissionRequest.deleteMany({ where: { commissionId: id } });
  await prisma.commission.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

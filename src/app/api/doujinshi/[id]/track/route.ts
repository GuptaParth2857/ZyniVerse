import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!status || !["read", "reading", "want", "favorite"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const entry = await prisma.doujinshiEntry.upsert({
    where: {
      doujinshiId_userId: { doujinshiId: id, userId: session.user.id },
    },
    update: { status },
    create: {
      doujinshiId: id,
      userId: session.user.id,
      status,
    },
  });

  return NextResponse.json({ entry });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status, pagesRead } = await req.json();

  const updateData: Record<string, unknown> = {};
  if (status) updateData.status = status;
  if (typeof pagesRead === "number") updateData.pagesRead = pagesRead;

  const entry = await prisma.doujinshiEntry.updateMany({
    where: { doujinshiId: id, userId: session.user.id },
    data: updateData,
  });

  return NextResponse.json({ entry });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.doujinshiEntry.deleteMany({
    where: { doujinshiId: id, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}

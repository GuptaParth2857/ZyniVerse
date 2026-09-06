import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = (await params).id;
  const card = await prisma.bingoCard.findUnique({ where: { id } });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  if (card.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ card });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = (await params).id;
  const card = await prisma.bingoCard.findUnique({ where: { id } });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  if (card.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { squares: updates } = await req.json();
  if (!Array.isArray(updates)) {
    return NextResponse.json({ error: "Squares array required" }, { status: 400 });
  }

  const currentSquares: { index: number; text: string; category: string; color: string; completed: boolean }[] = JSON.parse(card.squares);

  for (const update of updates) {
    if (typeof update.index === "number") {
      const idx = currentSquares.findIndex((s) => s.index === update.index);
      if (idx !== -1 && update.index !== 12) {
        currentSquares[idx].completed = Boolean(update.completed);
      }
    }
  }

  const updated = await prisma.bingoCard.update({
    where: { id },
    data: { squares: JSON.stringify(currentSquares) },
  });

  return NextResponse.json({ card: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = (await params).id;
  const card = await prisma.bingoCard.findUnique({ where: { id } });

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  if (card.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.bingoCard.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}

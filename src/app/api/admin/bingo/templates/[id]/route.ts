import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { requireAdmin } from "@/lib/admin";
import { parsePool, type BingoPoolItem } from "@/lib/bingo";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const id = (await params).id;
    const template = await prisma.bingoTemplate.findUnique({
      where: { id },
      include: { creator: { select: { username: true, email: true } } },
    });
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    return NextResponse.json({ template });
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Failed to fetch template" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const id = (await params).id;
    const existing = await prisma.bingoTemplate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const body = await req.json();
    const errors: string[] = [];
    const pool: BingoPoolItem[] = body.squares !== undefined
      ? validatePool(body.squares, errors)
      : parsePool(existing.squares);
    if (body.title !== undefined && String(body.title).trim().length < 2) errors.push("Title is required (min 2 chars).");
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }

    const template = await prisma.bingoTemplate.update({
      where: { id },
      data: {
        title: body.title !== undefined ? String(body.title).trim() : existing.title,
        emoji: body.emoji !== undefined ? String(body.emoji).slice(0, 8) : existing.emoji,
        description: body.description !== undefined ? (body.description ? String(body.description).trim() : null) : existing.description,
        squares: body.squares !== undefined ? JSON.stringify(pool) : existing.squares,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : existing.isFeatured,
      },
      include: { creator: { select: { username: true, email: true } } },
    });

    return NextResponse.json({ template });
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const id = (await params).id;
    const existing = await prisma.bingoTemplate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    await prisma.bingoTemplate.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}

function validatePool(squares: unknown, err: string[]) {
  const items: BingoPoolItem[] = parsePool(typeof squares === "string" ? squares : JSON.stringify(squares ?? []));
  if (items.length < 24) {
    err.push("At least 24 unique squares required (you need 24 for a 5×5 board + FREE space).");
  }
  if (items.length > 0 && items.some((i) => (i.text || "").trim().length < 2)) {
    err.push("Each square needs a label (min 2 characters).");
  }
  return items.slice(0, 40);
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { requireAdmin } from "@/lib/admin";
import { parsePool, type BingoPoolItem } from "@/lib/bingo";

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const templates = await prisma.bingoTemplate.findMany({
      orderBy: { updatedAt: "desc" },
      take: 100,
      include: { creator: { select: { username: true, email: true } } },
    });
    return NextResponse.json({ templates });
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Failed to load templates" }, { status: 500 });
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

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, emoji, description, squares, isActive, isFeatured } = await req.json();
    const errors: string[] = [];
    if (!title || String(title).trim().length < 2) errors.push("Title is required (min 2 chars).");
    const pool = validatePool(squares, errors);
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }

    const template = await prisma.bingoTemplate.create({
      data: {
        title: String(title).trim(),
        emoji: String(emoji || "🎱").slice(0, 8),
        description: description ? String(description).trim() : null,
        squares: JSON.stringify(pool),
        isActive: Boolean(isActive),
        isFeatured: Boolean(isFeatured),
        createdById: admin.user.id,
      },
      include: { creator: { select: { username: true, email: true } } },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}
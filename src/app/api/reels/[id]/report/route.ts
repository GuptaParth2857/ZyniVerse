import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { auth } from "@/lib/auth";

const REASONS = [
  "copyright",
  "inappropriate",
  "spam",
  "harassment",
  "other",
];

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const body = await req.json();
    const reason = String(body.reason || "other");
    if (!REASONS.includes(reason)) {
      return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
    }

    const reel = await prisma.reel.findUnique({ where: { id }, select: { id: true } });
    if (!reel) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    }

    const existing = await prisma.reelReport.findUnique({
      where: { userId_reelId: { userId: session.user.id, reelId: id } },
    });
    if (existing) {
      return NextResponse.json({ message: "Already reported" });
    }

    await prisma.reelReport.create({
      data: { reelId: id, userId: session.user.id, reason },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}

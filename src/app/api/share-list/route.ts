import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveUserId } from "@/lib/resolve-user";
import crypto from "crypto";

export async function POST() {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let share = await prisma.listShare.findUnique({ where: { userId } });
  if (!share) {
    share = await prisma.listShare.create({
      data: { userId, key: crypto.randomBytes(12).toString("base64url") },
    });
  }

  return NextResponse.json({ key: share.key });
}

export async function DELETE() {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.listShare.deleteMany({ where: { userId } });
  return NextResponse.json({ ok: true });
}
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false });
  }
  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastSeen: new Date() },
    });
  } catch {
    // lastSeen column may not exist in DB yet
  }
  return NextResponse.json({ ok: true });
}

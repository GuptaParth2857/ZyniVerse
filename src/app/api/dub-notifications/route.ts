import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { malId, language } = await req.json();
  if (!malId || !language) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const notification = await prisma.dubNotification.upsert({
    where: {
      userId_malId_language: {
        userId: session.user.id,
        malId,
        language,
      },
    },
    update: { active: true },
    create: { userId: session.user.id, malId, language },
  });

  return NextResponse.json({ notification });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await prisma.dubNotification.findMany({
    where: { userId: session.user.id, active: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ notifications });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { malId, language } = await req.json();
  if (!malId || !language) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await prisma.dubNotification.updateMany({
    where: { userId: session.user.id, malId, language },
    data: { active: false },
  });

  return NextResponse.json({ ok: true });
}

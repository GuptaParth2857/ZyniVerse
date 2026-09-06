import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const KEYS = [
  "aiEnabled",
  "followEnabled",
  "commentEnabled",
  "reviewEnabled",
  "eventEnabled",
  "systemEnabled",
  "airingEnabled",
] as const;

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prefs = await prisma.notificationPreference.findUnique({ where: { userId } });
  return NextResponse.json({
    prefs: prefs ?? {
      aiEnabled: true,
      followEnabled: true,
      commentEnabled: true,
      reviewEnabled: true,
      eventEnabled: true,
      systemEnabled: true,
      airingEnabled: true,
    },
  });
}

export async function PUT(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const data: Record<string, boolean> = {};
  for (const key of KEYS) {
    if (typeof body?.[key] === "boolean") {
      data[key] = body[key];
    }
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid preferences provided" }, { status: 400 });
  }

  const prefs = await prisma.notificationPreference.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });

  return NextResponse.json({ ok: true, prefs });
}
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const mediaId = Number((await params).id);
  if (!Number.isInteger(mediaId) || mediaId <= 0) {
    return NextResponse.json({ error: "Invalid anime id" }, { status: 404 });
  }

  const [agree, refute] = await Promise.all([
    prisma.theoryVote.count({ where: { mediaId, agree: true } }),
    prisma.theoryVote.count({ where: { mediaId, agree: false } }),
  ]);

  const session = await auth();
  let myVote: boolean | null = null;
  if (session?.user?.id) {
    const mine = await prisma.theoryVote.findUnique({
      where: { mediaId_userId: { mediaId, userId: session.user.id } },
      select: { agree: true },
    });
    myVote = mine ? mine.agree : null;
  }

  return NextResponse.json({ agree, refute, myVote });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const mediaId = Number((await params).id);
  if (!Number.isInteger(mediaId) || mediaId <= 0) {
    return NextResponse.json({ error: "Invalid anime id" }, { status: 404 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to vote on theories." }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { agree?: unknown };
  if (typeof body.agree !== "boolean") {
    return NextResponse.json({ error: "agree must be a boolean" }, { status: 400 });
  }

  await prisma.theoryVote.upsert({
    where: { mediaId_userId: { mediaId, userId: session.user.id } },
    update: { agree: body.agree },
    create: { mediaId, userId: session.user.id, agree: body.agree },
  });

  const [agree, refute] = await Promise.all([
    prisma.theoryVote.count({ where: { mediaId, agree: true } }),
    prisma.theoryVote.count({ where: { mediaId, agree: false } }),
  ]);

  return NextResponse.json({ agree, refute, myVote: body.agree });
}
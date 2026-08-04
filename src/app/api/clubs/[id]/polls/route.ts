import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.clubMember.findUnique({
    where: { clubId_userId: { clubId: id, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const { title, description, options, endsAt } = await req.json();
  if (!title?.trim() || !Array.isArray(options) || options.length < 2) {
    return NextResponse.json({ error: "Title and at least 2 options required" }, { status: 400 });
  }

  const poll = await prisma.clubPoll.create({
    data: {
      clubId: id,
      title: title.trim(),
      description: description?.trim() || null,
      createdById: session.user.id,
      ...(endsAt ? { endsAt: new Date(endsAt) } : {}),
      options: {
        create: options.filter((o: string) => o?.trim()).map((o: string) => ({ label: o.trim() })),
      },
    },
    include: {
      createdBy: { select: { id: true, username: true, avatar: true } },
      options: {
        include: { _count: { select: { votes: true } } },
        orderBy: { id: "asc" },
      },
    },
  });

  await prisma.clubMember.update({
    where: { clubId_userId: { clubId: id, userId: session.user.id } },
    data: { points: { increment: 3 } },
  });

  return NextResponse.json({ poll }, { status: 201 });
}

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ voted: false, value: 0 });

  const { id } = await params;
  const vote = await prisma.listVote.findUnique({
    where: { listId_userId: { listId: id, userId: session.user.id } },
  });

  return NextResponse.json({ voted: !!vote, value: vote?.value ?? 0 });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { value } = await req.json();

  if (value !== 1 && value !== -1) {
    return NextResponse.json({ error: "Value must be 1 or -1" }, { status: 400 });
  }

  const list = await prisma.userList.findUnique({ where: { id } });
  if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.listVote.findUnique({
    where: { listId_userId: { listId: id, userId: session.user.id } },
  });

  let voted = false;
  let voteValue = 0;

  if (existing && existing.value === value) {
    await prisma.$transaction([
      prisma.listVote.delete({ where: { id: existing.id } }),
      prisma.userList.update({
        where: { id },
        data: value === 1 ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } },
      }),
    ]);
  } else if (existing) {
    await prisma.$transaction([
      prisma.listVote.update({ where: { id: existing.id }, data: { value } }),
      prisma.userList.update({
        where: { id },
        data: value === 1
          ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } }
          : { upvotes: { decrement: 1 }, downvotes: { increment: 1 } },
      }),
    ]);
    voted = true;
    voteValue = value;
  } else {
    await prisma.$transaction([
      prisma.listVote.create({ data: { listId: id, userId: session.user.id, value } }),
      prisma.userList.update({
        where: { id },
        data: value === 1 ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } },
      }),
    ]);
    voted = true;
    voteValue = value;
  }

  const updated = await prisma.userList.findUnique({
    where: { id },
    select: { upvotes: true, downvotes: true },
  });

  return NextResponse.json({ voted, value: voteValue, upvotes: updated?.upvotes ?? 0, downvotes: updated?.downvotes ?? 0 });
}

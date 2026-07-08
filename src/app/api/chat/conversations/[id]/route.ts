import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participants: {
        include: { user: { select: { id: true, username: true, avatar: true } } },
      },
    },
  });

  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParticipant = conversation.participants.some((p) => p.userId === userId);
  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({ conversation });
}

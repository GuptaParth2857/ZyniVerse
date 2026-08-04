import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { broadcastToConversation } from "@/lib/chat";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId, typing } = await req.json();
  if (!conversationId) return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: session.user.id } },
    select: { user: { select: { id: true, username: true } } },
  });
  if (!participant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  broadcastToConversation(conversationId, session.user.id, "dm-typing", {
    conversationId,
    userId: session.user.id,
    username: participant.user.username,
    typing: !!typing,
  }).catch(() => {});

  return NextResponse.json({ success: true });
}

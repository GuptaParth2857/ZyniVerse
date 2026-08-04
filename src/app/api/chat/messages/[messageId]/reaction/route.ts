import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { toggleReaction, broadcastToConversation } from "@/lib/chat";

const VALID_EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "😡", "🔥"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId } = await params;
  const { emoji } = await req.json();
  if (!emoji || !VALID_EMOJIS.includes(emoji)) {
    return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
  }

  try {
    const msg = await prisma.message.findUnique({ where: { id: messageId } });
    if (!msg) return NextResponse.json({ error: "Message not found" }, { status: 404 });

    const reactions = await toggleReaction(messageId, session.user.id, emoji);
    broadcastToConversation(msg.conversationId, session.user.id, "dm-reaction", {
      conversationId: msg.conversationId,
      messageId,
      reactions,
    }).catch(() => {});
    return NextResponse.json({ reactions });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to react" },
      { status: 400 }
    );
  }
}

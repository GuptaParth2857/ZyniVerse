import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { sendMessage, getMessages, broadcastToConversation } from "@/lib/chat";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId) return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });

  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: session.user.id } },
  });
  if (!participant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const limit = Number(searchParams.get("limit")) || 50;
  const before = searchParams.get("before") || undefined;

  const messages = await getMessages(conversationId, limit, before);
  return NextResponse.json({ messages: messages.reverse() });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId, content, replyToId } = await req.json();
  if (!conversationId || !content?.trim()) {
    return NextResponse.json({ error: "Missing conversationId or content" }, { status: 400 });
  }

  try {
    const message = await sendMessage(conversationId, session.user.id, content.trim(), replyToId || undefined);
    broadcastToConversation(conversationId, session.user.id, "dm-message", message).catch(() => {});
    return NextResponse.json({ message });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to send" },
      { status: 400 }
    );
  }
}

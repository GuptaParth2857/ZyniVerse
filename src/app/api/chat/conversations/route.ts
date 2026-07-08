import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getConversations, getOrCreateConversation, getUnreadCounts } from "@/lib/chat";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const [conversations, unreadCounts] = await Promise.all([
    getConversations(userId),
    getUnreadCounts(userId),
  ]);

  const unreadMap = new Map(unreadCounts.map((u) => [u.conversationId, u.count]));

  const data = conversations.map((c) => {
    const otherParticipant = c.participants.find((p) => p.userId !== userId);
    return {
      id: c.id,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      otherUser: otherParticipant?.user ?? null,
      lastMessage: c.lastMessage,
      unreadCount: unreadMap.get(c.id) ?? 0,
    };
  });

  return NextResponse.json({ conversations: data });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const conversation = await getOrCreateConversation(session.user.id, userId);
  return NextResponse.json({ conversation });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId } = await req.json();
  if (!conversationId) return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });

  await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId: session.user.id },
    data: { lastReadAt: new Date() },
  });

  return NextResponse.json({ success: true });
}

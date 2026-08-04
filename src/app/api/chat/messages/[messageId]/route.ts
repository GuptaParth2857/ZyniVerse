import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { deleteMessage, broadcastToConversation } from "@/lib/chat";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId } = await params;
  const { mode } = await req.json().catch(() => ({ mode: "me" }));
  if (mode !== "me" && mode !== "everyone") {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  try {
    const msg = await prisma.message.findUnique({ where: { id: messageId } });
    if (!msg) return NextResponse.json({ error: "Message not found" }, { status: 404 });

    const updated = await deleteMessage(messageId, session.user.id, mode);
    broadcastToConversation(msg.conversationId, session.user.id, "dm-delete", {
      conversationId: msg.conversationId,
      messageId,
      mode,
      deletedFor: updated?.deletedFor ? updated.deletedFor.split(",").filter(Boolean) : [],
      isDeleted: updated?.isDeleted ?? false,
    }).catch(() => {});
    return NextResponse.json({ message: updated });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete" },
      { status: 400 }
    );
  }
}

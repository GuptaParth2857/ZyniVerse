import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message } = await req.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const feedback = await prisma.feedback.findUnique({ where: { id } });
    if (!feedback) return NextResponse.json({ error: "Feedback not found" }, { status: 404 });

    const reply = await prisma.feedbackReply.create({
      data: {
        feedbackId: id,
        userId: admin.user.id,
        message: message.trim().slice(0, 2000),
      },
      include: { user: { select: { id: true, username: true, avatar: true } } },
    });

    await prisma.feedback.update({
      where: { id },
      data: { status: "replied", replyCount: { increment: 1 } },
    });

    let notifyUserId: string | null = null;

    if (feedback.userId) {
      notifyUserId = feedback.userId;
    } else if (feedback.email) {
      const feedbackUser = await prisma.user.findFirst({
        where: { email: feedback.email },
        select: { id: true },
      });
      if (feedbackUser) notifyUserId = feedbackUser.id;
    }

    if (notifyUserId) {
      await createNotification({
        userId: notifyUserId,
        type: "SYSTEM",
        title: "Feedback Reply",
        body: `Admin replied to your feedback: "${message.trim().slice(0, 100)}"`,
        link: "/notifications",
      });
    }

    return NextResponse.json({ reply }, { status: 201 });
  } catch (e) {
    console.error("Feedback reply error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

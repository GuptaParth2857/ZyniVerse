import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });
    if (user?.email !== "admin@zyverse.in") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status } = await req.json();
    if (!["pending", "replied", "resolved"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await prisma.feedback.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ feedback: updated });
  } catch (e) {
    console.error("Feedback status error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

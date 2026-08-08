import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

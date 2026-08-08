import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.feedback.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Feedback delete error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

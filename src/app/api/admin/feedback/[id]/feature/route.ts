import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { isFeatured, featuredHeading, featuredDescription, featuredImage } = body;

    const updated = await prisma.feedback.update({
      where: { id },
      data: {
        isFeatured: Boolean(isFeatured),
        featuredHeading: featuredHeading || null,
        featuredDescription: featuredDescription || null,
        featuredImage: featuredImage || null,
      },
    });

    return NextResponse.json({ feedback: updated });
  } catch (e) {
    console.error("Feedback feature error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

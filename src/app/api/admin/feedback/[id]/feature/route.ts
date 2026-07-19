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
    if (user?.email !== "gupta.parth2857@gmail.com") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

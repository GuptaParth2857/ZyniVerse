import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
    const featured = searchParams.get("featured");
    const type = searchParams.get("type") || undefined;

    const where: Record<string, unknown> = {};
    if (featured === "true") where.isFeatured = true;
    if (type) where.type = type;

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          type: true,
          message: true,
          page: true,
          isFeatured: true,
          featuredHeading: true,
          featuredDescription: true,
          featuredImage: true,
          likeCount: true,
          replyCount: true,
          createdAt: true,
        },
      }),
      prisma.feedback.count({ where }),
    ]);

    return NextResponse.json({ feedbacks, total });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

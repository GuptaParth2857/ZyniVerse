import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, message, page, email } = body;

    if (!type || !message || message.trim().length < 5) {
      return NextResponse.json({ error: "Type and message (min 5 chars) required" }, { status: 400 });
    }

    if (!["bug", "suggestion", "feature", "other"].includes(type)) {
      return NextResponse.json({ error: "Invalid feedback type" }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent") || null;

    const feedback = await prisma.feedback.create({
      data: {
        type,
        message: message.trim().slice(0, 2000),
        page: page || null,
        email: email?.trim() || null,
        userAgent,
      },
    });

    return NextResponse.json({ success: true, id: feedback.id });
  } catch (e) {
    console.error("Feedback error:", e);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const type = searchParams.get("type") || undefined;

    const where = type ? { type } : {};

    const feedbacks = await prisma.feedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, type: true, message: true, page: true, createdAt: true },
    });

    return NextResponse.json({ feedbacks });
  } catch {
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}

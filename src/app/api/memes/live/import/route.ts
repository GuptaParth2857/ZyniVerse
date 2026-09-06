import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, imageUrl, tags } = await req.json().catch(() => ({}));
  if (!title || !imageUrl) {
    return NextResponse.json({ error: "Title and image URL are required" }, { status: 400 });
  }

  const meme = await prisma.meme.create({
    data: {
      userId: session.user.id,
      title,
      imageUrl,
      tags: tags || "",
    },
    select: { id: true },
  });

  return NextResponse.json({ meme });
}
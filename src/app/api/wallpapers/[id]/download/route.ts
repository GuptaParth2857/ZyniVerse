import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limiter";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = apiLimiter.middleware(req);
  if (rateLimited) return rateLimited;

  const { id } = await params;
  const wallpaper = await prisma.wallpaper.findUnique({ where: { id } });
  if (!wallpaper) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.wallpaper.update({
    where: { id },
    data: { downloads: { increment: 1 } },
  });

  return NextResponse.json({ imageUrl: updated.imageUrl, downloads: updated.downloads });
}

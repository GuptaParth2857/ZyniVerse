import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

// Returns which of the requested cosplay ids the current user has liked.
// The gallery list itself is cached and shared, so this per-user lookup is
// kept on its own no-store endpoint and merged in client-side.
export async function GET(req: NextRequest) {
  const rateLimited = await apiLimiter.middleware(req);
  if (rateLimited) return rateLimited;

  const headers = { "Cache-Control": "private, no-store" };
  const { searchParams } = new URL(req.url);
  const ids = (searchParams.get("ids") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 60);

  const session = await auth();
  if (!session?.user?.id || ids.length === 0) {
    return NextResponse.json({ likedIds: [] }, { headers });
  }

  const likes = await prisma.cosplayLike.findMany({
    where: { userId: session.user.id, cosplayId: { in: ids } },
    select: { cosplayId: true },
  });

  return NextResponse.json({ likedIds: likes.map((l) => l.cosplayId) }, { headers });
}

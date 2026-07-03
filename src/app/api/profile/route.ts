import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, username: true, email: true, createdAt: true,
      entries: {
        orderBy: { updatedAt: "desc" },
        take: 50,
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { username: true } } },
      },
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const stats = {
    total: user.entries.length,
    current: user.entries.filter((e) => e.status === "CURRENT").length,
    planning: user.entries.filter((e) => e.status === "PLANNING").length,
    completed: user.entries.filter((e) => e.status === "COMPLETED").length,
    dropped: user.entries.filter((e) => e.status === "DROPPED").length,
    paused: user.entries.filter((e) => e.status === "PAUSED").length,
    episodesWatched: user.entries.reduce((sum, e) => sum + e.progress, 0),
  };

  return NextResponse.json({ user: { ...user, email: user.id === session.user.id ? user.email : undefined }, stats });
}

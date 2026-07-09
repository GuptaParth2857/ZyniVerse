import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getDoujinshiById } from "@/lib/mangadex-api";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;

  const where: Record<string, unknown> = { userId: session.user.id };
  if (status) where.status = status;

  const entries = await prisma.doujinshiEntry.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });

  const enriched = (
    await Promise.all(
      entries.map(async (e) => {
        const data = await getDoujinshiById(e.doujinshiId);
        if (!data) return null;
        return { entry: e, doujinshi: data } as const;
      }),
    )
  ).filter(<T>(e: T | null | undefined): e is T => e != null);

  return NextResponse.json({ entries: enriched });
}

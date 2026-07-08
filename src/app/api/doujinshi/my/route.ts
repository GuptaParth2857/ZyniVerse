import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getDoujinshiById } from "@/lib/doujinshi-data";
import type { DoujinshiEntry } from "@/lib/doujinshi-data";

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

  const enriched = entries
    .map((e) => {
      const data = getDoujinshiById(e.doujinshiId);
      if (!data) return null;
      return { entry: e, doujinshi: data };
    })
    .filter((e): e is { entry: typeof entries[0]; doujinshi: DoujinshiEntry } => e !== null);

  return NextResponse.json({ entries: enriched });
}

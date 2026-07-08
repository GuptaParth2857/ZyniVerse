import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username } = await params;

  const otherUser = await prisma.user.findUnique({ where: { username }, select: { id: true, username: true, avatar: true } });
  if (!otherUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const [myEntries, theirEntries] = await Promise.all([
    prisma.listEntry.findMany({ where: { userId: session.user.id }, select: { mediaId: true, status: true, score: true } }),
    prisma.listEntry.findMany({ where: { userId: otherUser.id }, select: { mediaId: true, status: true, score: true } }),
  ]);

  const myMap = new Map(myEntries.map((e) => [e.mediaId, e]));
  const theirMap = new Map(theirEntries.map((e) => [e.mediaId, e]));

  const shared = [...myMap.entries()].filter(([id]) => theirMap.has(id));
  const sharedData = shared.map(([id, my]) => ({ mediaId: id, myScore: my.score, theirScore: theirMap.get(id)!.score }));

  const onlyMe = myEntries.length - shared.length;
  const onlyThem = theirEntries.length - shared.length;

  let compatibility = 0;
  if (sharedData.length > 0) {
    const diffs = sharedData.map((d) => {
      if (d.myScore && d.theirScore) return Math.abs(d.myScore - d.theirScore);
      return null;
    }).filter((d) => d !== null) as number[];
    const avgDiff = diffs.length > 0 ? diffs.reduce((a, b) => a + b, 0) / diffs.length : 50;
    compatibility = Math.round(Math.max(0, 100 - avgDiff * 2));
  }

  const genresInCommon = shared.length;

  return NextResponse.json({
    user: otherUser,
    stats: {
      myTotal: myEntries.length,
      theirTotal: theirEntries.length,
      shared: shared.length,
      onlyMe, onlyThem,
      compatibility,
      genresInCommon,
    },
    sharedMedia: sharedData.slice(0, 50),
  });
}

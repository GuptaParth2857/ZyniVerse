import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const session = await auth();
  if (!session?.user?.id || !params) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username } = await params;
  const targetUser = await prisma.user.findUnique({ where: { username } });
  if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const myEntries = await prisma.listEntry.findMany({ where: { userId: session.user.id } });
  const theirEntries = await prisma.listEntry.findMany({ where: { userId: targetUser.id } });

  if (myEntries.length === 0 || theirEntries.length === 0) {
    return NextResponse.json({ match: 0, shared: 0, total: Math.max(myEntries.length, theirEntries.length) });
  }

  const myMap = new Map(myEntries.map((e) => [e.mediaId, e]));
  let score = 0;
  let shared = 0;

  for (const their of theirEntries) {
    const mine = myMap.get(their.mediaId);
    if (!mine) continue;
    shared++;

    if (mine.status === their.status) score += 30;
    const scoreDiff = Math.abs((mine.score || 0) - (their.score || 0));
    if (scoreDiff <= 1) score += 40;
    else if (scoreDiff <= 3) score += 20;
    const progressDiff = Math.abs((mine.progress || 0) - (their.progress || 0));
    if (progressDiff <= 5) score += 30;
    else if (progressDiff <= 20) score += 15;
  }

  const match = shared > 0 ? Math.min(100, Math.round(score / shared)) : 0;
  return NextResponse.json({ match, shared, total: Math.max(myEntries.length, theirEntries.length), username });
}

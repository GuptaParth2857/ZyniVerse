import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const party = await prisma.watchParty.findUnique({
    where: { id },
    select: {
      id: true,
      isPlaying: true,
      playbackPos: true,
      episode: true,
      status: true,
      lastSyncAt: true,
    },
  });
  if (!party) {
    return NextResponse.json({ error: "Party not found" }, { status: 404 });
  }
  return NextResponse.json({ party });
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMediaBatch } from "@/lib/anilist";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ follows: [], items: [] });
  const follows = await prisma.animeFollow.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const ids = follows.map((f) => f.mediaId);
  let items: { id: number; title: string; cover: string | null }[] = [];
  if (ids.length) {
    const batch = await getMediaBatch(ids);
    const map = new Map(batch.map((m) => [m.id, m]));
    items = follows
      .slice(0, 50)
      .map((f) => {
        const m = map.get(f.mediaId);
        return {
          id: f.mediaId,
          title: m?.title?.english || m?.title?.romaji || `#${f.mediaId}`,
          cover: m?.coverImage?.large || m?.coverImage?.medium || null,
        };
      });
  }

  return NextResponse.json({ follows: ids, items });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to follow anime." }, { status: 401 });
  const { mediaId } = (await req.json()) as { mediaId?: number };
  if (!mediaId) return NextResponse.json({ error: "mediaId required" }, { status: 400 });

  await prisma.animeFollow.upsert({
    where: { userId_mediaId: { userId: session.user.id, mediaId } },
    update: {},
    create: { userId: session.user.id, mediaId },
  });
  return NextResponse.json({ following: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in." }, { status: 401 });
  const { mediaId } = (await req.json()) as { mediaId?: number };
  if (!mediaId) return NextResponse.json({ error: "mediaId required" }, { status: 400 });

  await prisma.animeFollow.deleteMany({ where: { userId: session.user.id, mediaId } });
  return NextResponse.json({ following: false });
}
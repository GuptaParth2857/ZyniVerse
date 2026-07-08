import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ chapters: [] });

  const { searchParams } = new URL(req.url);
  const mediaId = Number(searchParams.get("mediaId"));
  if (!mediaId) return NextResponse.json({ chapters: [] });

  const entry = await prisma.mangaEntry.findUnique({
    where: { userId_mediaId: { userId: session.user.id, mediaId } },
  });
  if (!entry) return NextResponse.json({ chapters: [] });

  const chapters = await prisma.mangaChapter.findMany({
    where: { entryId: entry.id },
    orderBy: { chapter: "asc" },
  });

  return NextResponse.json({ chapters, entry });
}

export async function POST(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mediaId, chapter, title, read } = await req.json();
  if (!mediaId || chapter == null) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const entry = await prisma.mangaEntry.findUnique({
    where: { userId_mediaId: { userId: session.user.id, mediaId } },
  });
  if (!entry) return NextResponse.json({ error: "Entry not found. Add manga to your list first." }, { status: 404 });

  const existing = await prisma.mangaChapter.findUnique({
    where: { entryId_chapter: { entryId: entry.id, chapter } },
  });

  if (existing) {
    const updated = await prisma.mangaChapter.update({
      where: { id: existing.id },
      data: { read: read ?? true, readAt: read !== false ? new Date() : null },
    });
    return NextResponse.json({ chapter: updated });
  }

  const created = await prisma.mangaChapter.create({
    data: {
      entryId: entry.id,
      chapter,
      title: title || null,
      read: read ?? true,
      readAt: read !== false ? new Date() : null,
    },
  });

  const readCount = await prisma.mangaChapter.count({
    where: { entryId: entry.id, read: true },
  });
  await prisma.mangaEntry.update({
    where: { id: entry.id },
    data: { chapters: readCount, status: readCount > 0 ? "READING" : entry.status },
  });

  return NextResponse.json({ chapter: created });
}

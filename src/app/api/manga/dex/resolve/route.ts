import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { searchMangaDex } from "@/lib/manga-reader";

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function pickBestMatch(results: { id: string; title: string; altTitles: string[] }[], query: string) {
  const q = query.toLowerCase().trim();
  const exact = results.find((r) => r.title.toLowerCase() === q);
  if (exact) return exact;
  const includes = results.find((r) => r.title.toLowerCase().includes(q) || q.includes(r.title.toLowerCase()));
  if (includes) return includes;
  const alt = results.find((r) => r.altTitles.some((t) => t.toLowerCase() === q));
  if (alt) return alt;
  return results[0] || null;
}

export async function POST(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const { mediaId, title } = await req.json();
  if (!mediaId || !title) {
    return NextResponse.json({ error: "Missing mediaId or title" }, { status: 400 });
  }

  const cached = await prisma.mangaDexCache.findUnique({ where: { mediaId } });
  if (cached && Date.now() - cached.updatedAt.getTime() < CACHE_TTL_MS) {
    return NextResponse.json({ mangaDexId: cached.mangaDexId, title: cached.title, cached: true });
  }

  const results = await searchMangaDex(title);
  const best = pickBestMatch(results, title);

  if (!best) {
    return NextResponse.json({ error: "No matching manga found on MangaDex" }, { status: 404 });
  }

  await prisma.mangaDexCache.upsert({
    where: { mediaId },
    update: { mangaDexId: best.id, title: best.title },
    create: { mediaId, mangaDexId: best.id, title: best.title },
  });

  const session = await auth();
  if (session?.user?.id) {
    await prisma.mangaEntry.updateMany({
      where: { userId: session.user.id, mediaId },
      data: { mangaDexId: best.id },
    });
  }

  return NextResponse.json({ mangaDexId: best.id, title: best.title, cached: false });
}

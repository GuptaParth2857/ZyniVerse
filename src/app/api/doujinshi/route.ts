import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getDynamicDoujinshi } from "@/lib/doujinshi-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const parody = searchParams.get("parody") || undefined;
  const tag = searchParams.get("tag") || undefined;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const perPage = Math.min(50, Math.max(1, Number(searchParams.get("perPage")) || 20));

  let results = await getDynamicDoujinshi(search, parody, tag);
  const total = results.length;

  const start = (page - 1) * perPage;
  results = results.slice(start, start + perPage);

  return NextResponse.json({
    entries: results,
    total,
    page,
    perPage,
    hasMore: start + perPage < total,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, circle, artist, parody, tags, description, coverUrl, pages, language, isTranslated, externalUrl } = await req.json();

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const entry = await prisma.doujinshi.create({
    data: {
      title,
      circle,
      artist,
      parody,
      tags: Array.isArray(tags) ? tags.join(",") : tags || "",
      description,
      coverUrl,
      pages: pages ? Number(pages) : null,
      language: language || "japanese",
      isTranslated: !!isTranslated,
      externalUrl,
      addedBy: session.user.id,
      isApproved: false,
    },
  });

  return NextResponse.json({ entry });
}

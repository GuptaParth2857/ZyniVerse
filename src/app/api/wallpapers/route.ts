import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limiter";
import { Prisma } from "@prisma/client";
export const dynamic = "force-dynamic";

const WALLHAVEN_SEARCH_URL = "https://wallhaven.cc/api/v1/search";
const ANON_USER_ID = "cms4p145n000610io1ko67udz";
const searchedTerms = new Set<string>();

function titleCase(term: string) {
  return term
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function wallhavenThumb(fullPath: string): string | null {
  const m = fullPath.match(/w\.wallhaven\.cc\/full\/([a-z0-9]{2})\/wallhaven-([^.]+)\./);
  return m ? `https://th.wallhaven.cc/lg/${m[1]}/${m[2]}.jpg` : null;
}

async function hydrateFromWallhaven(term: string) {
  const clean = term.trim();
  if (!clean || clean.length > 60 || searchedTerms.has(clean.toLowerCase())) return;
  searchedTerms.add(clean.toLowerCase());

  try {
    const params = new URLSearchParams({
      q: clean,
      categories: "010",
      purity: "100",
      atleast: "1920x1080",
      sorting: "relevance",
      page: "1",
    });
    const [res, existingRows] = await Promise.all([
      fetch(`${WALLHAVEN_SEARCH_URL}?${params}`, { cache: "no-store" }),
      prisma.wallpaper.findMany({ select: { imageUrl: true } }),
    ]);
    if (!res.ok) return;
    const json = (await res.json()) as {
      data?: Array<{
        path: string;
        resolution: string;
        dimension_x: number;
        dimension_y: number;
        views?: number;
        favorites?: number;
      }>;
    };
    const candidates = (json.data || []).slice(0, 6);

    const existing = new Set(existingRows.map((w) => w.imageUrl));
    const fresh = candidates.filter((w) => !existing.has(w.path));

    const tagTokens = [clean.toLowerCase(), ...clean.toLowerCase().split(/\s+/)];
    const results = await Promise.allSettled(
      fresh.map((wv) =>
        prisma.wallpaper.create({
          data: {
            userId: ANON_USER_ID,
            title: `${titleCase(clean)} — Anime Wallpaper`,
            description: `On-demand "${clean}" anime wallpaper, pulled from a live wallpaper gallery.`,
            imageUrl: wv.path,
            thumbnailUrl: wallhavenThumb(wv.path),
            animeTitle: titleCase(clean),
            resolution: wv.resolution || null,
            category: wv.dimension_y > wv.dimension_x ? "portrait" : "landscape",
            tags: [...tagTokens, "anime", "character", "wallpaper", "4k"].join(","),
            // Use live Wallhaven engagement metrics instead of fabricated numbers.
            downloads: typeof wv.views === "number" ? wv.views : 0,
            likes: typeof wv.favorites === "number" ? wv.favorites : 0,
          },
        })
      )
    );
    const created = results.filter((r) => r.status === "fulfilled").length;
    if (created > 0) {
      console.log(`[wallpaper-hydrate] "${clean}" -> ${created} cached`);
    }
  } catch {
    // never let hydration break search
  }
}

export async function GET(req: NextRequest) {
  const rateLimited = await apiLimiter.middleware(req);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") || "recent";
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = Math.min(parseInt(searchParams.get("perPage") || "30"), 100);

  const where: Prisma.WallpaperWhereInput = {};
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { animeTitle: { contains: search, mode: "insensitive" } },
      { tags: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy =
    sort === "popular"
      ? { likes: "desc" as const }
      : sort === "downloads"
        ? { downloads: "desc" as const }
        : { createdAt: "desc" as const };

  const query = {
    where,
    orderBy,
    skip: (page - 1) * perPage,
    take: perPage,
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  } satisfies Prisma.WallpaperFindManyArgs;

  let [items, total] = await Promise.all([
    prisma.wallpaper.findMany(query),
    prisma.wallpaper.count({ where }),
  ]);

  if (search && items.length < 3) {
    await hydrateFromWallhaven(search);
    [items, total] = await Promise.all([
      prisma.wallpaper.findMany(query),
      prisma.wallpaper.count({ where }),
    ]);
  }

  const headers = search
    ? { "Cache-Control": "no-store" }
    : { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" };

  return NextResponse.json(
    { items, total, page, hasNextPage: page * perPage < total },
    { headers }
  );
}

export async function POST(req: NextRequest) {
  const rateLimited = await apiLimiter.middleware(req);
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, imageUrl, thumbnailUrl, animeTitle, animeId, resolution, category, tags } = await req.json();
  if (!title || !imageUrl) {
    return NextResponse.json({ error: "Missing required fields (title, imageUrl)" }, { status: 400 });
  }

  const wallpaper = await prisma.wallpaper.create({
    data: {
      userId: session.user.id,
      title,
      description: description || null,
      imageUrl,
      thumbnailUrl: thumbnailUrl || null,
      animeTitle: animeTitle || null,
      animeId: animeId ? parseInt(animeId) : null,
      resolution: resolution || null,
      category: category || "landscape",
      tags: tags || "",
    },
    include: {
      user: { select: { id: true, username: true, avatar: true } },
    },
  });

  return NextResponse.json({ wallpaper });
}

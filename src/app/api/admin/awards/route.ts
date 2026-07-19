import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year");
  const platform = searchParams.get("platform");
  const type = searchParams.get("type");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (year) where.year = parseInt(year, 10);
  if (platform) where.platform = platform;
  if (type) where.type = type;

  const [awards, total] = await Promise.all([
    prisma.externalAward.findMany({
      where,
      orderBy: [{ year: "desc" }, { platform: "asc" }, { category: "asc" }],
      skip,
      take: limit,
    }),
    prisma.externalAward.count({ where }),
  ]);

  const years = await prisma.externalAward.findMany({
    select: { year: true },
    distinct: ["year"],
    orderBy: { year: "desc" },
  });

  const platforms = await prisma.externalAward.findMany({
    select: { platform: true },
    distinct: ["platform"],
    orderBy: { platform: "asc" },
  });

  const types = await prisma.externalAward.findMany({
    select: { type: true },
    distinct: ["type"],
    orderBy: { type: "asc" },
  });

  return NextResponse.json({
    awards,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    years: years.map((y) => y.year),
    platforms: platforms.map((p) => p.platform),
    types: types.map((t) => t.type),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { year, category, winner, platform, type, image, malId, anilistId, source } = body;

  if (!year || !category || !winner || !platform || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const award = await prisma.externalAward.upsert({
    where: {
      year_category_platform_winner: {
        year: parseInt(year, 10),
        category,
        platform,
        winner,
      },
    },
    update: { image, malId, anilistId, source, type },
    create: {
      year: parseInt(year, 10),
      category,
      winner,
      platform,
      type,
      image,
      malId: malId ? parseInt(malId, 10) : null,
      anilistId: anilistId ? parseInt(anilistId, 10) : null,
      source,
    },
  });

  return NextResponse.json({ award });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.externalAward.delete({ where: { id: parseInt(id, 10) } });
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, year, category, winner, platform, type, image, malId, anilistId, source } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const award = await prisma.externalAward.update({
    where: { id: parseInt(id, 10) },
    data: {
      year: year ? parseInt(year, 10) : undefined,
      category,
      winner,
      platform,
      type,
      image,
      malId: malId ? parseInt(malId, 10) : null,
      anilistId: anilistId ? parseInt(anilistId, 10) : null,
      source,
    },
  });

  return NextResponse.json({ award });
}

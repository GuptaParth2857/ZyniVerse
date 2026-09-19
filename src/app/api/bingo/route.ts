import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { generateSquares, generateSquaresForTemplate } from "@/lib/bingo";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cards = await prisma.bingoCard.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ cards });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { season, year, templateId } = await req.json();
  if (!season || !year) {
    return NextResponse.json({ error: "Season and year are required" }, { status: 400 });
  }

  const seasonUpper = String(season).toUpperCase();
  if (!["WINTER", "SPRING", "SUMMER", "FALL"].includes(seasonUpper)) {
    return NextResponse.json({ error: "Invalid season" }, { status: 400 });
  }

  const existing = await prisma.bingoCard.findFirst({
    where: { userId: session.user.id, season: seasonUpper, year: Number(year) },
  });
  if (existing) {
    return NextResponse.json({ card: existing });
  }

  let squares: string;
  let titleSuffix = "";
  let cardTemplateId: string | undefined;

  if (templateId) {
    const template = await prisma.bingoTemplate.findFirst({ where: { id: String(templateId), isActive: true } });
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    squares = JSON.stringify(generateSquaresForTemplate(template.squares));
    titleSuffix = ` · ${template.title}`;
    cardTemplateId = template.id;
    await prisma.bingoTemplate.update({
      where: { id: template.id },
      data: { usesCount: { increment: 1 } },
    });
  } else {
    squares = JSON.stringify(generateSquares());
  }

  const seasonLabel = seasonUpper.charAt(0) + seasonUpper.slice(1).toLowerCase();
  const card = await prisma.bingoCard.create({
    data: {
      userId: session.user.id,
      title: `${seasonLabel} ${year} Anime Bingo${titleSuffix}`,
      season: seasonUpper,
      year: Number(year),
      squares,
      templateId: cardTemplateId,
    },
  });

  return NextResponse.json({ card }, { status: 201 });
}
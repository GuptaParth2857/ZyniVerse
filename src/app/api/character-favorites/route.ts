import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { resolveUserId } from "@/lib/resolve-user";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const favs = await prisma.characterFavorite.findMany({
    where: { userId },
    orderBy: [{ rank: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ favorites: favs });
}

export async function PUT(request: Request) {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const characterId = Number(body.characterId);
  const characterName = String(body.characterName || "").trim();
  const characterImage = body.characterImage ? String(body.characterImage) : null;

  if (!characterId || !characterName) {
    return NextResponse.json({ error: "characterId and characterName are required" }, { status: 400 });
  }

  try {
    await prisma.characterFavorite.create({
      data: { userId, characterId, characterName, characterImage: characterImage, kind: "favorite", rank: 0 },
    });
  } catch {
    await prisma.characterFavorite.delete({ where: { userId_characterId: { userId, characterId } } });
  }

  const favs = await prisma.characterFavorite.findMany({
    where: { userId },
    orderBy: [{ rank: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ favorite: favs.some((f) => f.characterId === characterId), favorites: favs });
}

export async function PATCH(request: Request) {
  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const characterId = Number(body.characterId);
  if (!characterId) return NextResponse.json({ error: "characterId is required" }, { status: 400 });

  const kind = ["favorite", "waifu", "husbando"].includes(body.kind) ? body.kind : undefined;
  const rank = body.rank !== undefined ? Number(body.rank) : undefined;

  const data: Record<string, unknown> = {};
  if (kind) data.kind = kind;
  if (rank !== undefined && !Number.isNaN(rank)) data.rank = rank;

  await prisma.characterFavorite.update({
    where: { userId_characterId: { userId, characterId } },
    data,
  });

  return NextResponse.json({ ok: true });
}
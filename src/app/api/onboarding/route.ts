import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ONBOARDING_GENRES, ONBOARDING_MOODS, MAX_ONBOARDING_GENRES } from "@/lib/onboarding";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ onboarded: false });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboarded: true, favoriteGenres: true, favoriteMoods: true },
  });

  return NextResponse.json({
    onboarded: user?.onboarded ?? false,
    favoriteGenres: user?.favoriteGenres ?? [],
    favoriteMoods: user?.favoriteMoods ?? [],
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    favoriteGenres?: string[];
    favoriteMoods?: string[];
    skip?: boolean;
  };

  const selectedGenres = Array.isArray(body.favoriteGenres) ? body.favoriteGenres : [];
  const genres = selectedGenres
    .filter((g) => ONBOARDING_GENRES.includes(g))
    .slice(0, MAX_ONBOARDING_GENRES);

  const moods = Array.isArray(body.favoriteMoods)
    ? body.favoriteMoods.filter((m) => ONBOARDING_MOODS.includes(m)).slice(0, 5)
    : [];

  if (!body.skip && genres.length === 0) {
    return NextResponse.json({ error: "Pick at least one genre." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      favoriteGenres: genres.length ? genres : undefined,
      favoriteMoods: moods.length ? moods : undefined,
      onboarded: true,
    },
  });

  return NextResponse.json({ onboarded: true, favoriteGenres: genres, favoriteMoods: moods });
}

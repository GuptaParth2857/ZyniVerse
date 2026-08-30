import { NextResponse } from "next/server";
import { DUBBED_ANIME_STATIC } from "@/lib/data/dubbed-static";

interface DubAnime {
  mal_id: number;
  title: string;
  displayTitle: string;
  image: string;
  synopsis: string;
  genres: string[];
  hasHindi: boolean;
  hasTamil: boolean;
  hasTelugu: boolean;
  hasEnglish: boolean;
  comingSoonLanguages: string[];
  isCurrentSeason: boolean;
  score: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") || "all";

  const allDubs: DubAnime[] = DUBBED_ANIME_STATIC.map((d) => ({
    mal_id: d.mal_id,
    title: d.title,
    displayTitle: d.displayTitle,
    image: d.image,
    synopsis: d.synopsis,
    genres: d.genres,
    hasHindi: d.hasHindi,
    hasTamil: d.hasTamil,
    hasTelugu: d.hasTelugu,
    hasEnglish: d.hasEnglish,
    comingSoonLanguages: d.comingSoonLanguages,
    isCurrentSeason: d.isCurrentSeason,
    score: d.score,
  })).filter(
    (d, i, arr) => arr.findIndex((x) => x.mal_id === d.mal_id) === i
  );

  let filtered = allDubs;
  if (language === "hindi") filtered = allDubs.filter((d) => d.hasHindi);
  else if (language === "tamil") filtered = allDubs.filter((d) => d.hasTamil);
  else if (language === "telugu") filtered = allDubs.filter((d) => d.hasTelugu);
  else if (language === "english") filtered = allDubs.filter((d) => d.hasEnglish);

  const currentSeason = filtered.filter((d) => d.isCurrentSeason);
  const available = filtered.filter((d) => !d.isCurrentSeason && !d.comingSoonLanguages.length);
  const comingSoon = filtered.filter((d) => d.comingSoonLanguages.length > 0);
  const recent = filtered.filter((d) => d.isCurrentSeason);

  return NextResponse.json({
    success: true,
    source: "static",
    counts: {
      total: filtered.length,
      hindi: allDubs.filter((d) => d.hasHindi).length,
      tamil: allDubs.filter((d) => d.hasTamil).length,
      telugu: allDubs.filter((d) => d.hasTelugu).length,
      english: allDubs.filter((d) => d.hasEnglish).length,
      currentSeason: currentSeason.length,
      available: available.length,
      comingSoon: comingSoon.length,
      recent: recent.length,
    },
    data: {
      currentSeason,
      available,
      comingSoon,
      recent,
    },
  });
}
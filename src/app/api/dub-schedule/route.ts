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

const ANITALY_BASE = "https://anitally.in/api";
const MYDUBLIST_URL = "https://raw.githubusercontent.com/Joelis57/MyDubList/main/dubs/confidence/normal/dubbed_english.json";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") || "all";

  let allDubs: DubAnime[] = [];
  let useFallback = false;

  try {
    const [regionalRes, , englishDubRes] = await Promise.all([
      fetch(`${ANITALY_BASE}/regional-dubs`, { signal: AbortSignal.timeout(8000) }),
      fetch(`${ANITALY_BASE}/recently-added-dubs`, { signal: AbortSignal.timeout(8000) }),
      fetch(MYDUBLIST_URL, { signal: AbortSignal.timeout(8000) }),
    ]);

    if (!regionalRes.ok) throw new Error("API unavailable");

    const englishDubData = englishDubRes.ok ? await englishDubRes.json() : null;
    const englishDubIds = englishDubData?.dubbed
      ? new Set<number>(englishDubData.dubbed)
      : new Set<number>();

    const regionalData = await regionalRes.json();

    allDubs = (regionalData.data || []).map((item: Record<string, unknown>) => {
      const comingSoon = typeof item.coming_soon_languages === "string"
        ? item.coming_soon_languages.split(",").map((l: string) => l.trim()).filter(Boolean)
        : [];
      const localRating = item.localRating as Record<string, unknown> | undefined;
      const dubRatings = item.dubRatings as Record<string, Record<string, unknown>> | undefined;
      const score = localRating?.average
        ? localRating.average
        : dubRatings?.Hindi?.average && dubRatings.Hindi.average !== "No Ratings"
          ? dubRatings.Hindi.average
          : null;
      return {
        mal_id: item.mal_id as number,
        title: item.title as string,
        displayTitle: (item.displayTitle as string) || (item.title as string),
        image: item.image_url as string,
        synopsis: (item.synopsis as string) || "",
        genres: (item.genres as string[]) || [],
        hasHindi: (item.has_hindi as boolean) || comingSoon.includes("Hindi"),
        hasTamil: (item.has_tamil as boolean) || comingSoon.includes("Tamil"),
        hasTelugu: (item.has_telugu as boolean) || comingSoon.includes("Telugu"),
        hasEnglish: englishDubIds.has(item.mal_id as number),
        comingSoonLanguages: comingSoon,
        isCurrentSeason: item.is_current_season_dub === 1,
        score: score as string,
      };
    });

    const seen = new Set<number>();
    allDubs = allDubs.filter((d) => {
      if (seen.has(d.mal_id)) return false;
      seen.add(d.mal_id);
      return true;
    });
  } catch {
    useFallback = true;
    allDubs = [...DUBBED_ANIME_STATIC];
  }

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
    source: useFallback ? "static" : "api",
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

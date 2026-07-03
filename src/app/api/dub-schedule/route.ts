import { NextResponse } from "next/server";

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

  try {
    const [regionalRes, recentlyRes, englishDubRes] = await Promise.all([
      fetch(`${ANITALY_BASE}/regional-dubs`, { signal: AbortSignal.timeout(8000) }),
      fetch(`${ANITALY_BASE}/recently-added-dubs`, { signal: AbortSignal.timeout(8000) }),
      fetch(MYDUBLIST_URL, {
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 86400 },
      }),
    ]);

    if (!regionalRes.ok) throw new Error("Failed to fetch dub data");

    const englishDubData = englishDubRes.ok ? await englishDubRes.json() : null;
    const englishDubIds = englishDubData?.dubbed
      ? new Set<number>(englishDubData.dubbed)
      : new Set<number>();

    const regionalData = await regionalRes.json();
    const recentlyData = recentlyRes.ok ? (await recentlyRes.json()).data : [];

    const recentIds = new Set(recentlyData.map((r: any) => r.mal_id));

    let allDubs: DubAnime[] = (regionalData.data || []).map((item: any) => {
      const comingSoon = item.coming_soon_languages
        ? item.coming_soon_languages.split(",").map((l: string) => l.trim()).filter(Boolean)
        : [];

      const score = item.localRating?.average
        ? item.localRating.average
        : item.dubRatings?.Hindi?.average && item.dubRatings.Hindi.average !== "No Ratings"
          ? item.dubRatings.Hindi.average
          : null;

      return {
        mal_id: item.mal_id,
        title: item.title,
        displayTitle: item.displayTitle || item.title,
        image: item.image_url,
        synopsis: item.synopsis || "",
        genres: item.genres || [],
        hasHindi: item.has_hindi || comingSoon.includes("Hindi"),
        hasTamil: item.has_tamil || comingSoon.includes("Tamil"),
        hasTelugu: item.has_telugu || comingSoon.includes("Telugu"),
        hasEnglish: englishDubIds.has(item.mal_id),
        comingSoonLanguages: comingSoon,
        isCurrentSeason: item.is_current_season_dub === 1,
        score,
      };
    });

    const seen = new Set<number>();
    allDubs = allDubs.filter((d) => {
      if (seen.has(d.mal_id)) return false;
      seen.add(d.mal_id);
      return true;
    });

    let filtered = allDubs;
    if (language === "hindi") filtered = allDubs.filter((d) => d.hasHindi);
    else if (language === "tamil") filtered = allDubs.filter((d) => d.hasTamil);
    else if (language === "telugu") filtered = allDubs.filter((d) => d.hasTelugu);
    else if (language === "english") filtered = allDubs.filter((d) => d.hasEnglish);

    const currentSeason = filtered.filter((d) => d.isCurrentSeason);
    const available = filtered.filter((d) => !d.isCurrentSeason && !d.comingSoonLanguages.length);
    const comingSoon = filtered.filter((d) => d.comingSoonLanguages.length > 0);
    const recent = filtered.filter((d) => recentIds.has(d.mal_id));

    return NextResponse.json({
      success: true,
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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

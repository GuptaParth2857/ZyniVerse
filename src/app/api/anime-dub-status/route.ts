import { NextResponse } from "next/server";

const ANITALY_BASE = "https://anitally.in/api";
const MYDUBLIST_URL = "https://raw.githubusercontent.com/Joelis57/MyDubList/main/dubs/confidence/normal/dubbed_english.json";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const malId = searchParams.get("malId");

  if (!malId) {
    return NextResponse.json({ success: false, error: "malId required" }, { status: 400 });
  }

  try {
    const [regionalRes, englishRes] = await Promise.all([
      fetch(`${ANITALY_BASE}/regional-dubs`, { signal: AbortSignal.timeout(8000) }),
      fetch(MYDUBLIST_URL, {
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 86400 },
      }),
    ]);

    const regionalData = regionalRes.ok ? await regionalRes.json() : null;
    const englishData = englishRes.ok ? await englishRes.json() : null;
    const englishDubIds = englishData?.dubbed ? new Set<number>(englishData.dubbed) : new Set<number>();

    const malIdNum = parseInt(malId, 10);
    const match = regionalData?.data?.find((item: any) => item.mal_id === malIdNum);

    if (!match) {
      const hasEnglish = englishDubIds.has(malIdNum);
      return NextResponse.json({
        success: true,
        available: hasEnglish ? ["English"] : [],
        details: {
          hasEnglish,
          hasHindi: false,
          hasTamil: false,
          hasTelugu: false,
          isCurrentSeason: false,
          comingSoonLanguages: [],
        },
      });
    }

    const comingSoon = match.coming_soon_languages
      ? match.coming_soon_languages.split(",").map((l: string) => l.trim()).filter(Boolean)
      : [];

    const hasEnglish = englishDubIds.has(match.mal_id);
    const hasHindi = match.has_hindi || comingSoon.includes("Hindi");
    const hasTamil = match.has_tamil || comingSoon.includes("Tamil");
    const hasTelugu = match.has_telugu || comingSoon.includes("Telugu");

    const available: string[] = [];
    if (hasEnglish) available.push("English");
    if (hasHindi) available.push("Hindi");
    if (hasTamil) available.push("Tamil");
    if (hasTelugu) available.push("Telugu");

    return NextResponse.json({
      success: true,
      available,
      details: {
        hasEnglish,
        hasHindi,
        hasTamil,
        hasTelugu,
        isCurrentSeason: match.is_current_season_dub === 1,
        comingSoonLanguages: comingSoon.filter((l: string) => !match[`has_${l.toLowerCase()}`]),
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to check dub status" }, { status: 500 });
  }
}

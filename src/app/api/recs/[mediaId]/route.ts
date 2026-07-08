import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await params;
  const id = parseInt(mediaId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid mediaId" }, { status: 400 });

  const [animeResp, recsResp] = await Promise.all([
    fetch(`https://api.jikan.moe/v4/anime/${id}`),
    fetch(`https://api.jikan.moe/v4/anime/${id}/recommendations`),
  ]);

  if (!animeResp.ok || !recsResp.ok) return NextResponse.json({ recs: [], reason: "" });

  const animeData = await animeResp.json();
  const recsData = await recsResp.json();
  const anime = animeData.data;

  const genres = new Set((anime?.genres || []).map((g: any) => g.name));
  const studios = new Set((anime?.studios || []).map((s: any) => s.name));
  const source = anime?.source || "";
  const themes = new Set((anime?.themes || []).map((t: any) => t.name));

  const recs = (recsData.data || []).slice(0, 8).map((r: any) => {
    const entry = r.entry;
    const reasons: string[] = [];
    const entryGenres = new Set((entry.genres || []).map((g: any) => g.name));
    const entryThemes = new Set((entry.themes || []).map((t: any) => t.name));

    const sharedGenres = [...genres].filter((g) => entryGenres.has(g));
    if (sharedGenres.length > 0) reasons.push(`Same ${sharedGenres.slice(0, 2).join(", ")} genre`);

    const sharedStudios = [...studios].filter((s) => entryGenres.has(s));
    if (sharedStudios.length > 0 || entry.studios?.some((s: any) => studios.has(s.name))) {
      reasons.push("Same studio");
    }

    if (source && entry.source === source) reasons.push(`Same source (${source})`);
    const sharedThemes = [...themes].filter((t) => entryThemes.has(t));
    if (sharedThemes.length > 0) reasons.push(`Shares ${sharedThemes[0]} theme`);

    return {
      malId: entry.mal_id,
      title: entry.title,
      image: entry.images?.jpg?.image_url || entry.images?.webp?.image_url,
      url: entry.url,
      reason: reasons[0] || "Similar taste",
      allReasons: reasons,
    };
  });

  return NextResponse.json({ recs, total: recs.length });
}

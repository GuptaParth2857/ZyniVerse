import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await params;
  const id = parseInt(mediaId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid mediaId" }, { status: 400 });

  const resp = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`);
  if (!resp.ok) return NextResponse.json({ metadata: null });

  const data = await resp.json();
  const d = data.data;

  const metadata = {
    broadcast: d.broadcast?.string || null,
    licensors: (d.licensors || []).map((l: any) => l.name),
    producers: (d.producers || []).map((p: any) => p.name),
    rating: d.rating || null,
    demographics: (d.demographics || []).map((dm: any) => dm.name),
    duration: d.duration || null,
    season: d.season || null,
    year: d.year || null,
    synopsis: d.synopsis || null,
    background: d.background || null,
    external: (d.external || []).map((e: any) => ({ name: e.name, url: e.url })),
    relations: (d.relations || []).map((r: any) => ({
      relation: r.relation,
      entries: (r.entry || []).map((en: any) => ({ malId: en.mal_id, name: en.name, type: en.type })),
    })),
    theme: d.theme ? (typeof d.theme === "string" ? d.theme : JSON.stringify(d.theme)) : null,
    openings: (d.theme?.openings || []).slice(0, 5),
    endings: (d.theme?.endings || []).slice(0, 5),
  };

  return NextResponse.json({ metadata });
}

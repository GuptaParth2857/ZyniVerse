import { NextRequest, NextResponse } from "next/server";

interface JikanNamedItem {
  name: string;
}

interface JikanExternalLink {
  name: string;
  url: string;
}

interface JikanRelationEntry {
  mal_id: number;
  name: string;
  type: string;
}

interface JikanRelation {
  relation: string;
  entry: JikanRelationEntry[];
}

interface JikanAnimeFull {
  data: {
    broadcast?: { string?: string | null };
    licensors?: JikanNamedItem[];
    producers?: JikanNamedItem[];
    rating?: string | null;
    demographics?: JikanNamedItem[];
    duration?: string | null;
    season?: string | null;
    year?: number | null;
    synopsis?: string | null;
    background?: string | null;
    external?: JikanExternalLink[];
    relations?: JikanRelation[];
    theme?: { openings?: string[]; endings?: string[] } | string;
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await params;
  const id = parseInt(mediaId, 10);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid mediaId" }, { status: 400 });

  const resp = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`);
  if (!resp.ok) return NextResponse.json({ metadata: null });

  const data = (await resp.json()) as JikanAnimeFull;
  const d = data.data;
  const themeData = typeof d.theme === "string" ? null : d.theme;

  const metadata = {
    broadcast: d.broadcast?.string || null,
    licensors: (d.licensors || []).map((l) => l.name),
    producers: (d.producers || []).map((p) => p.name),
    rating: d.rating || null,
    demographics: (d.demographics || []).map((dm) => dm.name),
    duration: d.duration || null,
    season: d.season || null,
    year: d.year || null,
    synopsis: d.synopsis || null,
    background: d.background || null,
    external: (d.external || []).map((e) => ({ name: e.name, url: e.url })),
    relations: (d.relations || []).map((r) => ({
      relation: r.relation,
      entries: (r.entry || []).map((en) => ({ malId: en.mal_id, name: en.name, type: en.type })),
    })),
    theme: d.theme ? (typeof d.theme === "string" ? d.theme : JSON.stringify(d.theme)) : null,
    openings: (themeData?.openings || []).slice(0, 5),
    endings: (themeData?.endings || []).slice(0, 5),
  };

  return NextResponse.json({ metadata });
}

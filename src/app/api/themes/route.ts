import { NextResponse } from "next/server";
import { THEME_SONGS } from "@/lib/data/themes";
import { THEME_COVERS } from "@/lib/data/theme-covers";

const ANILIST_GQL = "https://graphql.anilist.co";

interface AniListResult {
  id: number;
  title: string;
  image: string | null;
}

async function searchAniList(query: string): Promise<AniListResult[]> {
  try {
    const q = `query($search:String){Page(page:1,perPage:20){media(search:$search,type:ANIME){id title{romaji english}coverImage{large}}}}`;
    const res = await fetch(ANILIST_GQL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: q, variables: { search: query } }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const media = data?.data?.Page?.media || [];
    return media.map((m: { id: number; title: { romaji: string; english: string | null }; coverImage: { large: string | null } }) => ({
      id: m.id,
      title: m.title?.english || m.title?.romaji || `Anime #${m.id}`,
      image: m.coverImage?.large || null,
    }));
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q")?.toLowerCase() || "";

  const mediaIds = [...new Set(THEME_SONGS.map((t) => t.mediaId))];

  // Build groups for hardcoded anime
  const localGroups: { mediaId: number; title: string; image: string | null; count: number }[] = mediaIds.map((id) => {
    const cover = THEME_COVERS[id];
    const count = THEME_SONGS.filter((t) => t.mediaId === id).length;
    return {
      mediaId: id,
      title: cover?.title || `Anime #${id}`,
      image: cover?.image || null,
      count,
    };
  });

  if (search) {
    // Filter local matches
    const localMatches = localGroups.filter((g) => g.title.toLowerCase().includes(search));

    // Also search AniList for any anime (not in local list)
    const anilistResults = await searchAniList(search);
    const localIds = new Set(localGroups.map((g) => g.mediaId));
    const remoteGroups = anilistResults
      .filter((r) => !localIds.has(r.id))
      .map((r) => ({ mediaId: r.id, title: r.title, image: r.image, count: 0 }));

    return NextResponse.json({ groups: [...localMatches, ...remoteGroups] });
  }

  return NextResponse.json({ groups: localGroups });
}

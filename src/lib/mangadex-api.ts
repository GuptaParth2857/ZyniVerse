const MANGADEX_API = "https://api.mangadex.org";

const DOUJINSHI_TAG = "4d32b401-f1ff-4cec-a6eb-1303e2e1cc2c";

export interface DoujinshiEntry {
  id: string;
  title: string;
  circle: string;
  artist: string;
  parody: string;
  tags: string[];
  description: string;
  pages: number;
  language: string;
  isTranslated: boolean;
  externalUrl: string;
  image: string;
}

interface MDManga {
  id: string;
  attributes: {
    title: Record<string, string>;
    description: Record<string, string>;
    originalLanguage: string;
    tags: Array<{ id: string; attributes: { name: Record<string, string>; group: string } }>;
    contentRating: string;
    availableTranslatedLanguages: string[];
  };
  relationships: Array<{
    id: string;
    type: string;
    attributes?: { fileName?: string; name?: string };
  }>;
}

function transform(m: MDManga): DoujinshiEntry {
  const cover = m.relationships.find((r) => r.type === "cover_art");
  const author = m.relationships.find((r) => r.type === "author");
  const artist = m.relationships.find((r) => r.type === "artist");
  const fileName = cover?.attributes?.fileName;
  const title = Object.values(m.attributes.title)[0] || "Untitled";
  const desc = Object.values(m.attributes.description)[0] || "";
  const tags = m.attributes.tags.map((t) => Object.values(t.attributes.name)[0] || t.id);
  const allNames = [author?.attributes?.name, artist?.attributes?.name].filter(Boolean) as string[];
  const artistName = allNames[0] || "Unknown";
  const circleName = allNames.length > 1 ? allNames[1] : allNames[0] || "Unknown";

  return {
    id: m.id,
    title,
    circle: circleName,
    artist: artistName,
    parody: "Various",
    tags,
    description: desc,
    pages: 0,
    language: m.attributes.originalLanguage || "ja",
    isTranslated: (m.attributes.availableTranslatedLanguages || []).includes("en"),
    externalUrl: `https://mangadex.org/title/${m.id}`,
    image: fileName ? `https://uploads.mangadex.org/covers/${m.id}/${fileName}.256.jpg` : "",
  };
}

export async function getDoujinshi(params?: {
  search?: string;
  limit?: number;
  offset?: number;
  sort?: "popular" | "latest" | "rating" | "title";
}): Promise<{ entries: DoujinshiEntry[]; total: number }> {
  const sp = new URLSearchParams();
  sp.set("limit", String(Math.min(params?.limit ?? 50, 50)));
  sp.set("offset", String(params?.offset ?? 0));

  switch (params?.sort) {
    case "latest":
      sp.set("order[latestUploadedChapter]", "desc");
      break;
    case "rating":
      sp.set("order[rating]", "desc");
      break;
    case "title":
      sp.set("order[title]", "asc");
      break;
    default:
      sp.set("order[followedCount]", "desc");
  }

  sp.set("contentRating[]", "safe");
  sp.set("contentRating[]", "suggestive");
  sp.set("includes[]", "cover_art");
  sp.set("includes[]", "author");
  sp.set("includes[]", "artist");
  sp.set("availableTranslatedLanguage[]", "en");
  sp.append("tags[]", DOUJINSHI_TAG);
  if (params?.search) sp.set("title", params.search);

  const url = `${MANGADEX_API}/manga?${sp.toString()}`;
  const res = await fetch(url, {
    next: { revalidate: 1800 },
    headers: { "User-Agent": "ZyniVerse/1.0" },
  });

  if (!res.ok) {
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 1000));
      return getDoujinshi(params);
    }
    throw new Error(`MangaDex API error: ${res.status}`);
  }

  const json = await res.json();
  return {
    entries: (json.data || []).map(transform),
    total: json.total ?? 0,
  };
}

export async function getDoujinshiById(id: string): Promise<DoujinshiEntry | null> {
  const url = `${MANGADEX_API}/manga/${id}?includes[]=cover_art&includes[]=author&includes[]=artist`;
  const res = await fetch(url, {
    next: { revalidate: 3600 },
    headers: { "User-Agent": "ZyniVerse/1.0" },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return transform(json.data);
}

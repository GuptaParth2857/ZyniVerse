const MANGADEX_API = "https://api.mangadex.org";

const DOUJINSHI_TAG = "b13b2a48-c720-44a9-9c77-39c9979373fb";

const GENRE_TAG_MAP: Record<string, string> = {
  Action: "391b0423-d847-456f-aff0-8b0cfc03066b",
  Adventure: "87cc87cd-a395-47af-b27a-93258283bbc6",
  Comedy: "4d32cc48-9f00-4cca-9b5a-a839f0764984",
  Drama: "b9af3a63-f058-46de-a9a0-e0c13906197a",
  Fantasy: "cdc58593-87dd-415e-bbc0-2ec27bf404cc",
  Horror: "cdad7e68-1419-41dd-bdce-27753074a640",
  Mystery: "ee968100-4191-4968-93d3-f82d72be7e46",
  "Slice of Life": "e5301a23-ebd9-49dd-a0cb-2add944c7fe9",
  "Sci-Fi": "256c8bd9-4904-4360-bf4f-508a76d67183",
  Thriller: "07251805-a27e-4d59-b488-f0bfbec15168",
  Romance: "423e2eae-a7a2-4a8b-ac03-a8351462d71d",
  Historical: "33771934-028e-4cb3-8744-691e866a923e",
  Psychological: "3b60b75c-a2d7-4860-ab56-05f391bb889c",
  Mecha: "50880a9d-5440-4732-9afb-8f457127e836",
  Sports: "69964a64-2f90-4d33-beeb-f3ed2875eb4c",
  Superhero: "7064a261-a137-4d3a-8848-2d385de3a99c",
  "Magical Girls": "81c836c9-914a-4eca-981a-560dad663e73",
  Isekai: "ace04997-f6bd-436e-b261-779182193d3d",
  Tragedy: "f8f62932-27da-4fe4-8ee1-6779a8c5edba",
  "Girls' Love": "a3c67850-4684-404e-9b7f-c69850ee5da6",
  "Boys' Love": "5920b825-4181-4a17-beeb-9918b0ff7a30",
  Wuxia: "acc803a4-c95a-4c22-86fc-eb6b582d82a2",
  Crime: "5ca48985-9a9d-4bd8-be29-80dc0303db72",
  Medical: "c8cbe35b-1b2b-4a3f-9c37-db84c4514856",
  Philosophical: "b1e97889-25b4-4258-b28b-cd7f4d28ea9b",
};

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

async function fetchWithRetry(url: string, retries = 1): Promise<Response> {
  const res = await fetch(url, {
    headers: { "User-Agent": "ZyniVerse/1.0" },
  });
  if (res.status === 429 && retries > 0) {
    const retryAfter = res.headers.get("Retry-After");
    const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
    await new Promise((r) => setTimeout(r, waitMs));
    return fetchWithRetry(url, retries - 1);
  }
  return res;
}

export async function getDoujinshi(params?: {
  search?: string;
  limit?: number;
  offset?: number;
  sort?: "popular" | "latest" | "rating" | "title";
  genres?: string[];
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

  sp.append("contentRating[]", "safe");
  sp.append("contentRating[]", "suggestive");
  sp.append("contentRating[]", "erotica");
  sp.set("includes[]", "cover_art");
  sp.append("includes[]", "author");
  sp.append("includes[]", "artist");
  sp.append("availableTranslatedLanguage[]", "en");
  sp.append("availableTranslatedLanguage[]", "ja");
  sp.append("includedTags[]", DOUJINSHI_TAG);
  if (params?.genres) {
    for (const g of params.genres) {
      const tagId = GENRE_TAG_MAP[g];
      if (tagId) sp.append("includedTags[]", tagId);
    }
  }
  if (params?.search) sp.set("title", params.search);

  const url = `${MANGADEX_API}/manga?${sp.toString()}`;
  const res = await fetchWithRetry(url);

  if (!res.ok) {
    throw new Error(`MangaDex API error: ${res.status}`);
  }

  const json = await res.json();
  return {
    entries: (json.data || []).map(transform),
    total: json.total ?? 0,
  };
}

export async function getDoujinshiById(id: string): Promise<DoujinshiEntry | null> {
  const sp = new URLSearchParams();
  sp.append("includes[]", "cover_art");
  sp.append("includes[]", "author");
  sp.append("includes[]", "artist");

  const url = `${MANGADEX_API}/manga/${id}?${sp.toString()}`;
  const res = await fetchWithRetry(url);
  if (!res.ok) return null;
  const json = await res.json();
  if (!json.data) return null;
  return transform(json.data);
}

export async function getDoujinshiTags(): Promise<string[]> {
  const url = `${MANGADEX_API}/manga/tag`;
  const res = await fetchWithRetry(url);
  if (!res.ok) return [];
  const json = await res.json();
  return (json.data || [])
    .map((tag: any) => Object.values(tag.attributes?.name || {})[0])
    .filter(Boolean)
    .sort();
}

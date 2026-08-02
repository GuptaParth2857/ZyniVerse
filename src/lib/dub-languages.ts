import { DUBBED_ANIME_STATIC } from "./data/dubbed-static";

const langMap = new Map<number, { hasHindi: boolean; hasTamil: boolean; hasTelugu: boolean }>();

for (const entry of DUBBED_ANIME_STATIC) {
  const existing = langMap.get(entry.mal_id);
  if (existing) {
    existing.hasHindi = existing.hasHindi || entry.hasHindi;
    existing.hasTamil = existing.hasTamil || entry.hasTamil;
    existing.hasTelugu = existing.hasTelugu || entry.hasTelugu;
  } else {
    langMap.set(entry.mal_id, {
      hasHindi: entry.hasHindi,
      hasTamil: entry.hasTamil,
      hasTelugu: entry.hasTelugu,
    });
  }
}

export function getDubLanguages(malId: number): { hasHindi: boolean; hasTamil: boolean; hasTelugu: boolean } | null {
  return langMap.get(malId) || null;
}

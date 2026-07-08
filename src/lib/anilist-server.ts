import { cacheLife } from 'next/cache';
import type { Media } from './anilist';

const ENDPOINT = "https://graphql.anilist.co";

async function gql(query: string, variables: Record<string, unknown> = {}) {
  'use cache'
  cacheLife('hours');

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    if (res.status === 429) throw new Error("Rate limited by AniList — try again later.");
    const body = await res.text().catch(() => "");
    throw new Error(`AniList request failed (${res.status}): ${body.slice(0, 200)}`);
  }
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || "AniList returned an error");
  return json.data;
}

const MEDIA_FIELDS = `
  id
  idMal
  title { romaji english native userPreferred }
  coverImage { extraLarge large medium color }
  bannerImage
  description(asHtml: false)
  type
  format
  status(version: 2)
  episodes
  duration
  chapters
  volumes
  countryOfOrigin
  isLicensed
  source(version: 2)
  genres
  averageScore
  meanScore
  popularity
  trending
  favourites
  tags { id name description category rank isGeneralSpoiler isMediaSpoiler isAdult }
  startDate { year month day }
  endDate { year month day }
  season
  seasonYear
  seasonInt
  studios(isMain: true) { nodes { id name isAnimationStudio } }
  trailer { id site thumbnail }
  siteUrl
  nextAiringEpisode { airingAt episode timeUntilAiring }
` as const;

export async function getTrending(perPage = 18) {
  const q = `query ($p: Int) { Page(page: 1, perPage: $p) { media(sort: TRENDING_DESC, type: ANIME, isAdult: false) { ${MEDIA_FIELDS} } } }`;
  const d = await gql(q, { p: perPage });
  return d.Page.media as Media[];
}

export async function getPopular(perPage = 18) {
  const q = `query ($p: Int) { Page(page: 1, perPage: $p) { media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) { ${MEDIA_FIELDS} } } }`;
  const d = await gql(q, { p: perPage });
  return d.Page.media as Media[];
}

export async function getUpcoming(perPage = 12) {
  const q = `query ($p: Int) { Page(page: 1, perPage: $p) { media(sort: POPULARITY_DESC, type: ANIME, status: NOT_YET_RELEASED, isAdult: false) { ${MEDIA_FIELDS} } } }`;
  const d = await gql(q, { p: perPage });
  return d.Page.media as Media[];
}

export async function getTopRated(perPage = 12) {
  const q = `query ($p: Int) { Page(page: 1, perPage: $p) { media(sort: SCORE_DESC, type: ANIME, isAdult: false) { ${MEDIA_FIELDS} } } }`;
  const d = await gql(q, { p: perPage });
  return d.Page.media as Media[];
}

export async function getAiringSchedule(fromSec: number, toSec: number) {
  const q = `
    query ($from: Int, $to: Int, $page: Int) {
      Page(page: $page, perPage: 50) {
        pageInfo { hasNextPage }
        airingSchedules(airingAt_greater: $from, airingAt_lesser: $to, sort: TIME) {
          id episode airingAt
          media {
            id title { romaji english } coverImage { large color } format genres episodes
          }
        }
      }
    }`;
  let page = 1, hasNext = true;
  const all: any[] = [];
  while (hasNext && page <= 6) {
    const data = await gql(q, { from: fromSec, to: toSec, page });
    all.push(...data.Page.airingSchedules);
    hasNext = data.Page.pageInfo.hasNextPage;
    page++;
  }
  return all;
}

export { bestTitle } from './anilist';

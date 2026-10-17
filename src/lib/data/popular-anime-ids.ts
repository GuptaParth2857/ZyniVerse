/**
 * Verified AniList media ids (the 50 most popular anime, isAdult: false) used as
 * a fallback by the sitemap only.
 *
 * Why this exists: `/watch/{id}` guides are some of the few unique,
 * India-specific pages on the site (streaming availability + Hindi/Tamil/Telugu
 * dub notes), and the sitemap submits them via `getPopular()`. When AniList is
 * rate-limiting or degraded while the sitemap is generated, that call throws and
 * all of those URLs disappear from the sitemap for the full 24h revalidate
 * window — which is exactly what happened to the live sitemap (0 `/watch/`
 * URLs). These ids are stable in AniList and never get recycled, so baking them
 * keeps the guides discoverable even when the API is unhappy.
 *
 * Refresh (optional, manual): run the POPULARITY_DESC query against
 * https://graphql.anilist.co with perPage: 50 (AniList silently caps perPage at
 * 50) and replace the array below.
 */
export const POPULAR_ANIME_FALLBACK_IDS: readonly number[] = [
  16498, 101922, 113415, 1535, 21459, 11061, 21087, 21, 20605, 20958,
  5114, 20, 11757, 20954, 21519, 99147, 21856, 110277, 127230, 101759,
  20755, 21507, 21355, 20665, 104578, 1735, 21234, 100166, 9253, 97940,
  20464, 101291, 140960, 101921, 105333, 101348, 21827, 124080, 4224, 19815,
  20613, 20447, 104276, 20789, 269, 21202, 112151, 1575, 99423, 20623,
];

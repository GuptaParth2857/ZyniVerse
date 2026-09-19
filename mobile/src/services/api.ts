import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Anime, DubStatus, FillerData, ScheduleItem, User } from '../types';

const WEB_HOST = 'https://zyverse.in';
const WEB_API = `${WEB_HOST}/api`;
const ANILIST_GQL = 'https://graphql.anilist.co';

const DEVICE_KEY = 'zt_ct_device';
const SESSION_COOKIE_KEY = 'zt_session_cookie';
let cachedDevice: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (cachedDevice) return cachedDevice;
  try {
    let d = await AsyncStorage.getItem(DEVICE_KEY);
    if (!d || !/^[A-Za-z0-9_-]{8,64}$/.test(d)) {
      d = `ztm${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
      await AsyncStorage.setItem(DEVICE_KEY, d);
    }
    cachedDevice = d;
    return d;
  } catch {
    return `ztm${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  }
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const msg =
      (body && (body.error || body.message)) || `API Error: ${res.status}`;
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

function normalizeAnime(raw: any): Anime {
  if (!raw) return raw;
  if (raw.idMal != null && raw.malId == null) raw.malId = raw.idMal;
  return raw as Anime;
}

const ANIME_DETAIL_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      idMal
      title { romaji english native }
      coverImage { extraLarge large medium color }
      bannerImage
      description(asHtml: false)
      type
      format
      status(version: 2)
      episodes
      duration
      countryOfOrigin
      source(version: 2)
      genres
      averageScore
      popularity
      favourites
      startDate { year month day }
      endDate { year month day }
      season
      seasonYear
      studios(isMain: true) { nodes { id name } }
      nextAiringEpisode { episode airingAt }
      streamingEpisodes { title url source }
    }
  }`;

async function animeById(id: number): Promise<Anime> {
  const res = await fetch(ANILIST_GQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query: ANIME_DETAIL_QUERY, variables: { id } }),
  });
  if (!res.ok) throw new Error(`Could not load anime (${res.status})`);
  const json = await res.json().catch(() => null);
  if (json?.errors?.length) throw new Error(json.errors[0].message || 'Anime not found');
  if (!json?.data?.Media) throw new Error('Anime not found');
  return normalizeAnime(json.data.Media);
}

async function listAnime(
  path: string,
  params: Record<string, string> = {}
): Promise<Anime[]> {
  const url = new URL(`${WEB_API}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const data = await fetchJson<any>(url.toString());
  const arr = Array.isArray(data) ? data : data?.media || data?.results || [];
  return (arr as any[]).map(normalizeAnime);
}

async function getFiller(id: number): Promise<FillerData> {
  const data = await fetchJson<any>(`${WEB_API}/filler/${id}`);
  const episodes = ((data?.episodes || []) as any[]).map((e) => {
    const rawType = String(e.type || '').toLowerCase();
    const type: FillerData['episodes'][number]['type'] =
      rawType === 'filler' ? 'filler' : rawType.includes('mixed') ? 'mixed' : 'canon';
    return { episode: e.episode, type, title: e.title };
  });
  const totalFillers = episodes.filter((e) => e.type === 'filler').length;
  const total = Number(data?.total) || episodes.length;
  return {
    animeId: id,
    title: data?.title || 'Unknown',
    totalEpisodes: total,
    totalFillers,
    fillerPercentage:
      data?.fillerPercent != null
        ? Number(data.fillerPercent)
        : total > 0
          ? Math.round((totalFillers / total) * 100)
          : 0,
    episodes,
  };
}

async function getDubStatus(malId: number): Promise<DubStatus> {
  const data = await fetchJson<any>(`${WEB_API}/anime-dub-status?malId=${malId}`);
  const details = data?.details || {};
  const available: string[] = (data?.available || []).map((l: string) =>
    String(l).toLowerCase()
  );
  return {
    malId,
    title: data?.title || '',
    hindi: { available: !!details.hasHindi || available.includes('hindi') },
    tamil: { available: !!details.hasTamil || available.includes('tamil') },
    telugu: { available: !!details.hasTelugu || available.includes('telugu') },
  } as DubStatus;
}

async function getSchedule(): Promise<ScheduleItem[]> {
  const now = Math.floor(Date.now() / 1000);
  const from = now - 6 * 3600;
  const to = now + 7 * 24 * 3600;
  const data = await fetchJson<any[]>(
    `${WEB_API}/anilist/airing-schedule?from=${from}&to=${to}`
  );
  if (!Array.isArray(data)) return [];
  return data.map((entry: any) => ({
    mediaId: entry?.media?.id,
    title:
      entry?.media?.title?.english ||
      entry?.media?.title?.romaji ||
      'Unknown',
    episode: entry?.episode,
    airingAt: entry?.airingAt ? new Date(entry.airingAt * 1000).toISOString() : '',
    timeUntilAiring: entry?.airingAt ? entry.airingAt - now : 0,
    media: normalizeAnime(entry?.media),
  })) as ScheduleItem[];
}

async function search(query: string, type: 'all' | 'anime' | 'manga'): Promise<Anime[]> {
  if (!query.trim()) return [];
  const data = await fetchJson<any>(
    `${WEB_API}/anilist/search?q=${encodeURIComponent(query.trim())}`
  );
  let results: any[] = data?.results || [];
  if (type === 'anime') results = results.filter((r) => r.type === 'ANIME');
  if (type === 'manga') results = results.filter((r) => r.type === 'MANGA');
  return results.map(normalizeAnime);
}

async function readCookie(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SESSION_COOKIE_KEY);
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookie = await readCookie();
  if (!cookie) return null;
  try {
    const res = await fetch(`${WEB_HOST}/api/auth/session`, {
      headers: { Cookie: cookie },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.user) return null;
    return {
      id: json.user.id || '',
      username: json.user.name || json.user.email || 'User',
      email: json.user.email || '',
      avatar: json.user.image || undefined,
    };
  } catch {
    return null;
  }
}

function readSetCookie(res: Response): string | null {
  try {
    const raw =
      (res.headers as any)?.get?.('set-cookie') ||
      (res.headers as any)?.map?.['set-cookie'];
    if (!raw) return null;
    return Array.isArray(raw) ? raw.join('; ') : raw;
  } catch {
    return null;
  }
}

async function login(email: string, password: string): Promise<User> {
  const csrfRes = await fetch(`${WEB_HOST}/api/auth/csrf`);
  const csrf = (await csrfRes.json().catch(() => ({ csrfToken: '' }))) as {
    csrfToken: string;
  };
  if (!csrf.csrfToken) throw new Error('Could not reach ZyniVerse login');
  const csrfCookie = readSetCookie(csrfRes);

  const res = await fetch(`${WEB_HOST}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(csrfCookie ? { Cookie: csrfCookie } : {}),
    },
    body: new URLSearchParams({
      csrfToken: csrf.csrfToken,
      email,
      password,
      json: 'true',
    }).toString(),
  });
  if (!res.ok) throw new Error('Invalid email or password');
  const sessionCookie = readSetCookie(res);
  if (sessionCookie) {
    await SecureStore.setItemAsync(SESSION_COOKIE_KEY, sessionCookie).catch(
      () => {}
    );
  }
  const user = await getCurrentUser();
  return (
    user || { id: '', username: email.split('@')[0], email, avatar: undefined }
  );
}

async function register(
  email: string,
  username: string,
  password: string
): Promise<User> {
  await fetchJson(`${WEB_API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'register', email, username, password }),
  });
  return login(email, password);
}

async function logout(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SESSION_COOKIE_KEY);
  } catch {
    /* ignore */
  }
}

export const api = {
  get: <T>(endpoint: string, options?: { params?: Record<string, string> }) => {
    const url = new URL(`${WEB_API}${endpoint}`);
    if (options?.params) {
      Object.entries(options.params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    return fetchJson<T>(url.toString());
  },
  trending: { get: () => listAnime('/anilist/trending', { perPage: '12' }) },
  anime: { get: animeById, list: listAnime },
  filler: { get: getFiller },
  dubStatus: { get: getDubStatus },
  schedule: { get: getSchedule },
  search,
  auth: { login, register, logout, current: getCurrentUser },
  tournaments: {
    list: async () => {
      const data = await fetchJson<any>(`${WEB_API}/character-tournaments`);
      return (Array.isArray(data) ? data : data?.tournaments || data?.data || []) as import('../types').CharacterTournament[];
    },
    detail: async (id: string) => {
      const data = await fetchJson<any>(`${WEB_API}/character-tournaments/${id}`);
      return (data?.data || data) as import('../types').CharacterTournamentDetail;
    },
    pollVoteGet: async (id: string): Promise<{ myPollVote: string | null }> => {
      const res = await fetch(`${WEB_API}/character-tournaments/${id}/poll-vote`, {
        headers: { 'X-Device-Id': await getDeviceId() },
      });
      if (!res.ok) return { myPollVote: null };
      return res.json();
    },
    pollVoteCast: async (id: string, participantId: string) => {
      const res = await fetch(`${WEB_API}/character-tournaments/${id}/poll-vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': await getDeviceId(),
        },
        body: JSON.stringify({ participantId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error((data && data.error) || `API Error: ${res.status}`);
      }
      return res.json();
    },
  },
};

import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://zyverse.in/api/v1';
const TOURNAMENT_API = 'https://zyverse.in/api';
const DEVICE_KEY = 'zt_ct_device';
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

export const api = {
  async get<T>(endpoint: string, options?: {
    params?: Record<string, string>;
    apiKey?: string;
  }): Promise<T> {
    const url = new URL(`${BASE_URL}${endpoint}`);
    if (options?.params) {
      Object.entries(options.params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (options?.apiKey) headers['Authorization'] = `Bearer ${options.apiKey}`;

    const res = await fetch(url.toString(), { headers });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  },

  async post<T>(endpoint: string, data?: any, apiKey?: string): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  },

  filler: {
    get: (id: number) => api.get<import('../types').FillerData>(`/filler/${id}`),
  },
  schedule: {
    get: (timeRange?: string) => api.get<import('../types').ScheduleItem[]>('/schedule', { params: timeRange ? { timeRange } : {} }),
  },
  anime: {
    get: (id: number) => api.get<import('../types').Anime>(`/anime/${id}`),
  },
  dubStatus: {
    get: (malId: number) => api.get<import('../types').DubStatus>(`/dub-status/${malId}`),
  },
  trending: {
    get: () => api.get<import('../types').Anime[]>('/trending'),
  },
  tournaments: {
    list: async () => {
      const res = await fetch(`${TOURNAMENT_API}/character-tournaments`);
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      return res.json() as Promise<import('../types').CharacterTournament[]>;
    },
    detail: async (id: string) => {
      const res = await fetch(`${TOURNAMENT_API}/character-tournaments/${id}`);
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      return res.json() as Promise<import('../types').CharacterTournamentDetail>;
    },
    pollVoteGet: async (id: string): Promise<{ myPollVote: string | null }> => {
      const res = await fetch(`${TOURNAMENT_API}/character-tournaments/${id}/poll-vote`, {
        headers: { 'X-Device-Id': await getDeviceId() },
      });
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      return res.json();
    },
    pollVoteCast: async (id: string, participantId: string) => {
      const res = await fetch(`${TOURNAMENT_API}/character-tournaments/${id}/poll-vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Device-Id': await getDeviceId() },
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

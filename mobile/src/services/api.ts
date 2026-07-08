const BASE_URL = 'https://zyniverse.app/api/v1';

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
};

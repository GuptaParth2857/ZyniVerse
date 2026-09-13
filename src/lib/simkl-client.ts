const SIMKL_API = "https://api.simkl.com";
const SIMKL_AUTH = "https://api.simkl.com/oauth/authorize";

export const SIMKL_CLIENT_ID = process.env.SIMKL_CLIENT_ID || "";
export const SIMKL_CLIENT_SECRET = process.env.SIMKL_CLIENT_SECRET || "";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

export function simklConfigured(): boolean {
  if (!SIMKL_CLIENT_ID || !SIMKL_CLIENT_SECRET) return false;
  const hasPlaceholder = SIMKL_CLIENT_ID.includes("your_") || SIMKL_CLIENT_SECRET.includes("your_");
  const looksReal = SIMKL_CLIENT_ID.length > 12 && SIMKL_CLIENT_SECRET.length > 12;
  return !hasPlaceholder && looksReal;
}

export function simklAuthUrl(): string {
  const redirectUri = encodeURIComponent(`${BASE_URL}/api/auth/simkl/callback`);
  const params = new URLSearchParams({
    client_id: SIMKL_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
  });
  return `${SIMKL_AUTH}?${params.toString()}`;
}

export async function simklExchangeCode(code: string): Promise<{ access_token: string; expires_in?: number }> {
  const redirectUri = `${BASE_URL}/api/auth/simkl/callback`;
  const res = await fetch(`${SIMKL_API}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "zyniverse/1.0" },
    body: JSON.stringify({
      code,
      client_id: SIMKL_CLIENT_ID,
      client_secret: SIMKL_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    throw new Error(`Simkl token exchange failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export type SimklAnimeItem = {
  ids?: Record<string, number | string>;
  title?: string;
  en_title?: string;
  year?: number;
  poster?: string;
  status?: "watching" | "completed" | "plantowatch" | "onhold" | "dropped" | string;
  last_watched?: string;
  total_episodes?: number;
  watched_episodes?: { episode: number; watched_at?: string }[];
  last_watched_episode?: number;
  user_rating?: number;
  rating?: number;
};

export async function simklFetchAllAnime(accessToken: string): Promise<{ items: SimklAnimeItem[]; activities?: Record<string, string> }> {
  const base = `${SIMKL_API}/sync/all-items/anime`;
  const params = new URLSearchParams({
    client_id: SIMKL_CLIENT_ID,
    "app-name": "zyniverse",
    "app-version": "1.0",
    extended: "full",
    episode_watched_at: "yes",
    include_all_episodes: "yes",
  });

  const res = await fetch(`${base}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "simkl-api-key": SIMKL_CLIENT_ID,
      "User-Agent": "zyniverse/1.0",
    },
  });

  if (!res.ok) {
    throw new Error(`Simkl all-items fetch failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const items = Array.isArray(data) ? data : data?.shows ?? data?.anime ?? [];

  let activities: Record<string, string> | undefined;
  try {
    const actRes = await fetch(`${SIMKL_API}/sync/activities?${new URLSearchParams({ client_id: SIMKL_CLIENT_ID, "app-name": "zyniverse", "app-version": "1.0" }).toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "simkl-api-key": SIMKL_CLIENT_ID,
        "User-Agent": "zyniverse/1.0",
      },
    });
    if (actRes.ok) activities = await actRes.json();
  } catch {
    void 0;
  }

  return { items, activities };
}

const SIMKL_STATUS_MAP: Record<string, string> = {
  watching: "CURRENT",
  completed: "COMPLETED",
  plantowatch: "PLANNING",
  onhold: "PAUSED",
  dropped: "DROPPED",
};

export function toZyniverseStatus(simklStatus?: string): string {
  return SIMKL_STATUS_MAP[simklStatus || ""] || "PLANNING";
}
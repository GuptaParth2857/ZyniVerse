const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://zyverse.in";

// Must match public/{INDEXNOW_KEY}.txt hosted at the site root.
const DEFAULT_INDEXNOW_KEY = "6a230f49727cb3f00bd4c70e84195553";

export function getIndexNowKey(): string {
  return process.env.INDEXNOW_KEY || DEFAULT_INDEXNOW_KEY;
}

// Fire-and-forget best-effort submission. Never throws, never blocks a route response.
export async function submitToIndexNow(paths: string | string[]): Promise<void> {
  try {
    const key = getIndexNowKey();
    if (!key) return;

    const urlList = (Array.isArray(paths) ? paths : [paths])
      .filter(Boolean)
      .map((p) => (p.startsWith("http") ? p : `${BASE_URL}${p.startsWith("/") ? p : `/${p}`}`));
    if (urlList.length === 0) return;

    const payload = {
      host: new URL(BASE_URL).host,
      key,
      keyLocation: `${BASE_URL}/${key}.txt`,
      urlList,
    };

    await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(7000),
    });
  } catch {
    // indexnow is best-effort; never fail the calling request
  }
}
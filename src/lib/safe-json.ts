/**
 * Client-side fetch helpers that survive non-2xx API responses.
 *
 * Most ZyniVerse listing pages load their data client side, and the common
 * pattern was:
 *
 *     fetch(url).then((r) => r.json()).then((d) => setList(d))
 *
 * `r.ok` is never checked, so when an upstream (usually AniList) was
 * unavailable the routes returned a 5xx with a body like `{"error":"..."}`.
 * The page stored that object where an array was expected, and the next render
 * threw on `[...list]` / `list.length`. Because the throw happened during
 * render it could not be caught by the promise chain, so the user got a blank
 * page with no message and no retry — exactly the "AniList is down" look.
 *
 * `fetchJson` turns HTTP failures into a readable Error; `fetchList` guarantees
 * an array. Prefer them over bare `fetch(...).json()` when the result is
 * rendered as a list.
 */

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Keys used by the paginated AniList-backed endpoints. */
const LIST_KEYS = ["media", "results", "characters", "data", "items"] as const;

function errorMessageFrom(body: unknown, status: number): string {
  if (body && typeof body === "object" && "error" in body) {
    const detail = (body as { error: unknown }).error;
    if (typeof detail === "string" && detail.trim()) return detail;
  }
  if (status === 429) return "Too many requests — please wait a moment and try again.";
  if (status >= 500) return "The server could not reach its data source. Please try again shortly.";
  return `Request failed (${status}).`;
}

/**
 * Fetch JSON, throwing a readable ApiError on any non-2xx response.
 * Never throws on a malformed body — a 2xx with unparseable JSON yields null.
 */
export async function fetchJson<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // Non-JSON body (HTML error page, empty response). Leave body as null.
  }

  if (!res.ok) throw new ApiError(errorMessageFrom(body, res.status), res.status);

  return body as T;
}

/**
 * Fetch a list, always resolving to an array.
 *
 * Accepts a bare array or any of the paginated envelope shapes the API returns
 * (`{ media: [...] }`, `{ results: [...] }`, ...). On a non-2xx response it
 * throws, matching `fetchJson`, so callers can still show an error.
 */
export async function fetchList<T>(url: string, init?: RequestInit): Promise<T[]> {
  const data = await fetchJson<unknown>(url, init);

  if (Array.isArray(data)) return data as T[];

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of LIST_KEYS) {
      const value = record[key];
      if (Array.isArray(value)) return value as T[];
    }
  }

  return [];
}

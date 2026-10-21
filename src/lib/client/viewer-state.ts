"use client";

/**
 * Client helper for the viewer-specific state of the UGC routes.
 *
 * The public routes (`/api/memes`, `/api/polls`, `/api/reviews/long`, ...) are
 * served from the Vercel CDN, so their payload is identical for every visitor
 * and can no longer carry "have I voted / liked this?". That state now comes
 * from `/api/viewer-state`, which is small, visitor specific and cached by the
 * browser for a minute.
 *
 * The request is only worth making for a signed in visitor, so every call site
 * checks `useSession().status === "authenticated"` first — an anonymous
 * visitor would otherwise pay an extra invocation and save nothing.
 */
export type ViewerStateMap = Record<string, unknown>;

/** Fetches the visitor's own state for the given ids. Never throws. */
export async function fetchViewerState(type: string, ids: string[]): Promise<ViewerStateMap> {
  if (!ids.length) return {};
  try {
    const res = await fetch(
      `/api/viewer-state?type=${encodeURIComponent(type)}&ids=${ids.join(",")}`,
    );
    if (!res.ok) return {};
    const data = await res.json();
    return (data?.states ?? {}) as ViewerStateMap;
  } catch {
    return {};
  }
}

/**
 * Writes the visitor's own vote back onto a list of items. Used for the routes
 * whose items carry a `userVote` field (memes, polls, long reviews).
 */
export function applyUserVotes<T extends { id: string }>(
  items: T[],
  states: ViewerStateMap,
  key = "userVote",
): T[] {
  for (const item of items) {
    const value = states[item.id];
    if (value !== undefined) {
      (item as unknown as Record<string, unknown>)[key] = value;
    }
  }
  return items;
}

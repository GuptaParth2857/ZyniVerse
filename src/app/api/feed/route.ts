import { NextRequest, NextResponse } from "next/server";
import { getUnifiedFeed, type FeedMode } from "@/lib/feed";
import { auth } from "@/lib/auth";

// Personalized ranking (follows + engagement) means every request can
// legitimately differ, so the route is dynamic by design.
export const dynamic = "force-dynamic";

// Pagination is OFFSET-based on one deterministic ranked+interleaved list.
// Time-based cursors don't work for a score-sorted feed: the page-1 winners
// still rank at the top of any older-than-cursor corpus, so they'd reappear.
const CAP = 760;
const DEFAULT_LIMIT = 20;
const MIN_LIMIT = 6;
const MAX_LIMIT = 40;
const DEFAULT_PER_PAGE = 12;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode: FeedMode = searchParams.get("mode") === "following" ? "following" : "foryou";
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(MIN_LIMIT, parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT),
  );

  // Legacy pagination (used by DiscoverFeed on /discover).
  const isLegacy = searchParams.has("page");
  const page = isLegacy ? Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1) : 1;
  const perPage = isLegacy
    ? Math.min(
        24,
        Math.max(MIN_LIMIT, parseInt(searchParams.get("perPage") || String(DEFAULT_PER_PAGE), 10) || DEFAULT_PER_PAGE),
      )
    : DEFAULT_PER_PAGE;

  // Offset-based pagination for the /feed client.
  const after = isLegacy ? 0 : Math.max(0, Math.min(CAP, Math.trunc(parseInt(searchParams.get("after") || "0", 10) || 0)));

  let userId: string | undefined;
  try {
    const session = await auth();
    userId = session?.user?.id;
  } catch {
    // Anonymous visitors get the global ranked feed — still useful, just unpersonalized.
  }

  let served: Awaited<ReturnType<typeof getUnifiedFeed>>["items"] = [];
  let hasNextPage = false;
  let nextOffset: number | null = null;

  if (isLegacy) {
    // Fetch one extra item so `hasNextPage` knows whether something sits beyond
    // this page's slice (offset pagination can't tell otherwise).
    const { items } = await getUnifiedFeed({ userId, mode, limit: Math.min(CAP, page * perPage + 1) });
    served = items.slice((page - 1) * perPage, page * perPage);
    hasNextPage = items.length > page * perPage;
  } else {
    const requested = Math.min(CAP, after + limit + 1);
    const { items } = await getUnifiedFeed({ userId, mode, limit: requested });
    served = items.slice(after, after + limit);
    hasNextPage = items.length > after + limit;
    nextOffset = hasNextPage ? after + limit : null;
  }

  return NextResponse.json(
    {
      items: served,
      nextCursor: nextOffset,
      hasNextPage,
      mode,
      page: isLegacy ? page : undefined,
      perPage: isLegacy ? perPage : undefined,
      perRequestLimit: isLegacy ? undefined : limit,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
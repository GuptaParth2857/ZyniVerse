import { prisma } from "./prisma";
import { dedupedFetch } from "./wiki-cache";

/**
 * Homepage numbers and community rails.
 *
 * The homepage is rendered per request (`force-dynamic`, see `src/app/page.tsx`),
 * and each of these reads is a separate round-trip to the remote Supabase
 * pooler (ap-northeast-1). A full `COUNT(*)` over the user table alone costs
 * seconds there, so every single visit re-paid for all of them.
 *
 * None of these values need to be second-fresh — the hero user count, the
 * "latest posters" rail and the featured tournament card are all fine a minute
 * behind — so they are cached in-process for {@link TTL_MS}. `dedupedFetch`
 * also single-flights concurrent renders, so a burst of traffic causes one set
 * of queries instead of one set per visitor.
 */
const TTL_MS = 60_000;

export function getHomeUserCount(): Promise<number> {
  return dedupedFetch("home:user-count", () => prisma.user.count(), TTL_MS);
}

export function getHomeLatestPosters() {
  return dedupedFetch(
    "home:latest-posters",
    () =>
      prisma.post.findMany({
        where: { image: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, title: true, image: true, type: true },
      }),
    TTL_MS,
  );
}

export function getHomeFeaturedTournament() {
  return dedupedFetch(
    "home:featured-tournament",
    () =>
      prisma.characterTournament.findFirst({
        where: { status: { in: ["qualifying", "active"] } },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          size: true,
          mode: true,
          status: true,
          currentRound: true,
          qualifyingEndsAt: true,
          roundEndsAt: true,
          creator: { select: { username: true } },
          _count: { select: { participants: true } },
        },
      }),
    TTL_MS,
  );
}

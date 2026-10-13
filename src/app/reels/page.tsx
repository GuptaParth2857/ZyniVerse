import ReelsClient from "./client";
import { getReelsFeed, type ReelsFeedPayload } from "@/lib/reels-feed";
import { auth } from "@/lib/auth";

interface PageProps {
  searchParams: Promise<{ username?: string; reel?: string }>;
}

/**
 * Server entry for /reels. Fetches page 1 server-side (cached + single-flight
 * via `getReelsFeed`) so the first paint is instant instead of waiting on a
 * slow remote-DB API round-trip. The client hydrates from `initial.reels` and
 * only fetches again on scroll/sort/filter changes.
 */
export default async function ReelsPage({ searchParams }: PageProps) {
  const { username } = await searchParams;

  let initial: ReelsFeedPayload | null = null;
  try {
    const session = await auth();
    initial = await getReelsFeed({
      page: 1,
      limit: 10,
      sort: "newest",
      username: username ?? null,
      viewerId: session?.user?.id ?? null,
    });
  } catch {
    // Fall back to the client-side fetch path; the feed shows its loader.
    initial = null;
  }

  return <ReelsClient initial={initial} />;
}

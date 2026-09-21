import { getDubFeeds } from "@/lib/dub-feeds";

export const dynamic = "force-dynamic";

export async function GET() {
  const feed = await getDubFeeds();
  return Response.json(feed, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
import { NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { computeTheatricalStats, THEATRICAL_STATS } from "@/lib/theatrical-releases";
import { getTheatricalEntries } from "@/lib/editorial";
export const dynamic = "force-dynamic";

async function GET_inner(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as "released" | "upcoming" | "all" | null;
  const year = searchParams.get("year");
  const search = searchParams.get("search");

  const { entries, lastUpdated } = await getTheatricalEntries();

  let filtered = [...entries];

  if (status === "released") {
    filtered = filtered.filter((r) => r.status === "released");
  } else if (status === "upcoming") {
    filtered = filtered.filter((r) => r.status === "upcoming");
  }

  if (year && year !== "All") {
    filtered = filtered.filter((r) => r.releaseYear === parseInt(year));
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.displayTitle.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    releases: filtered,
    stats: { ...computeTheatricalStats(entries), lastUpdated: lastUpdated ?? THEATRICAL_STATS.lastUpdated },
    total: filtered.length,
  });
}


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}

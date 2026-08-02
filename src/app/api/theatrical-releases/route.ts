import { NextResponse } from "next/server";
import { THEATRICAL_RELEASES, THEATRICAL_STATS } from "@/lib/theatrical-releases";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as "released" | "upcoming" | "all" | null;
  const year = searchParams.get("year");
  const search = searchParams.get("search");

  let filtered = [...THEATRICAL_RELEASES];

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
    stats: THEATRICAL_STATS,
    total: filtered.length,
  });
}

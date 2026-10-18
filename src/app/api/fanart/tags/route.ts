import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Distinct tags across all fan art, for autocomplete in the upload form.
export async function GET() {
  const arts = await prisma.fanArt.findMany({
    select: { tags: true },
    where: { tags: { not: "" } },
  });

  const tagSet = new Set<string>();
  for (const a of arts) {
    if (a.tags) {
      a.tags.split(",").forEach((t) => {
        const trimmed = t.trim();
        if (trimmed) tagSet.add(trimmed);
      });
    }
  }

  return NextResponse.json(
    { tags: Array.from(tagSet).sort() },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
  );
}

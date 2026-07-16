import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cosplays = await prisma.cosplay.findMany({
    select: { tags: true },
    where: { tags: { not: "" } },
  });

  const tagSet = new Set<string>();
  for (const c of cosplays) {
    if (c.tags) {
      c.tags.split(",").forEach((t) => {
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

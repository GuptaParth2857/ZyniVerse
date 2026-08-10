import { NextRequest, NextResponse } from "next/server";
import { getToonsWithImages } from "@/lib/toons-images";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  const toons = await getToonsWithImages();

  if (slug) {
    const toon = toons.find((t) => t.id === slug);
    if (!toon) return NextResponse.json({ error: "Toon not found" }, { status: 404 });
    return NextResponse.json({ toon });
  }

  const response = NextResponse.json({ toons });
  response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  return response;
}

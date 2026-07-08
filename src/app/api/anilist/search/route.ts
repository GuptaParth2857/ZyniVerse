import { searchAll } from "@/lib/anilist";
import { anilistLimiter } from "@/lib/rate-limiter";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const rateCheck = anilistLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q?.trim()) return Response.json({ results: [] });

  try {
    const data = await searchAll(q.trim());
    const results = [...data.anime, ...data.manga].slice(0, 20);
    return Response.json({ results });
  } catch {
    return Response.json({ results: [] });
  }
}

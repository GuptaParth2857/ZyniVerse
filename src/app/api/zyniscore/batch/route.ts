import { NextRequest, NextResponse } from "next/server";
import { getBatchZyniScores } from "@/lib/zyniscore";

export async function POST(req: NextRequest) {
  const { mediaIds } = await req.json();
  if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
    return NextResponse.json({ error: "mediaIds array required" }, { status: 400 });
  }

  const scores = await getBatchZyniScores(mediaIds.map(Number));
  const result: Record<number, unknown> = {};
  scores.forEach((v, k) => { result[k] = v; });
  return NextResponse.json(result);
}

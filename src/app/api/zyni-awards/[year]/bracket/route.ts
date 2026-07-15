import { NextRequest, NextResponse } from "next/server";
import { getBracketData } from "@/lib/zyni-awards";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  const { year: yearStr } = await params;
  const year = Number(yearStr);
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const round = Number(searchParams.get("round")) || 1;

  if (!category) {
    return NextResponse.json({ error: "category query param required" }, { status: 400 });
  }

  const bracket = await getBracketData(year, category, round);
  return NextResponse.json({ bracket, round });
}

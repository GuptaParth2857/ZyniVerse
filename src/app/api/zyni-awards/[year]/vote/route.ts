import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { castVote } from "@/lib/zyni-awards";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { year: yearStr } = await params;
  const year = Number(yearStr);
  const { category, nomineeId, round, bracketMatch } = await req.json();

  if (!category || !nomineeId) {
    return NextResponse.json({ error: "category and nomineeId required" }, { status: 400 });
  }

  try {
    await castVote(year, category, nomineeId, session.user.id, round || 2, bracketMatch);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

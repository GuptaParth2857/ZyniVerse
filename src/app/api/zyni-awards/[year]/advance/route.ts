import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { advanceNominees } from "@/lib/zyni-awards";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.email !== "gupta.parth2857@gmail.com") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);
  if (isNaN(year)) return NextResponse.json({ error: "Invalid year" }, { status: 400 });

  const { category, fromRound, winnerIds } = await req.json();
  if (!category || !fromRound || !Array.isArray(winnerIds)) {
    return NextResponse.json({ error: "category, fromRound, winnerIds required" }, { status: 400 });
  }

  try {
    await advanceNominees(year, category, fromRound, winnerIds);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to advance";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

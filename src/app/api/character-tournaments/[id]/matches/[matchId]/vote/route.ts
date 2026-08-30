import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { apiLimiter } from "@/lib/rate-limiter";
import { castTournamentVote } from "@/lib/character-tournaments";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; matchId: string }> }) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const choice = body?.choice;
  if (choice !== "A" && choice !== "B") {
    return NextResponse.json({ error: "Invalid choice" }, { status: 400 });
  }

  const { matchId } = await params;

  try {
    const updated = await castTournamentVote(matchId, session.user.id, choice);
    return NextResponse.json({ success: true, ...updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to cast vote";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

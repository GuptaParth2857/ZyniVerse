import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";
import { castTournamentVote } from "@/lib/character-tournaments";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session-user";

const DEVICE_ID_RE = /^[a-zA-Z0-9_-]{8,64}$/;

function readDeviceId(req: NextRequest): string | null {
  const raw = req.headers.get("x-device-id");
  if (!raw || !DEVICE_ID_RE.test(raw)) return null;
  return raw;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; matchId: string }> }) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  // Voting is open to guests, matching the qualifying poll. getSessionUserId
  // skips the auth() call entirely when there is no session cookie.
  const userId = await getSessionUserId(req.headers);
  const deviceId = readDeviceId(req);
  if (!userId && !deviceId) {
    return NextResponse.json({ error: "Vote requires a device" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const choice = body?.choice;
  if (choice !== "A" && choice !== "B") {
    return NextResponse.json({ error: "Invalid choice" }, { status: 400 });
  }

  const { id, matchId } = await params;

  // Scope the match to this tournament so a matchId from another tournament
  // cannot be voted through this route.
  const match = await prisma.characterTournamentMatch.findFirst({
    where: { id: matchId, tournamentId: id },
    select: { id: true },
  });
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  try {
    const updated = await castTournamentVote(matchId, { userId, deviceId }, choice);
    return NextResponse.json({ success: true, votesA: updated.votesA, votesB: updated.votesB });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to cast vote";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

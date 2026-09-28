import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTournamentRounds } from "@/lib/character-tournaments";

const DEVICE_ID_RE = /^[a-zA-Z0-9_-]{8,64}$/;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;

  const hasSessionCookie =
    req.cookies.has("authjs.session-token") || req.cookies.has("__Secure-authjs.session-token");

  // auth() hits the database on every call (the session callback looks the user
  // up), so it is skipped entirely when there is no session cookie. Anonymous
  // page views are the overwhelming majority of this route's traffic.
  const userId = hasSessionCookie ? ((await auth())?.user?.id ?? null) : null;

  const rawDeviceId = req.headers.get("x-device-id");
  const deviceId = rawDeviceId && DEVICE_ID_RE.test(rawDeviceId) ? rawDeviceId : null;

  // The response body carries per-voter state (myVotes / myPollVote), so it must
  // never be stored in a shared CDN cache. Only a request with neither a session
  // nor a device id — i.e. crawlers and plain page views, which are the bulk of
  // the traffic this cache exists for — gets the public cache header.
  const personalized = !!userId || !!deviceId;
  const headers: Record<string, string> = {};
  if (!personalized) {
    headers["Cache-Control"] = "public, s-maxage=60, stale-while-revalidate=300";
  } else {
    headers["Cache-Control"] = "private, no-store";
  }

  const view = await getTournamentRounds(id);
  if (!view) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });

  const myVotes: Record<string, "A" | "B"> = {};
  let myPollVote: string | null = null;

  if (userId) {
    const [votes, pollVote] = await Promise.all([
      prisma.characterTournamentVote.findMany({
        where: { userId, match: { tournamentId: id } },
        select: { matchId: true, choice: true },
      }),
      prisma.characterTournamentPollVote.findUnique({
        where: { tournamentId_userId: { tournamentId: id, userId } },
        select: { participantId: true },
      }),
    ]);
    for (const v of votes) myVotes[v.matchId] = v.choice as "A" | "B";
    myPollVote = pollVote?.participantId ?? null;
  } else if (deviceId) {
    const [votes, pollVote] = await Promise.all([
      prisma.characterTournamentVote.findMany({
        where: { deviceId, match: { tournamentId: id } },
        select: { matchId: true, choice: true },
      }),
      prisma.characterTournamentPollVote.findFirst({
        where: { tournamentId: id, deviceId },
        select: { participantId: true },
      }),
    ]);
    for (const v of votes) myVotes[v.matchId] = v.choice as "A" | "B";
    myPollVote = pollVote?.participantId ?? null;
  }

  return NextResponse.json(
    {
      ...view,
      myVotes,
      myPollVote,
      isCreator: !!userId && userId === view.tournament.creatorId,
    },
    { headers }
  );
}

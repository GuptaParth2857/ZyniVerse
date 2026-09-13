import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { apiLimiter } from "@/lib/rate-limiter";
import { castPollVote } from "@/lib/character-tournaments";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const participantId = typeof body?.participantId === "string" ? body.participantId : "";
  if (!participantId) return NextResponse.json({ error: "participantId is required" }, { status: 400 });

  try {
    const participant = await castPollVote(id, session.user.id, participantId);
    return NextResponse.json({
      ok: true,
      participant: { id: participant.id, pollVotes: participant.pollVotes },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to vote" },
      { status: 400 }
    );
  }
}
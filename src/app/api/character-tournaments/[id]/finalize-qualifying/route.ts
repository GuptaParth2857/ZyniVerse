import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limiter";
import { finalizeQualifying } from "@/lib/character-tournaments";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rateCheck = await apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = (await params).id;

  const tournament = await prisma.characterTournament.findUnique({ where: { id } });
  if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  if (tournament.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (tournament.status !== "qualifying" || tournament.mode !== "qualifying") {
    return NextResponse.json({ error: "Qualifying is not open" }, { status: 400 });
  }

  try {
    const result = await finalizeQualifying(id);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to finalize qualifying" },
      { status: 400 }
    );
  }
}
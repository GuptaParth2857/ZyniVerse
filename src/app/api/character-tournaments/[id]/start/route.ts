import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limiter";
import { startTournament } from "@/lib/character-tournaments";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = (await params).id;

  const tournament = await prisma.characterTournament.findUnique({ where: { id } });
  if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  if (tournament.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (tournament.status !== "upcoming") {
    return NextResponse.json({ error: "Tournament is not in upcoming state" }, { status: 400 });
  }

  const updated = await startTournament(id);
  return NextResponse.json(updated);
}

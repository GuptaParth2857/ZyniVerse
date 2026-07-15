import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { eventId } = await params;
  const { status } = await req.json();
  if (!["going", "maybe", "cant_go"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const rsvp = await prisma.clubEventRSVP.upsert({
    where: { eventId_userId: { eventId, userId: session.user.id } },
    update: { status },
    create: { eventId, userId: session.user.id, status },
  });

  return NextResponse.json({ rsvp });
}

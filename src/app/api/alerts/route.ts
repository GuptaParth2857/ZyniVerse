import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { createAiringAlert, getAiringAlerts } from "@/lib/notifications";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const alerts = await getAiringAlerts(session.user.id);
  return NextResponse.json({ alerts });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mediaId, episode, airingAt } = await req.json();
  if (!mediaId || !episode || !airingAt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await createAiringAlert(session.user.id, mediaId, episode, new Date(airingAt));
  const alert = await prisma.airingAlert.findUnique({
    where: { userId_mediaId_episode: { userId: session.user.id, mediaId, episode } },
  });

  return NextResponse.json({ alert });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mediaId, episode } = await req.json();
  if (!mediaId || episode == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await prisma.airingAlert.deleteMany({
    where: { userId: session.user.id, mediaId, episode },
  });

  return NextResponse.json({ success: true });
}

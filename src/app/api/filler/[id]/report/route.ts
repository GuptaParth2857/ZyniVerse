import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to report" }, { status: 401 });
  }

  const { id } = await params;
  const mediaId = Number(id);
  if (isNaN(mediaId)) {
    return NextResponse.json({ error: "Invalid media ID" }, { status: 400 });
  }

  const body = await req.json();
  const episode = Number(body.episode);
  if (isNaN(episode)) {
    return NextResponse.json({ error: "Invalid episode number" }, { status: 400 });
  }

  const reason = body.reason || null;
  const note = body.note || null;

  if (reason && !["wrong-type", "wrong-order", "spoiler", "other"].includes(reason)) {
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
  }

  try {
    const report = await prisma.fillerReport.upsert({
      where: {
        userId_mediaId_episode: {
          userId: session.user.id,
          mediaId,
          episode,
        },
      },
      update: { reason, note },
      create: {
        mediaId,
        episode,
        userId: session.user.id,
        reason,
        note,
      },
    });

    return NextResponse.json({ success: true, report: { id: report.id, reason: report.reason, note: report.note, createdAt: report.createdAt } });
  } catch (err) {
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}

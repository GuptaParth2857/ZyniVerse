import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getParty, updateEpisode, startParty, endParty,
  sendPartyMessage, setVideoSource, updatePlaybackState,
} from "@/lib/watch-party";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const party = await getParty(id);
  if (!party) {
    return NextResponse.json({ error: "Party not found" }, { status: 404 });
  }
  return NextResponse.json({ party });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    if (body.episode != null) {
      await updateEpisode(id, body.episode, session.user.id);
    }
    if (body.action === "start") {
      await startParty(id, session.user.id);
    }
    if (body.action === "end") {
      await endParty(id, session.user.id);
    }
    if (body.message) {
      await sendPartyMessage(id, session.user.id, body.message);
    }
    if (body.videoUrl) {
      await setVideoSource(id, body.videoUrl, body.videoType || "external", session.user.id);
    }
    if (body.isPlaying != null && body.playbackPos != null) {
      await updatePlaybackState(id, body.isPlaying, body.playbackPos, session.user.id);
    }

    const party = await getParty(id);
    return NextResponse.json({ party });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await endParty(id, session.user.id);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

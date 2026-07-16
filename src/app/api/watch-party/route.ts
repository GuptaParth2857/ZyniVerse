import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createParty, getActiveParties, getUserParties } from "@/lib/watch-party";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { mediaId, mediaTitle, mediaImage, coverImage } = await req.json();
  if (!mediaId || !mediaTitle) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const party = await createParty(session.user.id, mediaId, mediaTitle, mediaImage, coverImage);
    return NextResponse.json({ party });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create party";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mine = searchParams.get("mine");

  if (mine) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const parties = await getUserParties(session.user.id);
    return NextResponse.json({ parties });
  }

  const parties = await getActiveParties();
  return NextResponse.json({ parties });
}

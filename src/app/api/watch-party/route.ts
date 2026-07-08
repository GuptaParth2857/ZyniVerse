import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createParty, getActiveParties, getUserParties } from "@/lib/watch-party";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { mediaId, mediaTitle, mediaImage } = await req.json();
  if (!mediaId || !mediaTitle) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const party = await createParty(session.user.id, mediaId, mediaTitle, mediaImage);
    return NextResponse.json({ party });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
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

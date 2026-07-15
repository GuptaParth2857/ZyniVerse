import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getZyniScore, submitRating } from "@/lib/zyniscore";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  const { mediaId: mediaIdStr } = await params;
  const mediaId = Number(mediaIdStr);
  if (!mediaId) return NextResponse.json({ error: "Invalid mediaId" }, { status: 400 });

  const score = await getZyniScore(mediaId);
  return NextResponse.json(score);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mediaId: mediaIdStr } = await params;
  const mediaId = Number(mediaIdStr);
  if (!mediaId) return NextResponse.json({ error: "Invalid mediaId" }, { status: 400 });

  const { rating } = await req.json();
  if (rating == null || rating < 1 || rating > 10) {
    return NextResponse.json({ error: "Rating must be 1-10" }, { status: 400 });
  }

  const score = await submitRating(session.user.id, mediaId, Number(rating));
  return NextResponse.json(score);
}

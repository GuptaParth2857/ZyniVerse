import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCommunityTag, voteOnTag } from "@/lib/community-tags";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mediaId, tag, vote, communityTagId } = await req.json();

  if (communityTagId) {
    const result = await voteOnTag(communityTagId, session.user.id, vote ?? 1);
    return NextResponse.json(result);
  }

  if (!mediaId || !tag) {
    return NextResponse.json({ error: "mediaId and tag required" }, { status: 400 });
  }

  const result = await createCommunityTag(mediaId, tag, session.user.id);
  return NextResponse.json(result);
}

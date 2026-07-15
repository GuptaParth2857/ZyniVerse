import { NextRequest, NextResponse } from "next/server";
import { getCommunityTags } from "@/lib/community-tags";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  const { mediaId: mediaIdStr } = await params;
  const mediaId = Number(mediaIdStr);
  if (!mediaId) return NextResponse.json({ error: "Invalid mediaId" }, { status: 400 });

  const session = await auth();
  const tags = await getCommunityTags(mediaId, session?.user?.id);
  return NextResponse.json({ tags });
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { moderateTag } from "@/lib/community-tags";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.email !== "admin@zyverse.in") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { communityTagId, isApproved } = await req.json();
  if (!communityTagId) return NextResponse.json({ error: "communityTagId required" }, { status: 400 });

  await moderateTag(communityTagId, Boolean(isApproved));
  return NextResponse.json({ success: true });
}

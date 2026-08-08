import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { moderateTag } from "@/lib/community-tags";

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { communityTagId, isApproved } = await req.json();
  if (!communityTagId) return NextResponse.json({ error: "communityTagId required" }, { status: 400 });

  await moderateTag(communityTagId, Boolean(isApproved));
  return NextResponse.json({ success: true });
}

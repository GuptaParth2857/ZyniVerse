import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase";

async function isAdminOrOwner(userId: string, reelUserId: string) {
  if (userId === reelUserId) return true;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  return isAdminEmail(user?.email);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reel = await prisma.reel.findUnique({ where: { id } });
    if (!reel) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    }

    if (!(await isAdminOrOwner(session.user.id, reel.userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.reelLike.deleteMany({ where: { reelId: id } }),
      prisma.reelComment.deleteMany({ where: { reelId: id } }),
      prisma.reelReport.deleteMany({ where: { reelId: id } }),
      prisma.reel.delete({ where: { id } }),
    ]);

    const supabase = getSupabaseAdmin();
    const url = new URL(reel.videoUrl);
    const path = url.pathname.split("/").slice(2).join("/");
    if (path) {
      await supabase.storage.from("reels").remove([path]);
    }
    if (reel.thumbnailUrl) {
      const thumbUrl = new URL(reel.thumbnailUrl);
      const thumbPath = thumbUrl.pathname.split("/").slice(2).join("/");
      if (thumbPath) {
        await supabase.storage.from("reels").remove([thumbPath]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Failed to delete reel" }, { status: 500 });
  }
}

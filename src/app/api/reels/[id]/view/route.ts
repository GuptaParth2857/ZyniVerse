import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { auth } from "@/lib/auth";

const VIEWER_COOKIE = "zvn_viewer";
const VIEWER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function randomKey() {
  return (
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10)
  );
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const existing = await prisma.reel.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    }

    const session = await auth();
    const cookies = req.cookies;
    let viewerKey = cookies.get(VIEWER_COOKIE)?.value;

    let userId: string | null = null;
    if (session?.user?.id) {
      userId = session.user.id;
      viewerKey = `user:${userId}`;
    } else if (!viewerKey) {
      viewerKey = `anon:${randomKey()}`;
    }

    const created = await prisma.reelView.createMany({
      data: [{ reelId: id, viewerKey, userId }],
      skipDuplicates: true,
    });

    let counted = false;
    if (created.count > 0) {
      await prisma.reel.update({ where: { id }, data: { views: { increment: 1 } } });
      counted = true;
    }

    const res = NextResponse.json({ ok: true, counted });
    if (!session?.user?.id && !cookies.get(VIEWER_COOKIE)?.value) {
      res.cookies.set(VIEWER_COOKIE, viewerKey, {
        maxAge: VIEWER_COOKIE_MAX_AGE,
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      });
    }
    return res;
  } catch (e) {
    logError(e);
    return NextResponse.json({ error: "Failed to count view" }, { status: 500 });
  }
}

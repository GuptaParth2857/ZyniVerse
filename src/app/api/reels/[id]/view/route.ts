import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { auth } from "@/lib/auth";

const VIEWER_COOKIE = "zvn_viewer";
const VIEWER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * How long before the *same* viewer's next view counts again.
 *
 * Views are deduped per (reel, viewer) so refresh-loops and bots can't inflate
 * a counter — but with permanent dedupe a repeat viewer could never contribute
 * more than once for the lifetime of a reel, so totals plateaued even while
 * traffic kept rising. 24h keeps "daily unique views" semantics instead.
 */
const VIEW_COOLDOWN_MS = 24 * 60 * 60 * 1000;

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
    const cookieKey = cookies.get(VIEWER_COOKIE)?.value;

    let userId: string | null = null;
    let viewerKey: string;
    if (session?.user?.id) {
      userId = session.user.id;
      viewerKey = `user:${userId}`;
    } else if (cookieKey) {
      viewerKey = cookieKey;
    } else {
      viewerKey = `anon:${randomKey()}`;
    }

    // Dedup row + counter increment must land together: they used to be two
    // separate queries, so a failure between them left a dedup row behind and
    // the counter could never catch up for that viewer again.
    const counted = await prisma.$transaction(async (tx) => {
      const seen = await tx.reelView.findUnique({
        where: { reelId_viewerKey: { reelId: id, viewerKey } },
        select: { id: true, lastViewedAt: true },
      });

      if (seen) {
        if (Date.now() - seen.lastViewedAt.getTime() < VIEW_COOLDOWN_MS) {
          return false;
        }
        await tx.reelView.update({
          where: { id: seen.id },
          data: { lastViewedAt: new Date() },
        });
      } else {
        await tx.reelView.create({ data: { reelId: id, viewerKey, userId } });
      }

      await tx.reel.update({ where: { id }, data: { views: { increment: 1 } } });
      return true;
    });

    const res = NextResponse.json({ ok: true, counted });
    if (!userId && !cookieKey) {
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

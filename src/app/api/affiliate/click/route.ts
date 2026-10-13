import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { affiliateLimiter } from "@/lib/rate-limiter";

const MAX_PARTNER_LENGTH = 100;
const MAX_PAGE_LENGTH = 500;

export async function POST(req: NextRequest) {
  const rateCheck = await affiliateLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  try {
    const body = (await req.json().catch(() => ({}))) as { partner?: unknown; page?: unknown };
    const partner = typeof body.partner === "string" ? body.partner.trim().slice(0, MAX_PARTNER_LENGTH) : "";
    const page = typeof body.page === "string" ? body.page.trim().slice(0, MAX_PAGE_LENGTH) : "";
    if (!partner || !page) {
      return NextResponse.json({ error: "Missing partner or page" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null;
    const userAgent = req.headers.get("user-agent") || null;

    // Attribution is only recorded for the *authenticated* visitor — a
    // client-supplied userId could otherwise inflate any account's click
    // counts (referrer fraud).
    const session = await auth();
    const userId = session?.user?.id || null;

    await prisma.affiliateClick.create({
      data: { partner, page, userId, ip, userAgent },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
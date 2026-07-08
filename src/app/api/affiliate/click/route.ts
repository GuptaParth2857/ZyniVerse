import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { partner, page, userId } = await req.json();
    if (!partner || !page) {
      return NextResponse.json({ error: "Missing partner or page" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null;
    const userAgent = req.headers.get("user-agent") || null;

    await prisma.affiliateClick.create({
      data: { partner, page, userId: userId || null, ip, userAgent },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

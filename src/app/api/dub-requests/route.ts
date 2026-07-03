import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { apiLimiter } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const language = searchParams.get("language") || "HINDI";
  const requests = await prisma.dubRequest.groupBy({
    by: ["mediaId", "title"],
    where: { language },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 20,
  });
  return NextResponse.json({ requests: requests.map((r) => ({ mediaId: r.mediaId, title: r.title, votes: r._count.id })) });
}

export async function POST(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mediaId, title, language } = await req.json();
  if (!mediaId || !title || !language) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  try {
    await prisma.dubRequest.create({
      data: { userId: session.user.id, mediaId, title, language },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Already requested" }, { status: 409 });
  }
}

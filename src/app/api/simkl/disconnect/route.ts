import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveUserId } from "@/lib/resolve-user";
import { apiLimiter } from "@/lib/rate-limiter";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const userId = await resolveUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  if (body?.attachments) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  await prisma.externalAccount.deleteMany({
    where: { userId, provider: "simkl" },
  });

  return NextResponse.json({ ok: true });
}
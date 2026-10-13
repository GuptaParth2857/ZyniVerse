import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiLimiter } from "@/lib/rate-limiter";
import { validateWebhookUrl } from "@/lib/webhook-ssrf";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const rateLimited = await apiLimiter.middleware(req);
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const webhooks = await prisma.webhook.findMany({
    where: { userId: session.user.id },
    include: {
      deliveries: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: { select: { deliveries: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ webhooks });
}

export async function POST(req: NextRequest) {
  const rateLimited = await apiLimiter.middleware(req);
  if (rateLimited) return rateLimited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url, events } = await req.json();
  if (!url || !events || !Array.isArray(events) || events.length === 0) {
    return NextResponse.json({ error: "Missing url or events" }, { status: 400 });
  }

  // SSRF guard: http(s) only + no local/private/reserved hosts (IP literal or
  // DNS-resolved). Fail-closed, so internal services / cloud metadata
  // (169.254.169.254) can never be targeted.
  const urlCheck = await validateWebhookUrl(url);
  if (!urlCheck.ok) {
    return NextResponse.json({ error: urlCheck.reason }, { status: 400 });
  }

  const secret = crypto.randomBytes(32).toString("hex");

  const webhook = await prisma.webhook.create({
    data: {
      userId: session.user.id,
      url,
      events: JSON.stringify(events),
      secret,
    },
  });

  return NextResponse.json({ webhook });
}

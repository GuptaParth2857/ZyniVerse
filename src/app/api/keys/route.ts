import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateApiKey, getTierLimit, canCreateKey } from "@/lib/api-key";
import { apiLimiter } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      key: true,
      tier: true,
      requests: true,
      limit: true,
      lastUsed: true,
      expiresAt: true,
      active: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Key name is required" }, { status: 400 });
  }

  // Check key limit per user based on tier
  const { allowed, currentKeys, maxKeys } = await canCreateKey(session.user.id);
  if (!allowed) {
    return NextResponse.json({ error: `Maximum ${maxKeys} API keys per account. Delete an old key or upgrade.` }, { status: 400 });
  }

  const newKey = generateApiKey();
  const tier = "free";
  const limit = getTierLimit(tier);

  const apiKey = await prisma.apiKey.create({
    data: {
      userId: session.user.id,
      key: newKey,
      name: name.trim(),
      tier,
      limit,
    },
  });

  return NextResponse.json({
    key: {
      id: apiKey.id,
      name: apiKey.name,
      key: apiKey.key,
      tier: apiKey.tier,
      limit: apiKey.limit,
      createdAt: apiKey.createdAt,
    },
  }, { status: 201 });
}

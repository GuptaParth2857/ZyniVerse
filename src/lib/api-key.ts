import { prisma } from "./prisma";
import { NextResponse } from "next/server";

export interface ApiTier {
  name: string;
  requestsPerDay: number;
  requestsPerMinute: number;
  maxKeys: number;
  price: number;
  features: string[];
}

export const API_TIERS: Record<string, ApiTier> = {
  free: {
    name: "Free",
    requestsPerDay: 100,
    requestsPerMinute: 10,
    maxKeys: 10,
    price: 0,
    features: ["Basic endpoints", "Community support"]
  },
  pro: {
    name: "Pro",
    requestsPerDay: 10000,
    requestsPerMinute: 100,
    maxKeys: 25,
    price: 499,
    features: ["All endpoints", "Higher rate limits", "Priority support", "Usage analytics"]
  },
  enterprise: {
    name: "Enterprise",
    requestsPerDay: 100000,
    requestsPerMinute: 1000,
    maxKeys: 100,
    price: 4999,
    features: ["Unlimited access", "SLA guarantee", "Dedicated support", "Custom integrations", "White-label options"]
  }
};

export function getTier(tierName: string): ApiTier {
  return API_TIERS[tierName] || API_TIERS.free;
}

export async function getUsage(keyId: string): Promise<{ today: number; thisMonth: number; total: number }> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [today, thisMonth, total] = await Promise.all([
    prisma.apiUsageLog.count({ where: { keyId, timestamp: { gte: startOfDay } } }),
    prisma.apiUsageLog.count({ where: { keyId, timestamp: { gte: startOfMonth } } }),
    prisma.apiUsageLog.count({ where: { keyId } }),
  ]);

  return { today, thisMonth, total };
}

export async function checkRateLimit(key: { id: string; tier: string }): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const tier = getTier(key.tier);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const resetAt = new Date(startOfDay);
  resetAt.setDate(resetAt.getDate() + 1);

  const today = await prisma.apiUsageLog.count({
    where: { keyId: key.id, timestamp: { gte: startOfDay } },
  });

  return {
    allowed: today < tier.requestsPerDay,
    remaining: Math.max(0, tier.requestsPerDay - today),
    resetAt,
  };
}

export async function logUsage(keyId: string, endpoint: string, status: number, ip?: string): Promise<void> {
  await prisma.apiUsageLog.create({
    data: { keyId, endpoint, status, ip },
  });
}

export async function canCreateKey(userId: string): Promise<{ allowed: boolean; currentKeys: number; maxKeys: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  const tierName = user?.subscription?.plan === "pro" ? "pro"
    : user?.subscription?.plan === "enterprise" ? "enterprise"
    : "free";
  const tier = getTier(tierName);
  const currentKeys = await prisma.apiKey.count({ where: { userId, active: true } });

  return {
    allowed: currentKeys < tier.maxKeys,
    currentKeys,
    maxKeys: tier.maxKeys,
  };
}

export function generateApiKey(): string {
  const prefix = "zvn";
  const random = Array.from({ length: 32 }, () =>
    "abcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(Math.random() * 36))
  ).join("");
  return `${prefix}_${random}`;
}

export async function verifyApiKey(request: Request): Promise<{ userId?: string; tier?: string; error?: NextResponse }> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "Missing or invalid API key. Use header: Authorization: Bearer <key>" }, { status: 401 }) };
  }

  const key = authHeader.slice(7).trim();
  if (!key) {
    return { error: NextResponse.json({ error: "API key is empty" }, { status: 401 }) };
  }

  const apiKey = await prisma.apiKey.findUnique({ where: { key } });
  if (!apiKey) {
    return { error: NextResponse.json({ error: "Invalid API key" }, { status: 401 }) };
  }

  if (!apiKey.active) {
    return { error: NextResponse.json({ error: "API key is disabled" }, { status: 403 }) };
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { error: NextResponse.json({ error: "API key has expired" }, { status: 403 }) };
  }

  const { allowed, remaining: _remaining, resetAt } = await checkRateLimit(apiKey);
  if (!allowed) {
    return { error: NextResponse.json({
      error: "Daily request limit reached",
      limit: getTier(apiKey.tier).requestsPerDay,
      tier: apiKey.tier,
      remaining: 0,
      resetAt: resetAt.toISOString(),
    }, { status: 429 }) };
  }

  await prisma.apiKey.update({
    where: { key },
    data: {
      requests: { increment: 1 },
      lastUsed: new Date(),
    },
  });

  await logUsage(apiKey.id, request.url, 200, request.headers.get("x-forwarded-for") || undefined);

  return { userId: apiKey.userId, tier: apiKey.tier };
}

export function apiKeyRateLimit(requests: number, windowMs: number) {
  const store = new Map<string, { count: number; resetAt: number }>();
  return {
    check(key: string): boolean {
      const now = Date.now();
      const entry = store.get(key);
      if (!entry || entry.resetAt < now) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }
      if (entry.count >= requests) return false;
      entry.count++;
      return true;
    },
  };
}

const tierLimits: Record<string, { requestsPerDay: number }> = {
  free: { requestsPerDay: 100 },
  pro: { requestsPerDay: 10000 },
  enterprise: { requestsPerDay: 100000 },
};

export function getTierLimit(tier: string): number {
  return tierLimits[tier]?.requestsPerDay || tierLimits.free.requestsPerDay;
}

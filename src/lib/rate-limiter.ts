import { NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(configName: string) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const store = stores.get(configName);
  if (!store) return;
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}

let redisClient: any = null;
let redisAvailable = false;

async function initRedis() {
  if (redisClient) return;
  try {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) return;
    const redis = await import("redis");
    redisClient = redis.createClient({ url: redisUrl });
    redisClient.on("error", (err: any) => {
      console.warn("[rate-limiter] Redis error, falling back to in-memory:", err.message);
      redisAvailable = false;
    });
    await redisClient.connect();
    redisAvailable = true;
    console.log("[rate-limiter] Redis connected");
  } catch (err: any) {
    console.warn("[rate-limiter] Redis unavailable, using in-memory store:", err.message);
    redisAvailable = false;
  }
}

initRedis();

function makeRedisKey(name: string, ip: string): string {
  return `ratelimit:${name}:${ip}`;
}

export function createRateLimiter(name: string, config: Partial<RateLimitConfig> = {}) {
  const { maxRequests = 60, windowMs = 60 * 1000 } = config as RateLimitConfig;

  if (!stores.has(name)) {
    stores.set(name, new Map());
  }
  const store = stores.get(name)!;

  const prefixedName = `rate_${name}`;

  return {
    async check(ip: string): Promise<{ allowed: boolean; remaining: number }> {
      if (redisAvailable && redisClient) {
        try {
          const key = makeRedisKey(prefixedName, ip);
          const count = await redisClient.incr(key);
          if (count === 1) {
            await redisClient.pexpire(key, windowMs);
          }
          if (count > maxRequests) {
            return { allowed: false, remaining: 0 };
          }
          return { allowed: true, remaining: Math.max(0, maxRequests - count) };
        } catch {
          redisAvailable = false;
        }
      }
      return this.checkSync(ip);
    },

    checkSync(ip: string): { allowed: boolean; remaining: number } {
      cleanup(name);
      const now = Date.now();
      let entry = store.get(ip);
      if (!entry || entry.resetAt < now) {
        entry = { count: 1, resetAt: now + windowMs };
        store.set(ip, entry);
        return { allowed: true, remaining: maxRequests - 1 };
      }
      if (entry.count >= maxRequests) {
        return { allowed: false, remaining: 0 };
      }
      entry.count++;
      return { allowed: true, remaining: maxRequests - entry.count };
    },

    getClientIp(request: Request): string {
      const forwarded = request.headers.get("x-forwarded-for");
      if (forwarded) return forwarded.split(",")[0].trim();
      const realIp = request.headers.get("x-real-ip");
      if (realIp) return realIp;
      const url = new URL(request.url);
      return url.hostname;
    },

    middleware(request: Request): NextResponse | null {
      const ip = this.getClientIp(request);
      const result = this.checkSync(ip);
      if (!result.allowed) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          {
            status: 429,
            headers: {
              "Retry-After": String(Math.ceil(windowMs / 1000)),
              "X-RateLimit-Limit": String(maxRequests),
              "X-RateLimit-Remaining": "0",
            },
          }
        );
      }
      return null;
    },

    getStore() {
      return store;
    },

    reset() {
      store.clear();
    },

    getStats() {
      return {
        size: store.size,
        config: { maxRequests, windowMs },
        redisAvailable,
      };
    },
  };
}

export const apiLimiter = createRateLimiter("api", {
  maxRequests: 30,
  windowMs: 60 * 1000,
});

export const authLimiter = createRateLimiter("auth", {
  maxRequests: 10,
  windowMs: 60 * 1000,
});

export const anilistLimiter = createRateLimiter("anilist", {
  maxRequests: 30,
  windowMs: 60 * 1000,
});

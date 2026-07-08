import { describe, it, expect, beforeEach } from "vitest";
import { createRateLimiter } from "@/lib/rate-limiter";

describe("createRateLimiter", () => {
  let limiter: ReturnType<typeof createRateLimiter>;

  beforeEach(() => {
    limiter = createRateLimiter("test", { maxRequests: 5, windowMs: 60 * 1000 });
    limiter.reset();
  });

  it("allows requests within limit", async () => {
    for (let i = 0; i < 5; i++) {
      const result = await limiter.check("127.0.0.1");
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4 - i);
    }
  });

  it("blocks requests over limit", async () => {
    for (let i = 0; i < 5; i++) {
      await limiter.check("127.0.0.1");
    }
    const result = await limiter.check("127.0.0.1");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks different IPs independently", async () => {
    for (let i = 0; i < 5; i++) {
      await limiter.check("ip-A");
      await limiter.check("ip-B");
    }
    expect((await limiter.check("ip-A")).allowed).toBe(false);
    expect((await limiter.check("ip-B")).allowed).toBe(false);
    expect((await limiter.check("ip-C")).allowed).toBe(true);
  });

  it("resets after window expires", async () => {
    const fastLimiter = createRateLimiter("fast", { maxRequests: 1, windowMs: 50 });
    expect((await fastLimiter.check("127.0.0.1")).allowed).toBe(true);
    expect((await fastLimiter.check("127.0.0.1")).allowed).toBe(false);

    await new Promise((r) => setTimeout(r, 60));
    expect((await fastLimiter.check("127.0.0.1")).allowed).toBe(true);
  });

  it("extracts client IP from x-forwarded-for", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "203.0.113.1, 10.0.0.1" },
    });
    expect(limiter.getClientIp(req)).toBe("203.0.113.1");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("http://localhost", {
      headers: { "x-real-ip": "198.51.100.1" },
    });
    expect(limiter.getClientIp(req)).toBe("198.51.100.1");
  });

  it("middleware returns null when under limit", () => {
    const req = new Request("http://localhost");
    expect(limiter.middleware(req)).toBeNull();
  });

  it("middleware returns 429 when over limit", async () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "203.0.113.1" },
    });
    for (let i = 0; i < 5; i++) await limiter.check("203.0.113.1");
    const response = limiter.middleware(req);
    expect(response).not.toBeNull();
    expect(response!.status).toBe(429);
  });

  it("getStats returns correct config", () => {
    const stats = limiter.getStats();
    expect(stats.config.maxRequests).toBe(5);
    expect(stats.config.windowMs).toBe(60000);
    expect(stats.size).toBe(0);
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { createRateLimiter } from "@/lib/rate-limiter";

describe("createRateLimiter", () => {
  let limiter: ReturnType<typeof createRateLimiter>;

  beforeEach(() => {
    limiter = createRateLimiter("test", { maxRequests: 5, windowMs: 60 * 1000 });
    limiter.reset();
  });

  it("allows requests within limit", () => {
    for (let i = 0; i < 5; i++) {
      const result = limiter.check("127.0.0.1");
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4 - i);
    }
  });

  it("blocks requests over limit", () => {
    for (let i = 0; i < 5; i++) {
      limiter.check("127.0.0.1");
    }
    const result = limiter.check("127.0.0.1");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks different IPs independently", () => {
    for (let i = 0; i < 5; i++) {
      limiter.check("ip-A");
      limiter.check("ip-B");
    }
    expect(limiter.check("ip-A").allowed).toBe(false);
    expect(limiter.check("ip-B").allowed).toBe(false);
    expect(limiter.check("ip-C").allowed).toBe(true);
  });

  it("resets after window expires", async () => {
    const fastLimiter = createRateLimiter("fast", { maxRequests: 1, windowMs: 50 });
    expect(fastLimiter.check("127.0.0.1").allowed).toBe(true);
    expect(fastLimiter.check("127.0.0.1").allowed).toBe(false);

    await new Promise((r) => setTimeout(r, 60));
    expect(fastLimiter.check("127.0.0.1").allowed).toBe(true);
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

  it("middleware returns 429 when over limit", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "203.0.113.1" },
    });
    for (let i = 0; i < 5; i++) limiter.check("203.0.113.1");
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

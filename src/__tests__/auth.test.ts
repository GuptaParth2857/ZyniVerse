import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("Auth utilities", () => {
  it("bcryptjs hashes and compares passwords correctly", async () => {
    const password = "test-password-123";
    const hash = await bcrypt.hash(password, 10);
    expect(hash).not.toBe(password);
    expect(await bcrypt.compare(password, hash)).toBe(true);
    expect(await bcrypt.compare("wrong-password", hash)).toBe(false);
  });

  it("password hash is different each time", async () => {
    const password = "same-password";
    const hash1 = await bcrypt.hash(password, 10);
    const hash2 = await bcrypt.hash(password, 10);
    expect(hash1).not.toBe(hash2);
  });
});

describe("Rate limiter", () => {
  it("should allow requests within limit", async () => {
    const { apiLimiter } = await import("@/lib/rate-limiter");
    const req = new Request("http://localhost:3000/api/test");
    const res = apiLimiter.middleware(req);
    expect(res).toBeNull();
  });

  it("should rate limit after too many requests", async () => {
    const { apiLimiter } = await import("@/lib/rate-limiter");
    const req = new Request("http://localhost:3000/api/test");
    for (let i = 0; i < 60; i++) {
      apiLimiter.middleware(req);
    }
    const res = apiLimiter.middleware(req);
    expect(res).not.toBeNull();
    if (res) {
      const body = await res.json();
      expect(body.error).toBeDefined();
    }
  });
});

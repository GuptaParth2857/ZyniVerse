import { describe, it, expect, beforeEach } from "vitest";
import { authLimiter } from "@/lib/rate-limiter";
import { POST as forgotPasswordPOST } from "@/app/api/auth/forgot-password/route";
import { POST as resetPasswordPOST } from "@/app/api/auth/reset-password/route";

/**
 * Both password-reset endpoints must be behind the shared `authLimiter`
 * (10 req/min per IP). The in-memory limiter store is per-test-file, so reset
 * it between tests for determinism.
 */
beforeEach(() => {
  authLimiter.reset();
});

function postReq(ip: string, body: unknown): Request {
  return new Request("http://localhost", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

describe("forgot-password route", () => {
  it("rate-limits repeated requests from the same IP", async () => {
    const ip = "203.0.113.10";
    for (let i = 0; i < 10; i++) {
      const res = await forgotPasswordPOST(postReq(ip, { email: "user@example.com" }));
      expect(res.status).not.toBe(429);
    }
    const blocked = await forgotPasswordPOST(postReq(ip, { email: "user@example.com" }));
    expect(blocked.status).toBe(429);
  });

  it("does not rate-limit a quiet IP", async () => {
    const res = await forgotPasswordPOST(postReq("203.0.113.99", { email: "user@example.com" }));
    expect(res.status).not.toBe(429);
  });
});

describe("reset-password route", () => {
  it("rate-limits repeated requests from the same IP", async () => {
    const ip = "198.51.100.20";
    for (let i = 0; i < 10; i++) {
      const res = await resetPasswordPOST(
        postReq(ip, { email: "user@example.com", token: "123456", newPassword: "newpass123" })
      );
      expect(res.status).not.toBe(429);
    }
    const blocked = await resetPasswordPOST(
      postReq(ip, { email: "user@example.com", token: "123456", newPassword: "newpass123" })
    );
    expect(blocked.status).toBe(429);
  });

  it("shares the same limiter bucket as forgot-password", async () => {
    // 9 requests on forgot-password...
    for (let i = 0; i < 9; i++) {
      const res = await forgotPasswordPOST(postReq("203.0.113.50", { email: "user@example.com" }));
      expect(res.status).not.toBe(429);
    }
    await forgotPasswordPOST(postReq("203.0.113.50", { email: "user@example.com" }));
    // ...then reset-password from the same IP is already over the 10/min limit.
    const blocked = await resetPasswordPOST(
      postReq("203.0.113.50", { email: "user@example.com", token: "123456", newPassword: "newpass123" })
    );
    expect(blocked.status).toBe(429);
  });
});
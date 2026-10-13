import { describe, it, expect, vi, beforeEach } from "vitest";
import type { IncomingMessage } from "http";

const { getTokenMock } = vi.hoisted(() => ({ getTokenMock: vi.fn() }));

vi.mock("next-auth/jwt", () => ({
  getToken: getTokenMock,
}));

import { getSocketUserId } from "@/lib/socket-auth";

const fakeReq = (cookie?: string): IncomingMessage =>
  ({ headers: cookie ? { cookie } : {} }) as unknown as IncomingMessage;

beforeEach(() => {
  getTokenMock.mockReset();
  process.env.AUTH_SECRET = "socket-auth-test-secret";
});

describe("getSocketUserId", () => {
  it("returns the dbId from the session JWT", async () => {
    getTokenMock.mockResolvedValue({ dbId: "user-123" });
    const userId = await getSocketUserId(fakeReq("authjs.session-token=abc"));
    expect(userId).toBe("user-123");
    // First call = secure cookie flavour; the dbId is found immediately.
    expect(getTokenMock).toHaveBeenCalledTimes(1);
    expect(getTokenMock).toHaveBeenCalledWith(
      expect.objectContaining({ secret: "socket-auth-test-secret", secureCookie: true })
    );
  });

  it("falls back to sub when dbId is absent", async () => {
    getTokenMock.mockResolvedValue({ sub: "sub-9" });
    expect(await getSocketUserId(fakeReq("authjs.session-token=abc"))).toBe("sub-9");
  });

  it("keeps trying both cookie flavours while getToken returns no user", async () => {
    getTokenMock.mockResolvedValue(null);
    expect(await getSocketUserId(fakeReq("authjs.session-token=abc"))).toBeNull();
    expect(getTokenMock).toHaveBeenCalledTimes(2); // secure + plain cookie flavours
  });

  it("returns null when there is no usable session token", async () => {
    getTokenMock.mockResolvedValue(null);
    expect(await getSocketUserId(fakeReq())).toBeNull();
  });

  it("returns null when AUTH_SECRET is missing", async () => {
    process.env.AUTH_SECRET = "";
    delete process.env.AUTH_SECRET;
    expect(await getSocketUserId(fakeReq("authjs.session-token=abc"))).toBeNull();
    expect(getTokenMock).not.toHaveBeenCalled();
  });

  it("does not throw when token decoding errors", async () => {
    getTokenMock.mockRejectedValue(new Error("bad token"));
    await expect(getSocketUserId(fakeReq("authjs.session-token=bad"))).resolves.toBeNull();
  });
});
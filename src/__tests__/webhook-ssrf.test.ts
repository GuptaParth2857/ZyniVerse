import { describe, it, expect, vi, beforeEach } from "vitest";

const { lookupMock } = vi.hoisted(() => ({ lookupMock: vi.fn() }));

vi.mock("node:dns/promises", () => ({
  lookup: (...args: unknown[]) => lookupMock(...args),
}));

import { expandIPv6, isBlockedIp, validateWebhookUrl } from "@/lib/webhook-ssrf";

beforeEach(() => {
  lookupMock.mockReset();
});

describe("expandIPv6", () => {
  it("expands compressed addresses", () => {
    expect(expandIPv6("::1")).toEqual([0, 0, 0, 0, 0, 0, 0, 1]);
    expect(expandIPv6("::")).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(expandIPv6("fe80::1")).toEqual([0xfe80, 0, 0, 0, 0, 0, 0, 1]);
    expect(expandIPv6("2001:db8::1")).toEqual([0x2001, 0x0db8, 0, 0, 0, 0, 0, 1]);
    expect(expandIPv6("fd12:3456::abcd")).toEqual([0xfd12, 0x3456, 0, 0, 0, 0, 0, 0xabcd]);
  });

  it("expands uncompressed addresses", () => {
    expect(expandIPv6("2001:db8:0:0:0:0:0:1")).toEqual([0x2001, 0x0db8, 0, 0, 0, 0, 0, 1]);
    expect(expandIPv6("0:0:0:0:0:0:0:1")).toEqual([0, 0, 0, 0, 0, 0, 0, 1]);
  });

  it("handles IPv4-mapped addresses", () => {
    expect(expandIPv6("::ffff:127.0.0.1")).toEqual([0, 0, 0, 0, 0, 0xffff, 0x7f00, 0x0001]);
    expect(expandIPv6("::ffff:10.0.0.1")).toEqual([0, 0, 0, 0, 0, 0xffff, 0x0a00, 0x0001]);
  });

  it("rejects malformed input", () => {
    expect(expandIPv6("nope")).toBeNull();
    expect(expandIPv6("g::1")).toBeNull();
    expect(expandIPv6("::1::2")).toBeNull(); // multiple "::" is invalid
  });
});

describe("isBlockedIp", () => {
  const blocked = [
    "127.0.0.1",
    "10.0.0.1",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.1.1",
    "169.254.169.254",
    "0.0.0.0",
    "100.64.0.1",
    "192.0.2.1",
    "198.18.0.1",
    "198.51.100.1",
    "203.0.113.1",
    "224.0.0.1",
    "240.0.0.1",
    "::1",
    "::",
    "fe80::1",
    "fc00::1",
    "fd12:3456::1",
    "2001:db8::1",
    "::ffff:127.0.0.1",
    "::ffff:10.0.0.1",
    "not-an-ip",
  ];

  it.each(blocked)("blocks %s", (ip) => {
    expect(isBlockedIp(ip)).toBe(true);
  });

  const publicIps = ["8.8.8.8", "1.1.1.1", "93.184.216.34", "2607:f8b0::1", "2a00:1450:4001::1"];

  it.each(publicIps)("allows %s", (ip) => {
    expect(isBlockedIp(ip)).toBe(false);
  });
});

describe("validateWebhookUrl", () => {
  it("rejects an invalid URL format", async () => {
    const res = await validateWebhookUrl("not a url");
    expect(res).toEqual({ ok: false, reason: "Invalid URL format" });
  });

  it("rejects non-http(s) schemes", async () => {
    for (const url of ["ftp://example.com/hook", "file:///etc/passwd", "gopher://localhost:70/x"]) {
      const res = await validateWebhookUrl(url);
      expect(res.ok).toBe(false);
    }
  });

  it("rejects private IP literals without touching DNS", async () => {
    const privateUrls = [
      "http://127.0.0.1/hook",
      "https://10.0.0.5/hook",
      "http://169.254.169.254/latest/meta-data/",
      "https://192.168.1.1/hook",
      "http://172.16.1.1/hook",
      "http://[::1]/hook",
      "http://[fd00::1]/hook",
      "http://[2001:db8::1]/hook",
    ];
    for (const url of privateUrls) {
      const res = await validateWebhookUrl(url);
      expect(res.ok).toBe(false);
    }
    expect(lookupMock).not.toHaveBeenCalled();
  });

  it("allows public IP literals without touching DNS", async () => {
    const res = await validateWebhookUrl("https://8.8.8.8/hook");
    expect(res).toEqual({ ok: true });
    expect(lookupMock).not.toHaveBeenCalled();
  });

  it("blocks domains that resolve to private addresses", async () => {
    lookupMock.mockResolvedValue([{ address: "10.0.0.1", family: 4 }]);
    const res = await validateWebhookUrl("https://evil.example/hook");
    expect(res.ok).toBe(false);
    expect(res.ok === false && res.reason).toContain("private");
  });

  it("blocks domains that resolve to the cloud metadata IP", async () => {
    lookupMock.mockResolvedValue([{ address: "169.254.169.254", family: 4 }]);
    expect((await validateWebhookUrl("https://metadata.example/x")).ok).toBe(false);
  });

  it("blocks domains with mixed public/private resolution", async () => {
    lookupMock.mockResolvedValue([
      { address: "93.184.216.34", family: 4 },
      { address: "127.0.0.1", family: 4 },
    ]);
    expect((await validateWebhookUrl("https://mixed.example/hook")).ok).toBe(false);
  });

  it("allows domains that only resolve to public addresses", async () => {
    lookupMock.mockResolvedValue([
      { address: "93.184.216.34", family: 4 },
      { address: "2606:2800:220:1:248:1893:25c8:1946", family: 6 },
    ]);
    await expect(validateWebhookUrl("https://example.com/hook")).resolves.toEqual({ ok: true });
  });

  it("fails closed when resolution errors", async () => {
    lookupMock.mockRejectedValue(new Error("ENOTFOUND"));
    const res = await validateWebhookUrl("https://nowhere.invalid/hook");
    expect(res.ok).toBe(false);
  });

  it("fails closed on empty resolution", async () => {
    lookupMock.mockResolvedValue([]);
    expect((await validateWebhookUrl("https://empty.example/hook")).ok).toBe(false);
  });
});
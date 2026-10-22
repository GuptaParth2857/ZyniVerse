import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import type { NextFetchEvent } from "next/server";
import { proxy } from "@/proxy";

/**
 * The Proxy answers two kinds of crawler traffic before the route/page runs:
 *
 *  - the analytics ingest endpoints (204, so the route handler is never
 *    invoked — the crawl storm cost ~19.6k invocations/day there);
 *  - the /forum/create form page (404, so the page render is skipped).
 *
 * Both are bot-only. Humans must never be affected.
 */

const GOOGLEBOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const HUMAN =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function makeRequest(url: string, userAgent?: string, method = "GET") {
  const headers: Record<string, string> = {};
  if (userAgent !== undefined) headers["user-agent"] = userAgent;
  return new NextRequest(new Request(url, { method, headers }));
}

function makeEvent() {
  const waitUntil = vi.fn();
  // The global setup mocks `fetch`, so the self-report request has to resolve.
  vi.mocked(fetch).mockResolvedValue(new Response("{}", { status: 200 }));
  return { event: { waitUntil } as unknown as NextFetchEvent, waitUntil };
}

function isNext(response: Response): boolean {
  return response.headers.get("x-middleware-next") === "1";
}

describe("proxy — analytics ingest", () => {
  it("answers a known crawler with 204 so the route never runs", () => {
    const { event } = makeEvent();
    const res = proxy(makeRequest("https://zyverse.in/api/analytics/session", GOOGLEBOT, "POST"), event);
    expect(res.status).toBe(204);
  });

  it("answers a request without a User-Agent with 204", () => {
    const { event } = makeEvent();
    const res = proxy(makeRequest("https://zyverse.in/api/analytics/pageview", undefined, "POST"), event);
    expect(res.status).toBe(204);
  });

  it("lets a real browser through to the route", () => {
    const { event } = makeEvent();
    const res = proxy(makeRequest("https://zyverse.in/api/analytics/session", HUMAN, "POST"), event);
    expect(isNext(res)).toBe(true);
  });
});

describe("proxy — /forum/create", () => {
  it("answers a crawler with 404 so the page is never rendered", () => {
    const { event } = makeEvent();
    const res = proxy(makeRequest("https://zyverse.in/forum/create", GOOGLEBOT), event);
    expect(res.status).toBe(404);
  });

  it("keeps the form reachable for people", () => {
    const { event } = makeEvent();
    const res = proxy(makeRequest("https://zyverse.in/forum/create", HUMAN), event);
    expect(isNext(res)).toBe(true);
  });

  it("does not touch the rest of /forum/ (indexed threads must keep working)", () => {
    const { event } = makeEvent();
    const res = proxy(makeRequest("https://zyverse.in/forum/thread/123", GOOGLEBOT), event);
    expect(isNext(res)).toBe(true);
  });
});

describe("proxy — crawler reporting", () => {
  it("reports a crawler hit on a content page", async () => {
    const { event, waitUntil } = makeEvent();
    proxy(makeRequest("https://zyverse.in/anime/1", GOOGLEBOT), event);
    expect(waitUntil).toHaveBeenCalledTimes(1);
  });

  it("does not report human traffic", () => {
    const { event, waitUntil } = makeEvent();
    proxy(makeRequest("https://zyverse.in/anime/1", HUMAN), event);
    expect(waitUntil).not.toHaveBeenCalled();
  });
});

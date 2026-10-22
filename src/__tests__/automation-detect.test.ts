import { describe, it, expect } from "vitest";
import { isAutomatedBrowser } from "@/lib/automation-detect";
import { isAutomatedRequest, userAgentFromRequest } from "@/lib/analytics";

/**
 * Two complementary layers of bot filtering for the analytics ingest:
 *
 *  - `isAutomatedBrowser` runs in the browser and stops the request before it
 *    is ever sent (no serverless invocation, no database row). It catches the
 *    scraper fleet that spoofs a plain Chrome User-Agent.
 *  - `isAutomatedRequest` runs on the server and skips the write for known
 *    crawlers and for requests without a User-Agent at all.
 */

const CHROME_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const WINDOWS_CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const FIREFOX_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0";

describe("isAutomatedBrowser", () => {
  it("flags a browser that reports navigator.webdriver", () => {
    expect(
      isAutomatedBrowser(
        { userAgent: CHROME_UA, webdriver: true, plugins: { length: 5 } },
        { chrome: {} }
      )
    ).toBe(true);
  });

  it("flags headless Chrome (no plugins, no chrome runtime)", () => {
    expect(isAutomatedBrowser({ userAgent: CHROME_UA, plugins: { length: 0 } }, {})).toBe(true);
    expect(isAutomatedBrowser({ userAgent: CHROME_UA, plugins: null }, {})).toBe(true);
  });

  it("keeps a real Chrome with plugins and a chrome runtime", () => {
    expect(
      isAutomatedBrowser({ userAgent: CHROME_UA, plugins: { length: 5 } }, { chrome: {} })
    ).toBe(false);
  });

  it("keeps a real Chrome whose plugins are disabled but that has a chrome runtime", () => {
    expect(isAutomatedBrowser({ userAgent: WINDOWS_CHROME_UA, plugins: { length: 0 } }, { chrome: {} })).toBe(
      false
    );
  });

  it("does not judge browsers it has no signal for", () => {
    expect(isAutomatedBrowser({ userAgent: FIREFOX_UA, plugins: { length: 0 } }, {})).toBe(false);
    expect(isAutomatedBrowser({ userAgent: "", webdriver: false, plugins: null }, {})).toBe(false);
  });

  it("returns false when there is no navigator at all (SSR)", () => {
    expect(isAutomatedBrowser(null, null)).toBe(false);
  });
});

describe("isAutomatedRequest", () => {
  it("rejects a known crawler", () => {
    const headers = new Headers({
      "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    });
    expect(isAutomatedRequest(headers)).toBe(true);
  });

  it("rejects a request without a User-Agent", () => {
    expect(isAutomatedRequest(new Headers())).toBe(true);
    expect(isAutomatedRequest(new Headers({ "user-agent": "   " }))).toBe(true);
  });

  it("accepts a normal browser", () => {
    const headers = new Headers({ "user-agent": WINDOWS_CHROME_UA });
    expect(isAutomatedRequest(headers)).toBe(false);
  });
});

describe("userAgentFromRequest", () => {
  it("prefers the request header", () => {
    const headers = new Headers({ "user-agent": WINDOWS_CHROME_UA });
    expect(userAgentFromRequest(headers, "fallback")).toBe(WINDOWS_CHROME_UA);
  });

  it("falls back to the client-sent value", () => {
    expect(userAgentFromRequest(new Headers(), "client-ua")).toBe("client-ua");
  });

  it("returns null when there is nothing to store", () => {
    expect(userAgentFromRequest(new Headers(), undefined)).toBeNull();
    expect(userAgentFromRequest(new Headers(), "  ")).toBeNull();
  });
});

/**
 * Headless / automated browser detection for the visitor analytics pipeline.
 *
 * Between 2026-10-11 and 2026-10-20 a scraper fleet hit this site ~19.6k
 * times a day. It executed JavaScript (so every page load produced a session
 * row and a page view) while presenting a plain `Chrome/<version>` User-Agent,
 * which no server-side bot catalogue can catch — the crawler catalogue in
 * `lib/bot-detect` only recognises ~25k hits over the whole window, while the
 * session table grew by 123,897 rows.
 *
 * The signatures used here are the standard automation tells:
 *
 *   - `navigator.webdriver` is true in every automation driver (Puppeteer,
 *     Playwright, Selenium, chromedriver) unless the operator deliberately
 *     overrode it;
 *   - a headless browser exposes no plugin list and no `window.chrome`
 *     runtime, while real Chrome/Edge always has both.
 *
 * Both checks have to be evaluated together for the second signal, so a real
 * browser with plugins disabled is not mistaken for a bot.
 *
 * This module is dependency-free so it can be unit tested and imported by the
 * client bundle without pulling anything in.
 */

export interface NavigatorLike {
  userAgent?: string | null;
  webdriver?: boolean;
  plugins?: { length: number } | null;
}

export interface WindowLike {
  chrome?: unknown;
}

export function isAutomatedBrowser(
  nav?: NavigatorLike | null,
  win?: WindowLike | null
): boolean {
  const n =
    nav ?? (typeof navigator !== "undefined" ? (navigator as unknown as NavigatorLike) : null);
  if (!n) return false;

  const ua = n.userAgent || "";

  try {
    if (n.webdriver === true) return true;
  } catch {
    /* never let detection break the page */
  }

  if (/Chrome\/|Edg\//.test(ua)) {
    const hasPlugins = Boolean(n.plugins && n.plugins.length > 0);
    const w =
      win ?? (typeof window !== "undefined" ? (window as unknown as WindowLike) : null);
    const hasChromeRuntime = Boolean(w && "chrome" in w);
    if (!hasPlugins && !hasChromeRuntime) return true;
  }

  return false;
}

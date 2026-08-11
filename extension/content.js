/**
 * ZyniVerse Auto-Tracker — content script
 * Detects currently-watching anime on Crunchyroll & Netflix and reports
 * the title + episode to the background service worker.
 */

(() => {
  if (window.top !== window) return; // only top frame

  const API_BASE = "https://zyverse.in";
  const STATE_KEY = "zv_last_scrobble";

  let lastReported = "";

  function host() {
    return window.location.hostname.toLowerCase();
  }

  function slugToTitle(slug) {
    return slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  }

  function currentEpisodeFromUrl() {
    const path = window.location.pathname;
    const ep = path.match(/\/(?:episode-)?(\d+)(?:\/|$)/i);
    return ep ? parseInt(ep[1], 10) : null;
  }

  function parseCrunchyroll() {
    const path = window.location.pathname;
    const m = path.match(/\/watch\/([^/]+)/);
    if (!m) return null;
    const seriesSlug = m[1];
    const ep = currentEpisodeFromUrl();
    return { title: slugToTitle(seriesSlug), episode: ep || 1 };
  }

  function parseNetflix() {
    const m = window.location.pathname.match(/\/watch\/(\d+)/);
    if (!m) return null;

    // Best-effort: title from the page's meta/og tag or <title>.
    const meta = document.querySelector('meta[property="og:title"]');
    let rawTitle = meta ? meta.getAttribute("content") : document.title;

    // Netflix titles look like "Series: S1:E2" or "Series — Episode 2".
    let title = rawTitle.replace(/\s*[:—-]\s*(S\d+(?:\s*[:.-]\s*E\d+)?|Season\s*\d+.*|Episode\s*\d+.*)$/i, "").trim();
    const epMatch = rawTitle.match(/(?:S\d+[:.-]\s*E(\d+))|Episode\s*(\d+)/i);
    const episode = epMatch ? parseInt(epMatch[1] || epMatch[2], 10) : null;
    if (!title) return null;
    return { title, episode: episode || 1 };
  }

  function detect() {
    const h = host();
    if (h.includes("crunchyroll")) return parseCrunchyroll();
    if (h.includes("netflix")) return parseNetflix();
    return null;
  }

  function report() {
    const info = detect();
    if (!info || !info.title) return;

    const key = `${info.title}::${info.episode}`;
    if (key === lastReported) return;
    lastReported = key;

    chrome.storage.local.get([STATE_KEY], (prev) => {
      if (prev[STATE_KEY] === key) return; // already synced
      chrome.runtime.sendMessage({ type: "ZV_SCROBBLE", payload: info }, (res) => {
        if (res && res.ok) {
          chrome.storage.local.set({ [STATE_KEY]: key });
        }
      });
    });
  }

  // Report on load and whenever the URL changes (new episode).
  report();
  let lastHref = window.location.href;
  setInterval(() => {
    if (window.location.href !== lastHref) {
      lastHref = window.location.href;
      report();
    }
  }, 1500);
})();

const CACHE_NAME = "zyverse-v5";
const STATIC_ASSETS = [
  "/manifest.json",
  "/logo.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-512-maskable.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(async () => {
      // Purge stale HTML navigations from the current cache so a fresh
      // deploy is never shadowed by an old cached page shell.
      const cache = await caches.open(CACHE_NAME);
      const keys2 = await cache.keys();
      await Promise.all(
        keys2.filter((r) => r.mode === "navigate" || !r.url.includes("/_next/static")).map((r) => cache.delete(r))
      );
      return self.clients.claim();
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

// ── Web Push ──
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_e) {
    data = { title: "ZyniVerse", body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "ZyniVerse", {
      body: data.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: data.tag || undefined,
      renotify: Boolean(data.tag),
      data: { link: data.link || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link =
    (event.notification.data && event.notification.data.link) || "/";
  const url = new URL(link, self.location.origin).href;
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(url).catch(() => {});
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      })
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  // AniList GraphQL API — network first, cache fallback
  if (url.hostname === "graphql.anilist.co") {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  if (url.origin === self.location.origin) {
    // Page navigations — ALWAYS try network first so users see the latest
    // deploy immediately; cache is only a last-resort offline fallback.
    if (request.mode === "navigate") {
      event.respondWith(navigateNetworkFirst(request));
      return;
    }
    // API and image proxy routes — network first
    if (url.pathname.startsWith("/api/")) {
      event.respondWith(networkFirstWithCache(request));
      return;
    }
    // Immutable hashed build assets — cache first is safe because the
    // activate handler purges everything when CACHE_NAME bumps on deploy.
    if (url.pathname.startsWith("/_next/static")) {
      event.respondWith(cacheFirstWithNetwork(request));
      return;
    }
    // Everything else same-origin — network first
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  // Third-party (images, fonts, etc.) — network first
  event.respondWith(networkFirstWithCache(request));
});

// Network-first with a timeout: if the network hangs, fall back to cache
// instead of showing a blank page, but never serve stale HTML when online.
async function navigateNetworkFirst(request) {
  const timeout = new Promise((resolve) =>
    setTimeout(() => resolve(null), 3000)
  );
  try {
    const response = await Promise.race([fetch(request), timeout]);
    if (!response) throw new Error("network timeout");
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    return new Response("Offline", { status: 503 });
  }
}

async function cacheFirstWithNetwork(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response(JSON.stringify({ ok: false, offline: true }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function networkFirstWithCache(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ ok: false, offline: true }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

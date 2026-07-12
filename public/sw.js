const CACHE_NAME = "zyverse-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/logo.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
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
    ).then(() => self.clients.claim())
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

  // Same-origin requests
  if (url.origin === self.location.origin) {
    // API and image proxy routes — network first
    if (url.pathname.startsWith("/api/")) {
      event.respondWith(networkFirstWithCache(request));
      return;
    }
    // Next.js static assets (_next/static) — cache first for fast loads
    if (url.pathname.startsWith("/_next/static")) {
      event.respondWith(cacheFirstWithNetwork(request));
      return;
    }
    // Pages (HTML) — network first, fallback to cache for offline reading
    if (url.pathname.startsWith("/anime/") || url.pathname.startsWith("/manga/") ||
        url.pathname.startsWith("/character/") || url.pathname.startsWith("/staff/") ||
        url.pathname.startsWith("/studio/") || url.pathname.startsWith("/genre/")) {
      event.respondWith(networkFirstWithCache(request));
      return;
    }
    // Other same-origin (homepage, search, etc.) — network first
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  // Third-party (images, fonts, etc.) — network first
  event.respondWith(networkFirstWithCache(request));
});

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
    return new Response("Offline", { status: 503 });
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
    return new Response("Offline", { status: 503 });
  }
}

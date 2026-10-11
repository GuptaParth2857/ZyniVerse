// GENERATED FILE - do not edit by hand.
// Source: src/lib/offline-policy.ts + scripts/build-sw.ts
// Regenerate: npm run build:sw
// A test fails if this file drifts from that source.
const VERSION = "v6";
const CACHES = {
  pages: "pages-" + VERSION,
  assets: "assets-" + VERSION,
  api: "api-" + VERSION,
  images: "images-" + VERSION,
};
const MAX_ENTRIES = {"pages":40,"assets":200,"api":120,"images":300};
const PAGE_MAX_AGE_MS = 604800000;
const PUBLIC_API_PREFIXES = ["/api/anilist/","/api/search/"];
const CACHEABLE_HOSTS = ["graphql.anilist.co"];
const CACHEABLE_IMAGE_HOSTS = ["s4.anilist.co","img.anilist.co","s1.anilist.co","cdn.myanimelist.net"];
const PRECACHE = ["/offline","/manifest.json","/logo.png","/icons/icon-192.png","/icons/icon-512.png","/icons/icon-512-maskable.png"];
const STATIC_PREFIXES = ["/_next/static/", "/icons/", "/_next/image", "/images/", "/fonts/"];
const EXACT_STATIC = ["/manifest.json", "/offline", "/logo.png", "/favicon.ico"];
const NAV_TIMEOUT_MS = 4000;

function classify(request, url, selfOrigin) {
  const sameOrigin = url.origin === selfOrigin;
  const isGet = request.method === "GET";

  // The "reason" strings mirror the ones decide() returns in
  // src/lib/offline-policy.ts. They exist so a request that was quietly passed
  // through can be identified from the SW console without reading this table.
  if (!sameOrigin && CACHEABLE_HOSTS.indexOf(url.hostname) !== -1) {
    return { strategy: "network-first", cache: "api", reason: "catalogue host " + url.hostname };
  }
  if (!isGet) return { strategy: "passthrough", cache: null, reason: "non-GET" };
  if (!sameOrigin) {
    if (CACHEABLE_IMAGE_HOSTS.indexOf(url.hostname) !== -1 || request.destination === "image") {
      return { strategy: "cache-first", cache: "images", reason: "image host " + url.hostname };
    }
    return { strategy: "passthrough", cache: null, reason: "third party " + url.hostname };
  }
  if (url.pathname.indexOf("/api/") === 0) {
    const ok = PUBLIC_API_PREFIXES.some(function (p) {
      return url.pathname.indexOf(p) === 0;
    });
    return ok
      ? { strategy: "network-first", cache: "api", reason: "public api" }
      : { strategy: "passthrough", cache: null, reason: "private api - never cached" };
  }
  if (request.mode === "navigate") {
    return { strategy: "network-first", cache: "pages", reason: "navigation" };
  }
  if (url.pathname.indexOf("/_next/static/") === 0) {
    return { strategy: "cache-first", cache: "assets", reason: "hashed build asset" };
  }
  if (STATIC_PREFIXES.some(function (p) { return url.pathname.indexOf(p) === 0; })) {
    return { strategy: "cache-first", cache: "assets", reason: "static asset" };
  }
  if (EXACT_STATIC.indexOf(url.pathname) !== -1) {
    return { strategy: "cache-first", cache: "assets", reason: "static asset" };
  }
  return { strategy: "network-first", cache: "pages", reason: "same-origin page" };
}

self.addEventListener("install", function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHES.assets).then(function (cache) {
      // Individually, so one missing icon cannot fail the whole precache and
      // leave the site with no offline page at all.
      return Promise.all(
        PRECACHE.map(function (url) {
          return cache.add(new Request(url, { cache: "reload" })).catch(function () {});
        })
      );
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      var keep = Object.keys(CACHES).map(function (k) { return CACHES[k]; });
      return Promise.all(
        keys.filter(function (k) { return keep.indexOf(k) === -1; }).map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return evictStalePages();
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/**
 * Drop page shells that have aged out.
 *
 * Pages are not purged wholesale on activate: the old worker deleted every
 * navigation whenever the cache version changed, which was safe but meant a
 * user who visited twenty pages lost all of them on the next deploy. Keeping
 * recent ones is what makes "open my watchlist on the train" actually work.
 * Deploy safety still holds because this version's cache name is new, so old
 * HTML - which references now-deleted chunk hashes - is never served.
 */
function evictStalePages() {
  return caches.open(CACHES.pages).then(function (cache) {
    return cache.keys().then(function (requests) {
      var now = Date.now();
      var doomed = [];
      for (var i = 0; i < requests.length; i++) {
        var req = requests[i];
        var storedAt = Number(req.headers.get("sw-stored-at") || 0);
        if (!storedAt || now - storedAt > PAGE_MAX_AGE_MS) doomed.push(req);
      }
      return Promise.all(doomed.map(function (r) { return cache.delete(r); }));
    });
  });
}

function stamp(request) {
  var headers = new Headers(request.headers);
  headers.set("sw-stored-at", String(Date.now()));
  return new Request(request, { headers: headers });
}

function store(cacheName, request, response) {
  if (!response || !response.ok || response.type === "opaque") return Promise.resolve();
  var cache;
  return caches.open(cacheName).then(function (c) {
    cache = c;
    return cache.put(stamp(request), response.clone());
  }).then(function () {
    return cache.keys().then(function (keys) {
      var max = MAX_ENTRIES[cacheName];
      if (!max || keys.length <= max) return;
      // cache.keys() is insertion-ordered, so the head is the oldest write.
      var doomed = keys.slice(0, keys.length - max);
      return Promise.all(doomed.map(function (k) { return cache.delete(k); }));
    });
  }).catch(function () {});
}

function offlineFallback(_request) {
  // A failed navigation must still land on real HTML. The previous worker
  // returned a bare text/plain "Offline", which rendered as a blank page with no
  // way out and no styling.
  return caches.match("/offline").then(function (cached) {
    if (cached) return cached;
    return new Response(
      "<!doctype html><meta charset=utf-8><title>Offline</title>" +
        "<body style='background:#0a0a0f;color:#f0eef8;font-family:system-ui;padding:3rem'>" +
        "<h1>You are offline</h1><p>This page has not been saved for offline use yet.</p></body>",
      { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  });
}

function networkFirst(request, cacheName, isNavigation) {
  var timeout = isNavigation
    ? new Promise(function (resolve) { setTimeout(function () { resolve(null); }, NAV_TIMEOUT_MS); })
    : null;

  var run = fetch(request).then(function (response) {
    if (timeout) clearTimeout(timeout._timer);
    store(cacheName, request, response);
    return response;
  });

  var primary = timeout ? Promise.race([run, timeout]) : run;

  return primary
    .then(function (response) {
      if (response) return response;
      throw new Error("network timeout");
    })
    .catch(function () {
      return caches.match(request).then(function (cached) {
        if (cached) return cached;
        if (isNavigation) return offlineFallback(request);
        return new Response(JSON.stringify({ ok: false, offline: true }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        });
      });
    });
}

function cacheFirst(request, cacheName) {
  return caches.match(request).then(function (cached) {
    if (cached) return cached;
    return fetch(request)
      .then(function (response) {
        store(cacheName, request, response);
        return response;
      })
      .catch(function () {
        // A missing image should be an empty response the layout can tolerate,
        // not a JSON body that a broken <img> tries to parse.
        if (request.destination === "image") {
          return new Response("", { status: 504, statusText: "offline" });
        }
        return new Response(JSON.stringify({ ok: false, offline: true }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        });
      });
  });
}

self.addEventListener("fetch", function (event) {
  var request = event.request;
  var url = new URL(request.url);

  if (request.method !== "GET" && CACHEABLE_HOSTS.indexOf(url.hostname) === -1) return;

  var decision = classify(request, url, self.location.origin);

  // Flip to true when a request is not being cached and it is not obvious why.
  // The "reason" is what turns "my watchlist stopped loading offline" into a
  // one-line answer in the console.
  var DEBUG = false;
  if (DEBUG) console.log("[sw]", decision.strategy, decision.cache, decision.reason, url.pathname);

  if (decision.strategy === "passthrough") return;

  event.respondWith(
    decision.strategy === "cache-first"
      ? cacheFirst(request, CACHES[decision.cache])
      : networkFirst(request, CACHES[decision.cache], request.mode === "navigate")
  );
});

self.addEventListener("message", function (event) {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
  if (event.data === "OFFLINE_STATS") {
    event.waitUntil(
      Promise.all(
        Object.keys(CACHES).map(function (key) {
          return caches.open(CACHES[key]).then(function (cache) {
            return cache.keys().then(function (keys) { return keys.length; });
          }).then(function (n) { return { cache: key, entries: n }; });
        })
      ).then(function (rows) {
        if (event.source) event.source.postMessage({ type: "OFFLINE_STATS", caches: rows });
      })
    );
  }
});

// ── Web Push ────────────────────────────────────────────────────────────────
self.addEventListener("push", function (event) {
  var data = {};
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

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var link = (event.notification.data && event.notification.data.link) || "/";
  var url = new URL(link, self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if ("focus" in client) {
          client.navigate(url).catch(function () {});
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

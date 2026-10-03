import { describe, expect, it } from "vitest";
import {
  allCacheNames,
  cacheNameFor,
  decide,
  overflowToDelete,
  PUBLIC_API_PREFIXES,
  type DecideInput,
} from "@/lib/offline-policy";

const ORIGIN = "https://zyniverse.app";

function d(path: string, extra: Partial<DecideInput> = {}) {
  return decide({ url: new URL(path, ORIGIN), selfOrigin: ORIGIN, ...extra });
}

describe("decide: privacy rules first", () => {
  it("never caches per-user API routes", () => {
    // Regression guard. The previous worker cached every /api/ GET, which put
    // one user's watchlist and notifications in a cache the next person on the
    // device could read while offline.
    for (const p of [
      "/api/watchlist",
      "/api/watchlist/1",
      "/api/notifications",
      "/api/messages",
      "/api/user/settings",
      "/api/admin/users",
      "/api/blog",
      "/api/forum",
      "/api/upload",
    ]) {
      const out = d(p);
      expect(out.strategy, `${p} must not be cached`).toBe("passthrough");
      expect(out.cache).toBeNull();
    }
  });

  it("does not cache a private route even when it is a navigation-like GET", () => {
    expect(d("/api/watchlist", { mode: "navigate" }).strategy).toBe("passthrough");
  });

  it("caches the public catalogue API", () => {
    const out = d("/api/anilist/trending?perPage=18");
    expect(out.strategy).toBe("network-first");
    expect(out.cache).toBe("api");
  });

  it("caches public search", () => {
    expect(d("/api/search/semantic?q=isekai").strategy).toBe("network-first");
    expect(d("/api/search/unified?q=naruto").cache).toBe("api");
  });

  it("keeps the allowlist explicit and non-empty", () => {
    expect(PUBLIC_API_PREFIXES.length).toBeGreaterThan(0);
    for (const p of PUBLIC_API_PREFIXES) expect(p.startsWith("/api/")).toBe(true);
  });

  it("is not fooled by a private route that merely contains an allowed name", () => {
    expect(d("/api/anilist/../watchlist").strategy).toBe("passthrough");
    expect(d("/api/searchx/thing").strategy).toBe("passthrough");
  });
});

describe("decide: writes", () => {
  it("passes through every non-GET method", () => {
    for (const method of ["POST", "PUT", "PATCH", "DELETE", "HEAD"]) {
      const out = d("/api/blog", { method });
      expect(out.strategy, method).toBe("passthrough");
      expect(out.cache).toBeNull();
    }
  });

  it("never caches a write to a public API path either", () => {
    expect(d("/api/anilist/anything", { method: "POST" }).strategy).toBe("passthrough");
  });
});

describe("decide: navigations", () => {
  it("uses network-first for page navigations", () => {
    const out = d("/anime/20", { mode: "navigate" });
    expect(out.strategy).toBe("network-first");
    expect(out.cache).toBe("pages");
  });

  it("caches hashed build assets cache-first", () => {
    const out = d("/_next/static/chunks/main-abc123.js");
    expect(out.strategy).toBe("cache-first");
    expect(out.cache).toBe("assets");
  });
});

describe("decide: static assets", () => {
  it("caches the offline page and icons cache-first", () => {
    for (const p of ["/offline", "/manifest.json", "/icons/icon-192.png", "/logo.png"]) {
      expect(d(p).strategy, p).toBe("cache-first");
      expect(d(p).cache, p).toBe("assets");
    }
  });
});

describe("decide: third party", () => {
  it("caches the AniList GraphQL host network-first", () => {
    const out = decide({
      url: new URL("https://graphql.anilist.co/"),
      selfOrigin: ORIGIN,
      method: "POST",
    });
    // POST to the catalogue is how AniList queries work; it is public data and
    // safe to keep offline even though it is not a GET.
    expect(out.cache).toBe("api");
  });

  it("caches known image hosts cache-first", () => {
    const out = decide({
      url: new URL("https://s4.anilist.co/file/x.jpg"),
      selfOrigin: ORIGIN,
    });
    expect(out.strategy).toBe("cache-first");
    expect(out.cache).toBe("images");
  });

  it("passes through unknown third parties", () => {
    const out = decide({ url: new URL("https://tracker.example.com/pixel.gif"), selfOrigin: ORIGIN });
    expect(out.strategy).toBe("passthrough");
    expect(out.cache).toBeNull();
  });
});

describe("cacheNameFor", () => {
  it("versions the name", () => {
    expect(cacheNameFor("pages", "v6")).toBe("pages-v6");
  });

  it("returns null for a non-cached decision", () => {
    expect(cacheNameFor(null, "v6")).toBeNull();
  });

  it("lists one versioned name per logical cache", () => {
    expect(allCacheNames("v6")).toEqual(["pages-v6", "assets-v6", "api-v6", "images-v6"]);
  });
});

describe("overflowToDelete", () => {
  it("deletes nothing while under the cap", () => {
    expect(overflowToDelete(["a", "b"], 3)).toEqual([]);
  });

  it("deletes nothing when exactly at the cap", () => {
    expect(overflowToDelete(["a", "b", "c"], 3)).toEqual([]);
  });

  it("evicts oldest-first once over", () => {
    // Cache.keys() is insertion-ordered, so index 0 is the oldest entry.
    expect(overflowToDelete(["a", "b", "c", "d"], 2)).toEqual(["a", "b"]);
  });

  it("evicts everything when the cap is zero", () => {
    expect(overflowToDelete(["a", "b"], 0)).toEqual(["a", "b"]);
  });

  it("never returns more keys than exist", () => {
    const keys = ["a", "b", "c"];
    expect(overflowToDelete(keys, 1)).toHaveLength(2);
    expect(overflowToDelete(keys, 1).every((k) => keys.includes(k))).toBe(true);
  });
});
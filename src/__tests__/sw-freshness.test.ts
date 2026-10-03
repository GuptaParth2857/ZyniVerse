import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import {
  CACHEABLE_HOSTS,
  CACHEABLE_IMAGE_HOSTS,
  MAX_ENTRIES,
  PAGE_MAX_AGE_MS,
  PUBLIC_API_PREFIXES,
  decide,
  type DecideInput,
} from "@/lib/offline-policy";
import { renderWorker } from "../../scripts/build-sw";

const ORIGIN = "https://zyniverse.app";

/**
 * `public/sw.js` is served verbatim to the browser and cannot import from
 * `@/lib`, so the routing table inside it is a copy of `decide()`. These tests
 * exist so that copy cannot quietly rot.
 *
 * Byte-comparing the generated file to the committed one catches a forgotten
 * `npm run build:sw`. Extracting `classify` from the generated text and running
 * it against `decide()` catches the worse case: the file was regenerated, but
 * the copy inside it had already drifted from the source of truth.
 */

type Decider = (
  request: { method: string; mode: string; destination: string; headers: { get(): null } },
  url: URL,
  selfOrigin: string
) => { strategy: string; cache: string | null };

function generatedClassify(source: string): Decider {
  // Everything above the first event listener is constants plus classify(),
  // and depends on no browser globals - so it can be evaluated in isolation.
  const cut = source.indexOf('self.addEventListener("install"');
  if (cut === -1) throw new Error("could not locate the start of the worker's event handlers");
  const head = source.slice(0, cut);

  const build = new Function(
    "self",
    "caches",
    "Headers",
    "Request",
    "Response",
    "URL",
    `${head}\nreturn classify;`
  );
  return build(
    {},
    { open: () => undefined, match: () => undefined, keys: () => undefined },
    class {},
    class {},
    class {},
    URL
  ) as Decider;
}

const workerSource = readFileSync(join(process.cwd(), "public", "sw.js"), "utf8");
const classify = generatedClassify(workerSource);

interface Case {
  path: string;
  method?: string;
  mode?: string;
  destination?: string;
}

const CASES: Case[] = [
  // Privacy-relevant routes must stay uncached on both sides.
  { path: "/api/watchlist" },
  { path: "/api/watchlist/12345" },
  { path: "/api/notifications" },
  { path: "/api/messages/42" },
  { path: "/api/user/settings" },
  { path: "/api/admin/users" },
  { path: "/api/upload" },
  { path: "/api/ai/chat", method: "POST" },
  // Public API.
  { path: "/api/anilist/trending?perPage=18" },
  { path: "/api/anilist/characters?q=gojo&perPage=6" },
  { path: "/api/search/semantic?q=isekai" },
  { path: "/api/search/unified?q=naruto" },
  // Navigations and pages.
  { path: "/", mode: "navigate" },
  { path: "/anime/20", mode: "navigate" },
  { path: "/graph", mode: "navigate" },
  { path: "/search/semantic", mode: "navigate" },
  // Build assets and static files.
  { path: "/_next/static/chunks/main-abc123.js" },
  { path: "/_next/static/css/def.css" },
  { path: "/manifest.json" },
  { path: "/offline" },
  { path: "/logo.png" },
  { path: "/icons/icon-192.png" },
  { path: "/fonts/inter.woff2" },
  // Edge shapes.
  { path: "/api", mode: "navigate" },
  { path: "/api/", mode: "navigate" },
  { path: "/api/searchx/thing" },
  { path: "/api/anilist/../watchlist" },
  { path: "/discover", method: "HEAD" },
  { path: "/wiki/isekai", mode: "navigate" },
];

const HOST_CASES: Case[] = [
  { path: "https://graphql.anilist.co/", method: "POST" },
  { path: "https://s4.anilist.co/file/anic.jpg", destination: "image" },
  { path: "https://img.anilist.co/x.jpg" },
  { path: "https://cdn.myanimelist.net/y.jpg" },
  { path: "https://tracker.example.com/pixel.gif", destination: "image" },
  { path: "https://fonts.gstatic.com/s/inter.woff2" },
];

function normalise(input: Case) {
  const url = new URL(input.path, input.path.startsWith("http") ? undefined : ORIGIN);
  const method = input.method ?? "GET";
  const mode = input.mode ?? "no-cors";
  const destination = input.destination ?? "";
  return {
    url,
    policy: decide({ url, selfOrigin: ORIGIN, method, mode, destination } as DecideInput),
    request: { method, mode, destination, headers: { get: () => null } },
  };
}

describe("generated worker matches the committed file", () => {
  it("is up to date with the generator", () => {
    const expected = renderWorker();
    const normalise_ = (s: string) => s.replace(/\r\n/g, "\n").trimEnd();
    expect(
      normalise_(workerSource),
      "public/sw.js is stale - run `npm run build:sw`"
    ).toBe(normalise_(expected));
  });

  it("carries the policy constants through to the worker", () => {
    // If these drift, the worker caches things the policy says are private.
    expect(workerSource).toContain(JSON.stringify([...PUBLIC_API_PREFIXES]));
    expect(workerSource).toContain(JSON.stringify([...CACHEABLE_HOSTS]));
    expect(workerSource).toContain(JSON.stringify([...CACHEABLE_IMAGE_HOSTS]));
    expect(workerSource).toContain(JSON.stringify(MAX_ENTRIES));
    expect(workerSource).toContain(String(PAGE_MAX_AGE_MS));
  });

  it("names any private API route it might intercept, so it is auditable", () => {
    // The allowlist is the only thing standing between a user's watchlist and
    // the next person on the device, so its size should be obvious in review.
    expect(workerSource).toContain("private api - never cached");
    const allowlist = workerSource.match(/PUBLIC_API_PREFIXES = (\[[^\]]*\])/);
    expect(allowlist).not.toBeNull();
    expect(JSON.parse(allowlist![1])).toEqual([...PUBLIC_API_PREFIXES]);
  });
});

describe("generated classify() agrees with decide()", () => {
  for (const c of CASES) {
    it(`same verdict for ${c.method ?? "GET"} ${c.path}${c.mode ? ` (${c.mode})` : ""}`, () => {
      const { policy, request, url } = normalise(c);
      const fromWorker = classify(request, url, ORIGIN);
      expect(
        `${fromWorker.strategy}/${fromWorker.cache}`,
        `worker disagreed with policy on ${c.path}`
      ).toBe(`${policy.strategy}/${policy.cache}`);
    });
  }

  for (const c of HOST_CASES) {
    it(`same verdict for ${c.path}`, () => {
      const { policy, request, url } = normalise(c);
      const fromWorker = classify(request, url, ORIGIN);
      expect(
        `${fromWorker.strategy}/${fromWorker.cache}`,
        `worker disagreed with policy on ${c.path}`
      ).toBe(`${policy.strategy}/${policy.cache}`);
    });
  }

  it("keeps every per-user route uncached in the worker too", () => {
    // A direct assertion on the emitted behaviour, so a future edit to either
    // side that caches /api/watchlist fails here rather than in production.
    for (const p of ["/api/watchlist", "/api/notifications", "/api/messages", "/api/user/settings"]) {
      const url = new URL(p, ORIGIN);
      const out = classify({ method: "GET", mode: "cors", destination: "", headers: { get: () => null } }, url, ORIGIN);
      expect(out.strategy, `${p} must not be cached`).toBe("passthrough");
      expect(out.cache).toBeNull();
    }
  });
});

describe("generated worker is syntactically loadable", () => {
  it("parses as a script", () => {
    // A syntax error in sw.js is invisible to every other check here and would
    // leave the site silently without a worker.
    expect(() => new Function(`return (function(){ ${workerSource.replace(/^\/\/.*$/gm, "")} })`)).not.toThrow();
  });

  it("declares the four versioned caches", () => {
    for (const key of ["pages", "assets", "api", "images"]) {
      expect(workerSource).toMatch(new RegExp(`${key}: "${key}-" \\+ VERSION`));
    }
  });
});
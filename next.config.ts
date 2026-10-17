import type { NextConfig } from "next";
import { EventEmitter } from "events";

// Home page fires many parallel compressed responses; Next's server Gzip
// streams hit Node's default 10-listener cap and emit a benign
// MaxListenersExceededWarning. Raise it here so it covers the `next dev`
// process too (production already does this in server.ts).
EventEmitter.defaultMaxListeners = 50;

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "sharp"],
  // output: "export",  // REMOVED to fix ISR writes overage
  // This was causing ISR writes exceeding free tier limits (1.2M vs 200K)
  // Normal serverless function mode will reduce Vercel usage
  async headers() {
    return [
      // No Cache-Control rule for /_next/static here on purpose. Next only
      // applies its own asset cache header when one isn't already set:
      //   production -> `public, max-age=31536000, immutable`
      //   dev        -> `no-cache, must-revalidate`
      // A custom rule short-circuits that check, so dev builds got pinned to a
      // 1-year cache and served stale chunks on reload.
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Keep only legitimate redirects - no wildcard homepage redirects
      {
        source: "/dub-schedule",
        destination: "/dubbed",
        permanent: true,
      },
      {
        source: "/calendar",
        destination: "/schedule",
        permanent: true,
      },
      // Old /browse route -> /search. Still linked from genre empty-states,
      // so without this the internal link 404s.
      {
        source: "/browse",
        destination: "/search",
        permanent: true,
      },
      // Old locale-prefix routes (Hindi/Telugu/Tamil) - 301 to homepage so Google
      // consolidates instead of logging permanent 404s.
      {
        source: "/hi",
        destination: "/",
        permanent: true,
      },
      {
        source: "/te",
        destination: "/",
        permanent: true,
      },
      {
        source: "/ta",
        destination: "/",
        permanent: true,
      },
      // www -> non-www canonicalisation (301, path preserved).
      // Canonical <link> already points to the non-www host, but Google was
      // still crawling the www copies separately (both appear in Search
      // Console). A real 301 is the correct signal to consolidate them.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.zyverse.in" }],
        destination: "https://zyverse.in/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "img.anili.st" },
      { protocol: "https", hostname: "s4.anilist.co" },
      { protocol: "https", hostname: "cdn.myanimelist.net" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "placewaifu.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
    proxyClientMaxBodySize: "250mb",
  },
};

export default nextConfig;

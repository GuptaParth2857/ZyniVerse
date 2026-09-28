import type { NextConfig } from "next";
import { EventEmitter } from "events";

// Home page fires many parallel compressed responses; Next's server Gzip
// streams hit Node's default 10-listener cap and emit a benign
// MaxListenersExceededWarning. Raise it here so it covers the `next dev`
// process too (production already does this in server.ts).
EventEmitter.defaultMaxListeners = 50;

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
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
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.zyverse.in" }],
        destination: "https://zyverse.in/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.zyniverse.vercel.app" }],
        destination: "https://zyverse.in/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "zyniverse.vercel.app" }],
        destination: "https://zyverse.in/:path*",
        permanent: true,
      },
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
      {
        source: "/browse",
        destination: "/search",
        permanent: true,
      },
      // Old locale-prefix routes (Hindi/Telugu/Tamil) existed in an earlier
      // build. Pages are gone for good; 301 them to the homepage so Google
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

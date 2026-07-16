import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: !process.env.VERCEL && process.env.NODE_ENV === "production" ? "standalone" : undefined,
  serverExternalPackages: ["@prisma/client"],
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
        source: "/critiques",
        destination: "/community?tab=critiques",
        permanent: true,
      },
      {
        source: "/dub-schedule",
        destination: "/dubbed",
        permanent: true,
      },
      {
        source: "/compare",
        destination: "/search",
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
    ];
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
};

export default nextConfig;

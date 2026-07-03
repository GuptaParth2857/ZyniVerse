import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
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
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s4.anilist.co",
      },
      {
        protocol: "https",
        hostname: "artworks.thetvdb.com",
      },
      {
        protocol: "https",
        hostname: "img.anili.st",
      },
    ],
  },
};

export default nextConfig;

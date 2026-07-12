import { prisma } from "./prisma";

export interface AdPlacement {
  id: string;
  type: "native" | "banner" | "sidebar" | "in-content" | "footer";
  network: "adsterra" | "direct";
  code: string;
  location: string;
  isActive: boolean;
  dimensions?: { width: number; height: number };
}

const PLACEMENTS: AdPlacement[] = [
  {
    id: "homepage-banner",
    type: "banner",
    network: "adsterra",
    code: `<script>atOptions={'key':'e80028b0207a45ef76bfc3d9d4a0fe9e','format':'iframe','height':90,'width':728,'params':{}};</script><script src="https://www.highperformanceformat.com/e80028b0207a45ef76bfc3d9d4a0fe9e/invoke.js"></script>`,
    location: "homepage",
    isActive: true,
    dimensions: { width: 728, height: 90 },
  },
  {
    id: "anime-sidebar",
    type: "sidebar",
    network: "adsterra",
    code: `<script>atOptions={'key':'72dd20ad744b4f992e4e2121cfa47172','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highperformanceformat.com/72dd20ad744b4f992e4e2121cfa47172/invoke.js"></script>`,
    location: "anime-detail",
    isActive: true,
    dimensions: { width: 300, height: 250 },
  },
  {
    id: "search-sidebar",
    type: "sidebar",
    network: "adsterra",
    code: `<script>atOptions={'key':'72dd20ad744b4f992e4e2121cfa47172','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highperformanceformat.com/72dd20ad744b4f992e4e2121cfa47172/invoke.js"></script>`,
    location: "search",
    isActive: true,
    dimensions: { width: 300, height: 250 },
  },
  {
    id: "browse-sidebar",
    type: "sidebar",
    network: "adsterra",
    code: `<script>atOptions={'key':'72dd20ad744b4f992e4e2121cfa47172','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highperformanceformat.com/72dd20ad744b4f992e4e2121cfa47172/invoke.js"></script>`,
    location: "browse",
    isActive: true,
    dimensions: { width: 300, height: 250 },
  },
  {
    id: "footer-banner",
    type: "footer",
    network: "adsterra",
    code: `<script>atOptions={'key':'e80028b0207a45ef76bfc3d9d4a0fe9e','format':'iframe','height':90,'width':728,'params':{}};</script><script src="https://www.highperformanceformat.com/e80028b0207a45ef76bfc3d9d4a0fe9e/invoke.js"></script>`,
    location: "global-footer",
    isActive: true,
    dimensions: { width: 728, height: 90 },
  },
  {
    id: "filler-banner",
    type: "in-content",
    network: "adsterra",
    code: `<script>atOptions={'key':'e80028b0207a45ef76bfc3d9d4a0fe9e','format':'iframe','height':90,'width':728,'params':{}};</script><script src="https://www.highperformanceformat.com/e80028b0207a45ef76bfc3d9d4a0fe9e/invoke.js"></script>`,
    location: "filler",
    isActive: true,
    dimensions: { width: 728, height: 90 },
  },
  {
    id: "manga-sidebar",
    type: "sidebar",
    network: "adsterra",
    code: `<script>atOptions={'key':'72dd20ad744b4f992e4e2121cfa47172','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highperformanceformat.com/72dd20ad744b4f992e4e2121cfa47172/invoke.js"></script>`,
    location: "manga",
    isActive: true,
    dimensions: { width: 300, height: 250 },
  },
  {
    id: "recommendations-banner",
    type: "in-content",
    network: "adsterra",
    code: `<script>atOptions={'key':'e80028b0207a45ef76bfc3d9d4a0fe9e','format':'iframe','height':90,'width':728,'params':{}};</script><script src="https://www.highperformanceformat.com/e80028b0207a45ef76bfc3d9d4a0fe9e/invoke.js"></script>`,
    location: "recommendations",
    isActive: true,
    dimensions: { width: 728, height: 90 },
  },
  {
    id: "wiki-sidebar",
    type: "sidebar",
    network: "adsterra",
    code: `<script>atOptions={'key':'72dd20ad744b4f992e4e2121cfa47172','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highperformanceformat.com/72dd20ad744b4f992e4e2121cfa47172/invoke.js"></script>`,
    location: "wiki",
    isActive: true,
    dimensions: { width: 300, height: 250 },
  },
  {
    id: "forum-banner",
    type: "banner",
    network: "adsterra",
    code: `<script>atOptions={'key':'e80028b0207a45ef76bfc3d9d4a0fe9e','format':'iframe','height':90,'width':728,'params':{}};</script><script src="https://www.highperformanceformat.com/e80028b0207a45ef76bfc3d9d4a0fe9e/invoke.js"></script>`,
    location: "forum",
    isActive: true,
    dimensions: { width: 728, height: 90 },
  },
];

export function getAdsForLocation(pageType: string): AdPlacement[] {
  return PLACEMENTS.filter((a) => a.location === pageType && a.isActive);
}

export function getAdScript(placement: AdPlacement): string {
  return placement.code;
}

export function shouldShowAds(user?: { premium?: boolean; id?: string }): boolean {
  if (!user) return true;
  if (user.premium) return false;
  return true;
}

export async function shouldShowAdsForUser(userId?: string | null): Promise<boolean> {
  if (!userId) return true;
  try {
    const sub = await prisma.subscription.findUnique({
      where: { userId },
      select: { plan: true, status: true },
    });
    if (sub && sub.plan !== "free" && sub.status === "active") return false;
  } catch {}
  return true;
}

export const AD_TRACKING_PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

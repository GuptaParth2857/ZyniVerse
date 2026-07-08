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
    code: `<script>atOptions={'key':'d37d520d1e78f4f003c158107909b951','format':'iframe','height':90,'width':728,'params':{}};</script><script src="https://www.highperformanceformat.com/d37d520d1e78f4f003c158107909b951/invoke.js"></script>`,
    location: "homepage",
    isActive: true,
    dimensions: { width: 728, height: 90 },
  },
  {
    id: "anime-sidebar",
    type: "sidebar",
    network: "adsterra",
    code: `<script>atOptions={'key':'31bbfd523500057c0e9851cd325de22d','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highperformanceformat.com/31bbfd523500057c0e9851cd325de22d/invoke.js"></script>`,
    location: "anime-detail",
    isActive: true,
    dimensions: { width: 300, height: 250 },
  },
  {
    id: "search-sidebar",
    type: "sidebar",
    network: "adsterra",
    code: `<script>atOptions={'key':'31bbfd523500057c0e9851cd325de22d','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highperformanceformat.com/31bbfd523500057c0e9851cd325de22d/invoke.js"></script>`,
    location: "search",
    isActive: true,
    dimensions: { width: 300, height: 250 },
  },
  {
    id: "browse-sidebar",
    type: "sidebar",
    network: "adsterra",
    code: `<script>atOptions={'key':'31bbfd523500057c0e9851cd325de22d','format':'iframe','height':250,'width':300,'params':{}};</script><script src="https://www.highperformanceformat.com/31bbfd523500057c0e9851cd325de22d/invoke.js"></script>`,
    location: "browse",
    isActive: true,
    dimensions: { width: 300, height: 250 },
  },
  {
    id: "footer-banner",
    type: "footer",
    network: "adsterra",
    code: `<script>atOptions={'key':'d37d520d1e78f4f003c158107909b951','format':'iframe','height':90,'width':728,'params':{}};</script><script src="https://www.highperformanceformat.com/d37d520d1e78f4f003c158107909b951/invoke.js"></script>`,
    location: "global-footer",
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

import { prisma } from "./prisma";

export interface AdPlacement {
  id: string;
  type: "native" | "banner" | "sidebar" | "in-content" | "footer";
  network: "adsterra" | "adsense" | "direct";
  code: string;
  location: string;
  isActive: boolean;
  dimensions?: { width: number; height: number };
}

const PLACEMENTS: AdPlacement[] = [
  {
    id: "adsterra-300x250",
    type: "banner",
    network: "adsterra",
    location: "sidebar",
    isActive: true,
    dimensions: { width: 300, height: 250 },
    code: `<div style="display:flex;justify-content:center;"><script>window.atOptions={key:'72dd20ad744b4f992e4e2121cfa47172',format:'iframe',height:250,width:300,params:{}};</script><script src="https://www.highperformanceformat.com/72dd20ad744b4f992e4e2121cfa47172/invoke.js"></script></div>`,
  },
  {
    id: "adsterra-728x90",
    type: "banner",
    network: "adsterra",
    location: "banner",
    isActive: true,
    dimensions: { width: 728, height: 90 },
    code: `<div style="display:flex;justify-content:center;"><script>window.atOptions={key:'e80028b0207a45ef76bfc3d9d4a0fe9e',format:'iframe',height:90,width:728,params:{}};</script><script src="https://www.highperformanceformat.com/e80028b0207a45ef76bfc3d9d4a0fe9e/invoke.js"></script></div>`,
  },
  {
    id: "adsterra-native",
    type: "native",
    network: "adsterra",
    location: "native",
    isActive: true,
    code: `<script async data-cfasync="false" src="https://pl30334079.effectivecpmnetwork.com/188115be46209eff2403f0d29b32d940/invoke.js"></script><div id="container-188115be46209eff2403f0d29b32d940"></div>`,
  },
];

const LOCATION_MAP: Record<string, string> = {
  "homepage": "banner",
  "forum": "banner",
  "filler": "banner",
  "global-footer": "banner",
  "anime-detail": "sidebar",
  "manga": "sidebar",
  "search": "sidebar",
  "wiki": "sidebar",
  "recommendations": "native",
};

export function getAdsForLocation(pageType: string): AdPlacement[] {
  const mapped = LOCATION_MAP[pageType] || pageType;
  return PLACEMENTS.filter((a) => a.location === mapped && a.isActive);
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

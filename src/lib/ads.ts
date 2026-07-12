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

const PLACEMENTS: AdPlacement[] = [];

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

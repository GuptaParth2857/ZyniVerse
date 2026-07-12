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
    id: "homepage-banner",
    type: "banner",
    network: "adsense",
    code: `<ins class="adsbygoogle" style="display:inline-block;width:728px;height:90px" data-ad-client="ca-pub-5241033119281791" data-ad-slot="HOMESLOT"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`,
    location: "homepage",
    isActive: true,
    dimensions: { width: 728, height: 90 },
  },
  {
    id: "anime-sidebar",
    type: "sidebar",
    network: "adsense",
    code: `<ins class="adsbygoogle" style="display:inline-block;width:300px;height:250px" data-ad-client="ca-pub-5241033119281791" data-ad-slot="ANIMESLOT"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`,
    location: "anime-detail",
    isActive: true,
    dimensions: { width: 300, height: 250 },
  },
  {
    id: "search-sidebar",
    type: "sidebar",
    network: "adsense",
    code: `<ins class="adsbygoogle" style="display:inline-block;width:300px;height:250px" data-ad-client="ca-pub-5241033119281791" data-ad-slot="SEARCHSLOT"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`,
    location: "search",
    isActive: true,
    dimensions: { width: 300, height: 250 },
  },
  {
    id: "browse-sidebar",
    type: "sidebar",
    network: "adsense",
    code: `<ins class="adsbygoogle" style="display:inline-block;width:300px;height:250px" data-ad-client="ca-pub-5241033119281791" data-ad-slot="BROWSESLOT"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`,
    location: "browse",
    isActive: true,
    dimensions: { width: 300, height: 250 },
  },
  {
    id: "footer-banner",
    type: "footer",
    network: "adsense",
    code: `<ins class="adsbygoogle" style="display:inline-block;width:728px;height:90px" data-ad-client="ca-pub-5241033119281791" data-ad-slot="FOOTERSLOT"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`,
    location: "global-footer",
    isActive: true,
    dimensions: { width: 728, height: 90 },
  },
  {
    id: "filler-banner",
    type: "in-content",
    network: "adsense",
    code: `<ins class="adsbygoogle" style="display:inline-block;width:728px;height:90px" data-ad-client="ca-pub-5241033119281791" data-ad-slot="FILLERSLOT"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`,
    location: "filler",
    isActive: true,
    dimensions: { width: 728, height: 90 },
  },
  {
    id: "manga-sidebar",
    type: "sidebar",
    network: "adsense",
    code: `<ins class="adsbygoogle" style="display:inline-block;width:300px;height:250px" data-ad-client="ca-pub-5241033119281791" data-ad-slot="MANGASLOT"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`,
    location: "manga",
    isActive: true,
    dimensions: { width: 300, height: 250 },
  },
  {
    id: "recommendations-banner",
    type: "in-content",
    network: "adsense",
    code: `<ins class="adsbygoogle" style="display:inline-block;width:728px;height:90px" data-ad-client="ca-pub-5241033119281791" data-ad-slot="RECSLOT"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`,
    location: "recommendations",
    isActive: true,
    dimensions: { width: 728, height: 90 },
  },
  {
    id: "wiki-sidebar",
    type: "sidebar",
    network: "adsense",
    code: `<ins class="adsbygoogle" style="display:inline-block;width:300px;height:250px" data-ad-client="ca-pub-5241033119281791" data-ad-slot="WIKISLOT"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`,
    location: "wiki",
    isActive: true,
    dimensions: { width: 300, height: 250 },
  },
  {
    id: "forum-banner",
    type: "banner",
    network: "adsense",
    code: `<ins class="adsbygoogle" style="display:inline-block;width:728px;height:90px" data-ad-client="ca-pub-5241033119281791" data-ad-slot="FORUMSLOT"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`,
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

import { prisma } from "./prisma";

export interface AdPlacement {
  id: string;
  type: "native" | "banner" | "sidebar" | "in-content" | "footer" | "socialbar";
  network: "adsterra" | "adsense" | "direct";
  code: string;
  location: string;
  isActive: boolean;
  dimensions?: { width: number; height: number };
  /** How to inject the ad script */
  renderMode?: "iframe-sync" | "native-async" | "socialbar-sync" | "raw";
}

// ─── Adsterra Ad Placements ────────────────────────────────────────────────
//
//  300×250  →  iframe-sync  →  shown as sidebar / in-content ads
//  728×90   →  iframe-sync  →  shown as leaderboard banner
//  NativeBanner → native-async → shown between content blocks
//  SocialBar    → socialbar-sync → sitewide floating widget
//
const PLACEMENTS: AdPlacement[] = [
  // ── 300×250 Medium Rectangle (sidebar / in-content) ───────────────────
  {
    id: "adsterra-300x250",
    type: "sidebar",
    network: "adsterra",
    renderMode: "iframe-sync",
    code: `<script>
  atOptions = {
    'key' : '72dd20ad744b4f992e4e2121cfa47172',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script src="https://formssternlystately.com/72dd20ad744b4f992e4e2121cfa47172/invoke.js"></script>`,
    location: "sidebar",        // matches: sidebar, manga, wiki, search, anime-detail
    isActive: true,
    dimensions: { width: 300, height: 250 },
  },
  // ── 728×90 Leaderboard (header / footer banners) ──────────────────────
  {
    id: "adsterra-728x90",
    type: "banner",
    network: "adsterra",
    renderMode: "iframe-sync",
    code: `<script>
  atOptions = {
    'key' : 'e80028b0207a45ef76bfc3d9d4a0fe9e',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
</script>
<script src="https://formssternlystately.com/e80028b0207a45ef76bfc3d9d4a0fe9e/invoke.js"></script>`,
    location: "banner",         // matches: homepage, filler, forum, global-footer, recommendations
    isActive: true,
    dimensions: { width: 728, height: 90 },
  },
  // ── Native Banner (in-content, between sections) ──────────────────────
  {
    id: "adsterra-native",
    type: "native",
    network: "adsterra",
    renderMode: "native-async",
    code: `<script async="async" data-cfasync="false" src="https://formssternlystately.com/188115be46209eff2403f0d29b32d940/invoke.js"></script>
<div id="container-188115be46209eff2403f0d29b32d940"></div>`,
    location: "native",         // matches: in-content placements
    isActive: true,
  },
  // ── Social Bar (sitewide floating) ────────────────────────────────────
  {
    id: "adsterra-socialbar",
    type: "socialbar",
    network: "adsterra",
    renderMode: "socialbar-sync",
    code: `<script src="https://formssternlystately.com/79/88/46/798846c18dea1cf9f50c54e73acf1380.js"></script>`,
    location: "global",
    isActive: true,
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Returns the best ad placement for a given page location key.
 *
 * Location keys used in the codebase:
 *   "homepage"        → banner (728×90)
 *   "filler"          → banner (728×90)
 *   "global-footer"   → banner (728×90)
 *   "forum"           → banner (728×90)
 *   "recommendations" → banner (728×90)
 *   "search"          → sidebar (300×250)
 *   "wiki"            → sidebar (300×250)
 *   "manga"           → sidebar (300×250)
 *   "manga-detail"    → sidebar (300×250)
 *   "anime-detail"    → sidebar (300×250)
 *   "in-content"      → native banner
 *   "global"          → social bar
 */
export function getAdsForLocation(pageType: string): AdPlacement[] {
  // Map legacy location names to canonical location keys
  const sidebarPages = ["search", "wiki", "manga", "manga-detail", "anime-detail"];
  const bannerPages  = ["homepage", "filler", "global-footer", "forum", "recommendations", "banner"];

  let canonicalLocation = pageType;
  if (sidebarPages.includes(pageType)) canonicalLocation = "sidebar";
  if (bannerPages.includes(pageType))  canonicalLocation = "banner";

  return PLACEMENTS.filter((a) => a.location === canonicalLocation && a.isActive);
}

export function getNativeAd(): AdPlacement | undefined {
  return PLACEMENTS.find((a) => a.id === "adsterra-native" && a.isActive);
}

export function getSocialBarAd(): AdPlacement | undefined {
  return PLACEMENTS.find((a) => a.id === "adsterra-socialbar" && a.isActive);
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

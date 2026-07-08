export interface AffiliatePartner {
  id: string;
  name: string;
  baseUrl: string;
  commissionRate: number;
  cookieDays: number;
  programType: "subscription" | "purchase" | "lead";
  region: string[];
}

export interface AffiliateLink {
  url: string;
  partner: string;
  commission: number;
  isActive: boolean;
}

export const AFFILIATE_PARTNERS: AffiliatePartner[] = [
  {
    id: "crunchyroll",
    name: "Crunchyroll",
    baseUrl: "https://www.crunchyroll.com",
    commissionRate: 10,
    cookieDays: 30,
    programType: "subscription",
    region: ["US", "UK", "CA", "AU", "EU"],
  },
  {
    id: "amazon",
    name: "Amazon",
    baseUrl: "https://www.amazon.com",
    commissionRate: 4,
    cookieDays: 24,
    programType: "purchase",
    region: ["US", "UK", "CA", "DE", "FR", "JP"],
  },
  {
    id: "cdjapan",
    name: "CDJapan",
    baseUrl: "https://www.cdjapan.co.jp",
    commissionRate: 5,
    cookieDays: 30,
    programType: "purchase",
    region: ["WW"],
  },
  {
    id: "playasia",
    name: "PlayAsia",
    baseUrl: "https://www.play-asia.com",
    commissionRate: 5,
    cookieDays: 30,
    programType: "purchase",
    region: ["WW"],
  },
  {
    id: "bookwalker",
    name: "BookWalker",
    baseUrl: "https://global.bookwalker.jp",
    commissionRate: 5,
    cookieDays: 30,
    programType: "purchase",
    region: ["US", "UK", "EU"],
  },
];

export function getAffiliateLink(partner: string, path: string, params?: Record<string, string>): string {
  const partnerConfig = AFFILIATE_PARTNERS.find((p) => p.id === partner);
  if (!partnerConfig) return path;

  const base = `${partnerConfig.baseUrl}${path}`;
  const url = new URL(base);

  url.searchParams.set("ref", "zyniverse");

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  if (partnerConfig.id === "amazon") {
    url.searchParams.set("tag", "zyniverse-21");
  }

  return url.toString();
}

export function getBestPartner(region: string, type: string): AffiliatePartner {
  const candidates = AFFILIATE_PARTNERS.filter(
    (p) =>
      p.programType === type &&
      (p.region.includes(region) || p.region.includes("WW"))
  );
  return candidates.sort((a, b) => b.commissionRate - a.commissionRate)[0] || AFFILIATE_PARTNERS[0];
}

export async function trackClick(partner: string, page: string, userId?: string): Promise<void> {
  try {
    await fetch("/api/affiliate/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partner, page, userId }),
    });
  } catch {}
}

export async function getAffiliateEarnings(startDate?: Date, endDate?: Date): Promise<{ clicks: number; estimatedRevenue: number }> {
  const params = new URLSearchParams();
  if (startDate) params.set("start", startDate.toISOString());
  if (endDate) params.set("end", endDate.toISOString());

  try {
    const res = await fetch(`/api/affiliate/stats?${params.toString()}`);
    if (!res.ok) return { clicks: 0, estimatedRevenue: 0 };
    return await res.json();
  } catch {
    return { clicks: 0, estimatedRevenue: 0 };
  }
}

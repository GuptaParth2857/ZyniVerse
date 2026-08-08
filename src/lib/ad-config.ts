import { prisma } from "./prisma";
import { logError } from "@/lib/logger";
import { PLACEMENTS, adConfigToPlacement, type AdPlacement } from "./ads";

/** Reads the live ad config from the DB, seeded from the static defaults. */
export async function getLiveAdConfig(): Promise<AdPlacement[]> {
  try {
    const rows = await prisma.adConfig.findMany({ orderBy: { updatedAt: "asc" } });
    if (rows.length === 0) {
      await prisma.adConfig.createMany({
        data: PLACEMENTS.map((p) => ({
          id: p.id,
          type: p.type,
          network: p.network,
          code: p.code,
          location: p.location,
          isActive: p.isActive,
          width: p.dimensions?.width ?? null,
          height: p.dimensions?.height ?? null,
          renderMode: p.renderMode ?? null,
        })),
      });
      return PLACEMENTS;
    }
    return rows.map(adConfigToPlacement);
  } catch (e) {
    logError(e);
    return PLACEMENTS;
  }
}

export async function shouldShowAdsForUser(userId?: string | null): Promise<boolean> {
  if (!userId) return true;
  try {
    const sub = await prisma.subscription.findUnique({
      where: { userId },
      select: { plan: true, status: true },
    });
    if (sub && sub.plan !== "free" && sub.status === "active") return false;
  } catch (e) { logError(e); }
  return true;
}

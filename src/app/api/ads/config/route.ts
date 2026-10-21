import { NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { getLiveAdConfig } from "@/lib/ad-config";

export const revalidate = 86400;

async function GET_inner() {
  try {
    const placements = await getLiveAdConfig();
    return NextResponse.json({
      placements: placements.map((p) => ({
        id: p.id,
        type: p.type,
        network: p.network,
        location: p.location,
        isActive: p.isActive,
        dimensions: p.dimensions ?? null,
        renderMode: p.renderMode ?? null,
        code: p.code,
      })),
      timestamp: Date.now(),
    });
  } catch {
    return NextResponse.json({ placements: [] }, { status: 500 });
  }
}


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}

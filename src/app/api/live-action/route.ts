import { NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { getAllLiveAction } from "@/lib/live-action-data";
export const revalidate = 86400;

async function GET_inner() {
  try {
    const data = await getAllLiveAction();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/live-action] Error:", error);
    return NextResponse.json(await import("@/lib/live-action-anime").then((m) => m.LIVE_ACTION_ANIME));
  }
}


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}

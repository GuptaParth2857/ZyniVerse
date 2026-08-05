import { NextResponse } from "next/server";
import { getAllLiveAction } from "@/lib/live-action-data";
export const revalidate = 3600;

export async function GET() {
  try {
    const data = await getAllLiveAction();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/live-action] Error:", error);
    return NextResponse.json(await import("@/lib/live-action-anime").then((m) => m.LIVE_ACTION_ANIME));
  }
}

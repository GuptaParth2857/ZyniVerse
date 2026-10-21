import { NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { getAllWidgets } from "@/lib/widget-registry";

async function GET_inner() {
  const widgets = getAllWidgets();
  return NextResponse.json({ widgets, version: "1.0.0", generatedAt: new Date().toISOString() });
}


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}

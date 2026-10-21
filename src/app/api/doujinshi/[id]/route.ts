import { NextRequest, NextResponse } from "next/server";
import { withPublicCache } from "@/lib/api-cache";
import { getDoujinshiById } from "@/lib/mangadex-api";

async function GET_inner(_req: NextRequest,
  { params }: { params: Promise<{ id: string }> },) {
  const { id } = await params;
  const entry = await getDoujinshiById(id);
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ entry });
}


export async function GET(...args: Parameters<typeof GET_inner>) {
  const res = await GET_inner(...args);
  return withPublicCache(res);
}

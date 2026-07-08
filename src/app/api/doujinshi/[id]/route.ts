import { NextRequest, NextResponse } from "next/server";
import { getDynamicDoujinshiById } from "@/lib/doujinshi-data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const entry = await getDynamicDoujinshiById(id);

  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ entry });
}

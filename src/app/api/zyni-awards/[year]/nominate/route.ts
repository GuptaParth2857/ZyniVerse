import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { nominateMedia } from "@/lib/zyni-awards";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { year: yearStr } = await params;
  const year = Number(yearStr);
  const { category, mediaId, title, image } = await req.json();

  if (!category || !mediaId || !title) {
    return NextResponse.json({ error: "category, mediaId, title required" }, { status: 400 });
  }

  try {
    const nomineeId = await nominateMedia(year, category, mediaId, title, image);
    return NextResponse.json({ nomineeId });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { imageUrl } = await req.json();
  if (!imageUrl) {
    return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
  }

  const urlPattern = /^https?:\/\/.+/i;
  if (!urlPattern.test(imageUrl)) {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  }

  return NextResponse.json({ imageUrl, message: "Image URL validated" });
}

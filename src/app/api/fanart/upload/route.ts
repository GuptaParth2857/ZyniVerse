import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split(".").pop() || "jpg";
  const filename = `fanart/${session.user.id}/${Date.now()}.${ext}`;

  const { put } = await import("@vercel/blob");
  const blob = await put(filename, buffer, {
    access: "public",
    contentType: file.type || "image/jpeg",
  });

  return NextResponse.json({ url: blob.url });
}

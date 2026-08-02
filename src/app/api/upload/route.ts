import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { auth } from "@/lib/auth";
import { apiLimiter } from "@/lib/rate-limiter";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: NextRequest) {
  const rateCheck = apiLimiter.middleware(req);
  if (rateCheck) return rateCheck;

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, WEBP, or GIF images are allowed" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
  }

  const ext = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "gif";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, name), buffer);

  return NextResponse.json({ url: `/uploads/${name}` }, { status: 201 });
}

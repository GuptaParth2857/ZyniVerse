import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isR2Configured, r2Put, r2PublicUrl } from "@/lib/r2";
import { apiLimiter } from "@/lib/rate-limiter";
import sharp from "sharp";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const rateLimited = await apiLimiter.middleware(req);
    if (rateLimited) return rateLimited;

    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Use JPG, PNG, WebP, or GIF." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
    }

    const raw = Buffer.from(await file.arrayBuffer());
    // Downscale + re-encode every upload so galleries never ship multi-MB
    // originals (cards are ~300px wide but uploads can be 5MB).
    let body = raw;
    let ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    let contentType = file.type;
    try {
      body = await sharp(raw, { animated: true })
        .rotate()
        .resize({ width: 1600, withoutEnlargement: true, fit: "inside" })
        .webp({ quality: 80 })
        .toBuffer();
      ext = "webp";
      contentType = "image/webp";
    } catch {
      // Fall back to the original bytes if sharp can't decode the file.
    }

    const timestamp = Date.now();
    const path = `cosplay/${session.user.id}-${timestamp}.${ext}`;

    if (isR2Configured()) {
      await r2Put(path, body, contentType);
      return NextResponse.json({ url: r2PublicUrl(path) });
    }

    const supabase = getSupabaseAdmin();
    const BUCKET = "profiles";

    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find((b) => b.name === BUCKET)) {
      await supabase.storage.createBucket(BUCKET, { public: true });
    }

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, body, { upsert: false, contentType, cacheControl: '31536000' });

    if (uploadError) {
      console.error("[/api/cosplay/upload] Supabase error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    console.error("[/api/cosplay/upload] error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

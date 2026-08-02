import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB — Supabase free plan storage limit
const BUCKET = "reels";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const thumbnail = formData.get("thumbnail") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use MP4, WebM, or MOV." },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Max 50MB (Supabase free plan limit)." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find((b) => b.name === BUCKET)) {
      await supabase.storage.createBucket(BUCKET, { public: true });
    }

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 50);
    const ext = file.name.split(".").pop() || "mp4";
    const path = `${session.user.id}/${timestamp}-${safeName}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type });

    if (uploadError) {
      console.error("[/api/upload/reel] Supabase error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: video } = supabase.storage.from(BUCKET).getPublicUrl(path);

    let thumbnailUrl: string | null = null;
    if (thumbnail) {
      const thumbExt = thumbnail.name.split(".").pop() || "jpg";
      const thumbPath = `${session.user.id}/${timestamp}-thumb.${thumbExt}`;
      const { error: thumbError } = await supabase.storage
        .from(BUCKET)
        .upload(thumbPath, thumbnail, { upsert: false, contentType: thumbnail.type });
      if (!thumbError) {
        const { data: t } = supabase.storage.from(BUCKET).getPublicUrl(thumbPath);
        thumbnailUrl = t.publicUrl;
      }
    }

    return NextResponse.json({
      url: video.publicUrl,
      thumbnailUrl,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("[/api/upload/reel] error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

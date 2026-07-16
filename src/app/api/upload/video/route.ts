import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const ALLOWED_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-msvideo",
];
const MAX_SIZE = 200 * 1024 * 1024; // 200MB
const BUCKET = "profiles";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const partyId = formData.get("partyId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use MP4, WebM, OGG, or MOV." },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 200MB." },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() || "mp4";
    const id = partyId || session.user.id;
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 50);
    const path = `watch-party-videos/${id}-${timestamp}-${safeName}.${ext}`;

    const supabase = getSupabaseAdmin();

    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find((b) => b.name === BUCKET)) {
      await supabase.storage.createBucket(BUCKET, { public: true });
    }

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type });

    if (uploadError) {
      console.error("[/api/upload/video] Supabase error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({
      url: data.publicUrl,
      videoType: ext === "mp4" ? "mp4" : ext === "webm" ? "webm" : "mp4",
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("[/api/upload/video] error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

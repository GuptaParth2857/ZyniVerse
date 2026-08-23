import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isR2Configured, r2PresignedPutUrl, r2PublicUrl } from "@/lib/r2";

const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const BUCKET = "reels";

function buildPaths(userId: string, fileName: string) {
  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 50);
  const ext = (fileName.split(".").pop() || "mp4").slice(0, 10);
  return {
    videoPath: `${userId}/${timestamp}-${safeName}.${ext}`,
    thumbPath: `${userId}/${timestamp}-thumb.jpg`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const fileName = typeof body.fileName === "string" ? body.fileName : "";
    const fileType = typeof body.fileType === "string" ? body.fileType : "";
    const fileSize = typeof body.fileSize === "number" ? body.fileSize : 0;
    const needThumbnail = body.needThumbnail === true;

    if (!fileName) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: "Invalid file type. Use MP4, WebM, or MOV." },
        { status: 400 }
      );
    }
    if (fileSize > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Max 50MB." }, { status: 400 });
    }

    const { videoPath, thumbPath } = buildPaths(session.user.id, fileName);

    if (isR2Configured()) {
      const signedUrl = await r2PresignedPutUrl(videoPath, fileType);
      const thumb = needThumbnail
        ? {
            path: thumbPath,
            signedUrl: await r2PresignedPutUrl(thumbPath, "image/jpeg"),
            publicUrl: r2PublicUrl(thumbPath),
          }
        : null;
      return NextResponse.json({
        mode: "r2",
        path: videoPath,
        signedUrl,
        publicUrl: r2PublicUrl(videoPath),
        thumb,
      });
    }

    const supabase = getSupabaseAdmin();

    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find((b) => b.name === BUCKET)) {
      await supabase.storage.createBucket(BUCKET, { public: true });
    }

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(videoPath);

    if (error || !data) {
      console.error("[/api/upload/reel/presign] sign error:", error);
      return NextResponse.json({ error: "Failed to create upload link" }, { status: 500 });
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(videoPath);

    let thumb: { path: string; token: string; publicUrl: string } | null = null;
    if (needThumbnail) {
      const { data: thumbData, error: thumbError } = await supabase.storage
        .from(BUCKET)
        .createSignedUploadUrl(thumbPath);
      if (!thumbError && thumbData) {
        const { data: thumbPub } = supabase.storage.from(BUCKET).getPublicUrl(thumbPath);
        thumb = { path: thumbData.path, token: thumbData.token, publicUrl: thumbPub.publicUrl };
      }
    }

    return NextResponse.json({
      mode: "supabase",
      path: data.path,
      token: data.token,
      signedUrl: data.signedUrl,
      publicUrl: pub.publicUrl,
      thumb,
    });
  } catch (error) {
    console.error("[/api/upload/reel/presign] error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

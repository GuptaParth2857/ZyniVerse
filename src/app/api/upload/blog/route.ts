import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Invalid file type. Use JPG, PNG, WebP, or GIF." }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });

    const ext = file.name.split(".").pop() || "jpg";
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const path = `blog/${session.user.id}/${uniqueId}.${ext}`;

    const supabase = getSupabaseAdmin();
    const BUCKET = "profiles";

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false, contentType: file.type });

    if (uploadError) {
      console.error("[/api/upload/blog] Supabase error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    console.error("[/api/upload/blog] error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

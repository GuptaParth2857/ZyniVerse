import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isR2Configured, r2Put, r2PublicUrl } from "@/lib/r2";
import { apiLimiter } from "@/lib/rate-limiter";
import { logError } from "@/lib/logger";
import { submitToIndexNow } from "@/lib/indexnow";

export const runtime = "nodejs";

const MAX_MEDIA = 50 * 1024 * 1024;
const BUCKET_POSTERS = "posters";
const BUCKET_REELS = "reels";
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function isAuthorized(req: NextRequest): boolean {
  const token = process.env.INGEST_TOKEN || process.env.CRON_SECRET;
  if (!token) return false;
  const provided = req.headers.get("x-ingest-token");
  if (!provided) return false;
  try {
    return token === provided;
  } catch {
    return false;
  }
}

interface IngestBody {
  kind?: string;
  handle?: string;
  postUrl?: string;
  image?: string;
  video?: string;
  title?: string;
  content?: string;
  type?: string;
  ownerUsername?: string;
}

async function uploadToStorage(key: string, buffer: Buffer, contentType: string, bucket: string): Promise<string> {
  if (isR2Configured()) {
    await r2Put(key, buffer, contentType);
    return r2PublicUrl(key);
  }
  const supabase = getSupabaseAdmin();
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find((b) => b.name === bucket)) {
    await supabase.storage.createBucket(bucket, { public: true });
  }
  const { error } = await supabase.storage
    .from(bucket)
    .upload(key, buffer, { contentType, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(`storage upload failed: ${error.message}`);
  return supabase.storage.from(bucket).getPublicUrl(key).data.publicUrl;
}

async function fetchMedia(url: string, allowedPrefix: string): Promise<{ buffer: Buffer; contentType: string }> {
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "user-agent": BROWSER_UA },
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`media fetch failed: ${res.status}`);
  const contentType = (res.headers.get("content-type") || "application/octet-stream").split(";")[0].toLowerCase();
  if (!contentType.startsWith(allowedPrefix)) {
    throw new Error(`unexpected media type: ${contentType}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength > MAX_MEDIA) throw new Error(`media too large (${Math.round(buffer.byteLength / 1048576)}MB)`);
  return { buffer, contentType };
}

export async function POST(req: NextRequest) {
  try {
    const rateCheck = await apiLimiter.middleware(req);
    if (rateCheck) return rateCheck;

    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as IngestBody;
    const handle = typeof body.handle === "string" ? body.handle.trim().replace(/^@/, "") : "";
    const kind = body.kind === "reel" ? "reel" : "post";
    if (!handle) {
      return NextResponse.json({ error: "handle is required" }, { status: 400 });
    }

    const ownerUsername = body.ownerUsername || process.env.INGEST_OWNER_USERNAME || "parthgupta";
    const owner = await prisma.user.findUnique({ where: { username: ownerUsername } });
    if (!owner) {
      return NextResponse.json({ error: `owner "${ownerUsername}" not found` }, { status: 400 });
    }

    const postUrl = typeof body.postUrl === "string" && body.postUrl.trim() ? body.postUrl.trim() : "";
    const title = (body.title || "").trim().slice(0, 300);
    let content = (body.content || "").trim().slice(0, 20000);
    const credit = `\n\n◉ Shared from @${handle} on Instagram · reposted with permission.`;

    if (kind === "reel") {
      const videoUrl = typeof body.video === "string" && body.video.trim() ? body.video.trim() : "";
      if (!videoUrl) {
        return NextResponse.json({ error: "video url required for reels" }, { status: 400 });
      }

      if (postUrl) {
        const existing = await prisma.reel.findFirst({ where: { caption: { contains: postUrl } }, select: { id: true } });
        if (existing) return NextResponse.json({ ok: true, duplicate: true, id: existing.id });
      }

      const { buffer, contentType } = await fetchMedia(videoUrl, "video/");
      const ext = (contentType.split("/")[1] || "mp4").replace(/[^a-z0-9]/gi, "").slice(0, 8);
      const key = `${owner.id}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext || "mp4"}`;
      const videoFileUrl = await uploadToStorage(key, buffer, contentType, BUCKET_REELS);

      const caption = [(title || `New reel from @${handle}`), content, postUrl ? `\n\nSource: ${postUrl}` : "", credit]
        .filter(Boolean)
        .join("\n")
        .slice(0, 500);

      const reel = await prisma.reel.create({
        data: { userId: owner.id, videoUrl: videoFileUrl, caption, duration: 0 },
        select: { id: true },
      });
      return NextResponse.json({ ok: true, kind: "reel", id: reel.id, url: `/reels?reel=${reel.id}` }, { status: 201 });
    }

    const imageUrl = typeof body.image === "string" && body.image.trim() ? body.image.trim() : "";
    if (!imageUrl) {
      return NextResponse.json({ error: "image url required for posts" }, { status: 400 });
    }

    if (postUrl) {
      const existing = await prisma.post.findFirst({ where: { content: { contains: postUrl } }, select: { id: true } });
      if (existing) return NextResponse.json({ ok: true, duplicate: true, id: existing.id });
    }

    const { buffer, contentType } = await fetchMedia(imageUrl, "image/");
    const ext = (contentType.split("/")[1] || "jpg").replace(/[^a-z0-9]/gi, "").slice(0, 8);
    const key = `${owner.id}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext || "jpg"}`;
    const hostedImageUrl = await uploadToStorage(key, buffer, contentType, BUCKET_POSTERS);

    content = [(title || `Post from @${handle}`), content, postUrl ? `\n\nSource: ${postUrl}` : "", credit]
      .filter(Boolean)
      .join("\n")
      .slice(0, 20000);

    const type = typeof body.type === "string" && body.type.trim() ? body.type.trim() : "POSTER_COLLAB";

    const post = await prisma.post.create({
      data: {
        userId: owner.id,
        type,
        title: title || `Post from @${handle}`,
        content,
        image: hostedImageUrl,
      },
      select: { id: true },
    });

    await submitToIndexNow(`/posts/${post.id}`);
    return NextResponse.json({ ok: true, kind: "post", id: post.id, url: `/posts/${post.id}` }, { status: 201 });
  } catch (e) {
    const err = e as Error;
    if (/media fetch failed|unexpected media type|media too large|storage upload failed/.test(err.message || "")) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    logError(e);
    return NextResponse.json({ error: "Failed to ingest" }, { status: 500 });
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { Allow: "POST, OPTIONS" } });
}
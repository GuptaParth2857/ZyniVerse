import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isR2Configured, r2Put, r2PublicUrl } from "@/lib/r2";
import { invalidateReelsFeed } from "@/lib/reels-feed";
import { logError } from "@/lib/logger";
import { validateWebhookUrl } from "@/lib/webhook-ssrf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_SIZE = 50 * 1024 * 1024; // 50MB — Supabase free plan storage limit
const MAX_DURATION = 180;
const BUCKET = "reels";
const DOWNLOAD_TIMEOUT_MS = 150_000;

// yt-dlp writes to the fixed `video.%(ext)s` template, so probe the handful of
// extensions it may produce. Using `readdir` here would make the bundler trace
// the whole project (dynamic directory access), so we stat known names instead.
const VIDEO_NAMES = ["video.mp4", "video.webm", "video.mkv", "video.mov"];
const THUMB_NAMES = ["video.jpg", "video.jpeg", "video.png", "video.webp"];
const INFO_NAMES = ["video.info.json"];

/** First of `names` that exists in `dir`, or null. */
async function firstExisting(
  dir: string,
  names: string[],
): Promise<string | null> {
  for (const name of names) {
    const path = join(dir, name);
    try {
      await stat(/*turbopackIgnore: true*/ path);
      return path;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

/**
 * Server-side link import for the reel uploader.
 *
 * Only enabled when `YTDLP_PATH` is set (self-hosted / VM deploys). It shells
 * out to yt-dlp to fetch a page link (YouTube, Instagram, TikTok, ...), then
 * stores the file in our own bucket and creates the reel. `FFMPEG_PATH` is
 * optional but recommended — it enables stream merging + thumbnail conversion.
 *
 * Vercel serverless has neither the binary nor the request budget, so the
 * route stays disabled there by default.
 */
function run(
  cmd: string,
  args: string[],
  timeoutMs: number,
): Promise<{ code: number | null; err: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { windowsHide: true });
    let err = "";
    const timer = setTimeout(() => child.kill("SIGKILL"), timeoutMs);
    child.stderr.on("data", (d: Buffer) => {
      err += d.toString();
    });
    child.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, err });
    });
  });
}

/** Best-effort duration probe via `ffmpeg -i` (prints to stderr, exits 1). */
async function probeDuration(ffmpeg: string, file: string): Promise<number> {
  try {
    const { err } = await run(ffmpeg, ["-i", file], 30_000);
    const m = err.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (!m) return 0;
    return Math.round(Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]));
  } catch {
    return 0;
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ytdlp = process.env.YTDLP_PATH;
  if (!ytdlp) {
    return NextResponse.json(
      { error: "Link import is not enabled on this server." },
      { status: 501 },
    );
  }
  const ffmpeg = process.env.FFMPEG_PATH || "";

  let dir = "";
  try {
    const body = await req.json();
    const url = typeof body.url === "string" ? body.url.trim() : "";
    const caption =
      typeof body.caption === "string" && body.caption
        ? body.caption.slice(0, 500)
        : null;
    const animeId = Number.isInteger(body.animeId)
      ? (body.animeId as number)
      : null;
    const animeTitle =
      typeof body.animeTitle === "string" && body.animeTitle
        ? body.animeTitle.slice(0, 120)
        : null;

    if (!url) {
      return NextResponse.json({ error: "url required" }, { status: 400 });
    }

    // SSRF guard: block localhost / private / reserved targets.
    const check = await validateWebhookUrl(url);
    if (!check.ok) {
      return NextResponse.json({ error: check.reason }, { status: 400 });
    }

    dir = await mkdtemp(join(tmpdir(), "reel-import-"));

    const args = [
      "--no-warnings",
      "--no-playlist",
      "--no-progress",
      "--max-filesize",
      "50M",
      "--write-info-json",
      "--write-thumbnail",
      "-o",
      join(dir, "video.%(ext)s"),
    ];
    if (ffmpeg) {
      args.push(
        "--ffmpeg-location",
        ffmpeg,
        "--convert-thumbnails",
        "jpg",
        "-f",
        "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b",
        "--merge-output-format",
        "mp4",
      );
    } else {
      args.push("-f", "b[ext=mp4]/b");
    }
    args.push(url);

    const res = await run(ytdlp, args, DOWNLOAD_TIMEOUT_MS);
    if (res.code !== 0) {
      logError(new Error("yt-dlp failed"), "reels/import", {
        code: res.code,
        err: res.err.slice(-600),
      });
      return NextResponse.json(
        { error: "Could not download this link. Check the URL and try again." },
        { status: 502 },
      );
    }

    const videoFile = await firstExisting(dir, VIDEO_NAMES);
    if (!videoFile) {
      return NextResponse.json(
        { error: "This link did not produce a video file." },
        { status: 502 },
      );
    }
    const thumbFile = await firstExisting(dir, THUMB_NAMES);
    const infoFile = await firstExisting(dir, INFO_NAMES);

    const size = (await stat(/*turbopackIgnore: true*/ videoFile)).size;
    if (size > MAX_SIZE) {
      return NextResponse.json(
        {
          error: `Video is too large (${Math.round(size / 1024 / 1024)}MB). Max 50MB.`,
        },
        { status: 400 },
      );
    }

    let duration = 0;
    if (infoFile) {
      try {
        const info = JSON.parse(
          await readFile(/*turbopackIgnore: true*/ infoFile, "utf8"),
        ) as {
          duration?: number;
        };
        if (info.duration && Number.isFinite(info.duration)) {
          duration = Math.round(info.duration);
        }
      } catch {
        // ignore malformed info json
      }
    }
    if (duration <= 0 && ffmpeg)
      duration = await probeDuration(ffmpeg, videoFile);
    duration = Math.max(0, Math.min(MAX_DURATION, duration));

    const videoBuf = await readFile(/*turbopackIgnore: true*/ videoFile);
    let thumbBuf: Buffer | null = null;
    let thumbExt = "jpg";
    let thumbType = "image/jpeg";
    if (thumbFile) {
      thumbBuf = await readFile(/*turbopackIgnore: true*/ thumbFile);
      thumbExt = (thumbFile.split(".").pop() || "jpg").toLowerCase();
      thumbType =
        thumbExt === "png"
          ? "image/png"
          : thumbExt === "webp"
            ? "image/webp"
            : "image/jpeg";
    }

    const ts = Date.now();
    const videoKey = `${session.user.id}/${ts}-import.mp4`;
    const thumbKey = `${session.user.id}/${ts}-thumb.${thumbExt}`;

    let videoUrl: string;
    let thumbnailUrl: string | null = null;

    if (isR2Configured()) {
      await r2Put(videoKey, videoBuf, "video/mp4");
      videoUrl = r2PublicUrl(videoKey);
      if (thumbBuf) {
        await r2Put(thumbKey, thumbBuf, thumbType);
        thumbnailUrl = r2PublicUrl(thumbKey);
      }
    } else {
      const supabase = getSupabaseAdmin();
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(videoKey, videoBuf, {
          upsert: false,
          contentType: "video/mp4",
          cacheControl: "31536000",
        });
      if (uploadError) throw new Error(uploadError.message);
      videoUrl = supabase.storage.from(BUCKET).getPublicUrl(videoKey)
        .data.publicUrl;
      if (thumbBuf) {
        const { error: thumbError } = await supabase.storage
          .from(BUCKET)
          .upload(thumbKey, thumbBuf, {
            upsert: false,
            contentType: thumbType,
            cacheControl: "31536000",
          });
        if (!thumbError) {
          thumbnailUrl = supabase.storage.from(BUCKET).getPublicUrl(thumbKey)
            .data.publicUrl;
        }
      }
    }

    const reel = await prisma.reel.create({
      data: {
        userId: session.user.id,
        videoUrl,
        thumbnailUrl,
        caption,
        duration,
        animeId,
        animeTitle,
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    invalidateReelsFeed();
    revalidatePath("/reels");
    if (reel.animeId) revalidatePath(`/anime/${reel.animeId}`);

    return NextResponse.json(
      {
        id: reel.id,
        videoUrl: reel.videoUrl,
        thumbnailUrl: reel.thumbnailUrl,
        caption: reel.caption,
        duration: reel.duration,
        animeId: reel.animeId,
        animeTitle: reel.animeTitle,
        createdAt: reel.createdAt,
        user: reel.user,
      },
      { status: 201 },
    );
  } catch (e) {
    logError(e, "reels/import");
    return NextResponse.json(
      { error: "Import failed. Please try again." },
      { status: 500 },
    );
  } finally {
    if (dir) {
      await rm(dir, { recursive: true, force: true }).catch(() => undefined);
    }
  }
}
